const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { getAccountRole } = require('../utils/teacherAccess');

process.env.JWT_SECRET = 'test-only-jwt-secret';
process.env.JWT_EXPIRE = '1h';

afterEach(() => {
  delete process.env.TEACHER_EMAILS;
});

const response = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('registration grants teacher role only to a backend-allowlisted email', async (t) => {
  process.env.TEACHER_EMAILS = 'teacher@college.edu';
  let createdUser;
  t.mock.method(User, 'findOne', async () => null);
  t.mock.method(User, 'create', async (data) => {
    createdUser = { ...data, _id: 'teacher-id', createdAt: new Date() };
    return createdUser;
  });
  const res = response();

  await authController.register({
    body: {
      name: 'Teacher',
      email: 'Teacher@College.edu',
      password: 'valid-password',
      role: 'student',
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdUser.role, 'teacher');
  assert.equal(res.body.user.role, 'teacher');
  assert.equal(res.body.token, jwt.sign({ id: 'teacher-id' }, process.env.JWT_SECRET, { expiresIn: '1h' }));
});

test('registration assigns student role to non-allowlisted emails', async (t) => {
  process.env.TEACHER_EMAILS = 'teacher@college.edu';
  let createdUser;
  t.mock.method(User, 'findOne', async () => null);
  t.mock.method(User, 'create', async (data) => {
    createdUser = { ...data, _id: 'student-id', createdAt: new Date() };
    return createdUser;
  });
  const res = response();

  await authController.register({
    body: { name: 'Student', email: 'student@college.edu', password: 'valid-password', role: 'teacher' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdUser.role, 'student');
  assert.equal(res.body.user.role, 'student');
});

test('allowlist matching ignores email case and surrounding spaces', () => {
  process.env.TEACHER_EMAILS = ' teacher@college.edu , faculty@college.edu ';
  assert.equal(getAccountRole(' Teacher@College.edu '), 'teacher');
  assert.equal(getAccountRole('other@college.edu'), 'student');
});

test('login promotes an allowlisted existing account and rejects a wrong password', async (t) => {
  process.env.TEACHER_EMAILS = 'teacher@college.edu';
  let saved = false;
  const user = {
    _id: 'legacy-teacher-id',
    name: 'Teacher',
    email: 'teacher@college.edu',
    role: 'student',
    matchPassword: async (password) => password === 'correct-password',
    save: async () => { saved = true; },
  };
  t.mock.method(User, 'findOne', () => ({ select: async () => user }));

  const wrongPassword = response();
  await authController.login({
    body: { email: user.email, password: 'incorrect-password' },
  }, wrongPassword);
  assert.equal(wrongPassword.statusCode, 401);
  assert.equal(saved, false);

  const success = response();
  await authController.login({
    body: { email: user.email, password: 'correct-password' },
  }, success);
  assert.equal(success.statusCode, 200);
  assert.equal(saved, true);
  assert.equal(success.body.user.role, 'teacher');
});

test('protected middleware rejects missing tokens and reconciles the role from the allowlist', async (t) => {
  process.env.TEACHER_EMAILS = 'teacher@college.edu';
  const noToken = response();
  await protect({ headers: {} }, noToken, () => assert.fail('next must not run without a token'));
  assert.equal(noToken.statusCode, 401);

  let saved = false;
  const user = {
    _id: 'protected-user-id',
    email: 'teacher@college.edu',
    role: 'student',
    save: async () => { saved = true; },
  };
  t.mock.method(User, 'findById', async () => user);
  const req = {
    headers: {
      authorization: `Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET)}`,
    },
  };
  const res = response();
  let nextCalled = false;
  await protect(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.user, user);
  assert.equal(user.role, 'teacher');
  assert.equal(saved, true);
});
