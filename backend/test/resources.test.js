const assert = require('node:assert/strict');
const { test } = require('node:test');
const Resource = require('../models/Resource');
const controller = require('../controllers/resourceController');
const { requireTeacher } = require('../middleware/teacher');

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

const query = (value, chain = []) => ({
  chain,
  sort(value) { this.chain.push(['sort', value]); return this; },
  skip(value) { this.chain.push(['skip', value]); return this; },
  limit(value) { this.chain.push(['limit', value]); return this; },
  populate(value) { this.chain.push(['populate', value]); return this; },
  then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
});

test('resource model requires academic metadata, type, file, and uploader', async () => {
  const model = new Resource({
    title: 'Unit 1 Notes',
    subject: 'Mathematics',
    topic: 'Differential equations',
    type: 'notes',
    s3Key: 'resources/teacher/unit-1.pdf',
    originalFileName: 'unit-1.pdf',
    uploadedBy: '507f1f77bcf86cd799439011',
  });
  assert.equal(await model.validate(), undefined);

  const invalid = new Resource({ title: 'Invalid', type: 'video' });
  await assert.rejects(invalid.validate(), (error) => {
    assert.ok(error.errors.subject);
    assert.ok(error.errors.topic);
    assert.ok(error.errors.type);
    assert.ok(error.errors.s3Key);
    assert.ok(error.errors.uploadedBy);
    return true;
  });
});

test('resource search applies filters and pagination before returning results', async (t) => {
  const records = [{ title: 'Differential Equations Notes' }];
  let filter;
  const calls = [];
  t.mock.method(Resource, 'find', (value) => {
    filter = value;
    return query(records, calls);
  });
  t.mock.method(Resource, 'countDocuments', async () => 17);
  const res = response();

  await controller.listResources({
    query: { q: 'math.*', subject: 'Engineering', type: 'pyq', page: '2', limit: '5' },
    user: { _id: 'teacher-id' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(filter.type, 'pyq');
  assert.equal(filter.subject.source, 'Engineering');
  assert.equal(filter.$or[0].title.source, 'math\\.\\*');
  assert.deepEqual(calls.find(([name]) => name === 'skip'), ['skip', 5]);
  assert.deepEqual(calls.find(([name]) => name === 'limit'), ['limit', 5]);
  assert.equal(res.body.pagination.total, 17);
  assert.equal(res.body.pagination.pages, 4);
});

test('students cannot reach teacher-only resource operations', () => {
  const res = response();
  let nextCalled = false;
  requireTeacher({ user: { role: 'student' } }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /authorized teachers/i);
});

test('teachers are allowed through teacher-only resource operations', () => {
  const res = response();
  let nextCalled = false;
  requireTeacher({ user: { role: 'teacher' } }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test('resource edit and delete cannot affect another teacher’s records', async (t) => {
  t.mock.method(Resource, 'findOne', async () => null);
  const editResponse = response();
  await controller.updateResource({
    params: { id: '507f1f77bcf86cd799439011' },
    body: { title: 'Changed title' },
    user: { _id: 'teacher-a' },
  }, editResponse);
  assert.equal(editResponse.statusCode, 404);

  const deleteResponse = response();
  await controller.deleteResource({
    params: { id: '507f1f77bcf86cd799439011' },
    user: { _id: 'teacher-a' },
  }, deleteResponse);
  assert.equal(deleteResponse.statusCode, 404);
});
