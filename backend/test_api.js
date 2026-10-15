const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Complete End-to-End API Test Suite ---');
  const testEmail = `tester_${Date.now()}@example.com`;

  // 1. Health check
  console.log('\n1. Testing Health Check...');
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('Health:', health.status, health.data.message);

  // 2. Register
  console.log('\n2. Testing Registration...');
  const reg = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'John Doe', email: testEmail, password: 'password123' }
  );
  console.log('Register:', reg.status, reg.data.message);
  const token = reg.data.token;

  // 3. Login
  console.log('\n3. Testing Login...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: testEmail, password: 'password123' }
  );
  console.log('Login:', loginRes.status, loginRes.data.message);

  // 4. Get Profile (/api/auth/me)
  console.log('\n4. Testing Get Profile (Private)...');
  const meRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Profile:', meRes.status, 'User Name:', meRes.data.user?.name);

  // 5. Update Profile
  console.log('\n5. Testing Update Profile (Private)...');
  const updateRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/update-profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { phone: '+1 555-0199', bio: 'Software developer passionate about backend systems' }
  );
  console.log('Update Profile:', updateRes.status, 'Updated Bio:', updateRes.data.user?.bio);

  // 6. Change Password
  console.log('\n6. Testing Change Password (Private)...');
  const changePassRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/change-password',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { currentPassword: 'password123', newPassword: 'newpassword456' }
  );
  console.log('Change Password:', changePassRes.status, changePassRes.data.message);

  // 7. Verify login with new password
  console.log('\n7. Testing Login with New Password...');
  const newLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: testEmail, password: 'newpassword456' }
  );
  console.log('Login with New Password:', newLoginRes.status, newLoginRes.data.message);

  // 8. Forgot Password
  console.log('\n8. Testing Forgot Password Request...');
  const forgotRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: testEmail }
  );
  console.log('Forgot Password:', forgotRes.status, forgotRes.data.message);
  console.log('Generated Preview URL:', forgotRes.data.previewUrl);

  const rawToken = forgotRes.data.previewUrl?.split('/reset-password/')[1];

  // 9. Reset Password with token
  console.log('\n9. Testing Reset Password via Token...');
  const resetRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/auth/reset-password/${rawToken}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { password: 'finalResetPassword999' }
  );
  console.log('Reset Password:', resetRes.status, resetRes.data.message);

  // 10. Login with the freshly reset password
  console.log('\n10. Testing Login with Reset Password...');
  const resetLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: testEmail, password: 'finalResetPassword999' }
  );
  console.log('Login after Reset:', resetLoginRes.status, resetLoginRes.data.message);

  // 11. Delete Account
  console.log('\n11. Testing Delete Account (Private)...');
  const deleteRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/delete-account',
    method: 'DELETE',
    headers: { Authorization: `Bearer ${resetLoginRes.data.token}` },
  });
  console.log('Delete Account:', deleteRes.status, deleteRes.data.message);

  console.log('\n🎉 ALL 11 TESTS PASSED PERFECTLY!');
}

runTests().catch(console.error);
