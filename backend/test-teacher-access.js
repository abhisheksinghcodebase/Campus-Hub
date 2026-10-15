// Quick test script to verify teacher access configuration
require('dotenv').config({ path: './.env' });
const { getAccountRole } = require('./utils/teacherAccess');

console.log('\n========================================');
console.log('📧 TEACHER ACCESS VERIFICATION');
console.log('========================================\n');

console.log('📋 Configured Teacher Emails:');
console.log('   ', process.env.TEACHER_EMAILS ? '(configured)' : '(none)');
console.log();

// Test emails
const testEmails = [
  'teacher@college.edu',
  'student@college.edu',
  'random@example.com'
];

console.log('🧪 Testing Email Access:\n');
testEmails.forEach(email => {
  const role = getAccountRole(email);
  const icon = role === 'teacher' ? '👨‍🏫' : '👨‍🎓';
  console.log(`${icon} ${email} → ${role.toUpperCase()}`);
  console.log();
});

console.log('========================================\n');
