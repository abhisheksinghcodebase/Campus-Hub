const isTeacherEmail = (email) => {
  const teacherEmails = (process.env.TEACHER_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const isTeacher = teacherEmails.includes(normalizedEmail);
  
  // Debug logging to help troubleshoot
  console.log(`🔍 Teacher Access Check:`);
  console.log(`   Email: ${normalizedEmail}`);
  console.log(`   Configured Teachers: [${teacherEmails.join(', ')}]`);
  console.log(`   Is Teacher: ${isTeacher ? '✅ YES' : '❌ NO'}`);
  
  return isTeacher;
};

const getAccountRole = (email) => (isTeacherEmail(email) ? 'teacher' : 'student');

module.exports = { getAccountRole, isTeacherEmail };
