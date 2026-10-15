# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fast Setup

### 1. Prerequisites Check
```bash
node --version    # Should be v18+
mongod --version  # Should be v5+
```

### 2. Install & Configure
```bash
# Install dependencies
npm install --prefix backend
npm install --prefix frontend

# Configure backend
cd backend
cp .env.example .env
# Edit .env and set:
#   - MONGO_URI (if different from default)
#   - TEACHER_EMAILS (your email for teacher access)
#   - JWT_SECRET (any long random string)

# Configure frontend
cd ../frontend
cp .env.example .env
# Defaults work for local development
```

### 3. Start MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Run Application
```bash
# Terminal 1 - Backend
npm run dev --prefix backend

# Terminal 2 - Frontend
npm start --prefix frontend
```

### 5. Test It! 🎉
1. Open: http://localhost:3000
2. Click "Register"
3. Create account with your teacher email
4. Go to "Resources" page
5. You'll see the upload form (teacher view)!

---

## 📱 Test on Mobile

1. Press F12 in browser
2. Click device toggle icon (Ctrl+Shift+M)
3. Select iPhone or Android
4. Test the responsive layout!

---

## ✅ Verification

Run these quick tests:

```bash
# Test storage
cd backend
node test-storage.js
# Should see: ✅ ALL STORAGE TESTS PASSED!

# Test teacher access
node test-teacher-access.js
# Should see your email marked as TEACHER
```

---

## 🆘 Common Issues

**Port already in use?**
```bash
npx kill-port 5000
npx kill-port 3000
```

**MongoDB won't start?**
- Check if it's already running
- Try: `mongosh` to test connection

**Teacher features not showing?**
- Check your email in `backend/.env` TEACHER_EMAILS
- Restart backend after changing .env
- Logout and login again

---

## 📚 Full Documentation

- **SETUP.md** - Complete setup instructions
- **README.md** - API documentation  
- **CLEANUP-SUMMARY.md** - Technical details

---

**Ready to go! 🚀**
