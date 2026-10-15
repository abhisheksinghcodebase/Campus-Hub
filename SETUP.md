# 🚀 Campus Resource Hub - Setup Guide

Complete setup instructions for getting the Campus Resource Hub running on your machine.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or newer) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or newer) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (for cloning the repository)

---

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Resource hub"
```

### 2. Install Dependencies

Install both backend and frontend dependencies:

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies  
npm install --prefix frontend
```

### 3. Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```env
# Server
PORT=5000

# MongoDB (adjust if your MongoDB runs on a different port)
MONGO_URI=mongodb://localhost:27017/loginsystem

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Client URL (for password reset links)
CLIENT_URL=http://localhost:3000

# Google OAuth (optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
Client_ID=your_google_client_id.apps.googleusercontent.com
Client_Secret=your_google_client_secret

# Teacher Access (comma-separated list)
TEACHER_EMAILS=teacher@college.edu,youremail@gmail.com
```

#### Frontend Configuration

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🎯 Configuration Details

### Teacher Access Setup

Teachers are identified by email. Add teacher emails to the `TEACHER_EMAILS` variable:

```env
TEACHER_EMAILS=teacher1@college.edu,teacher2@college.edu,professor@university.edu
```

**Important Notes:**
- Emails are case-insensitive
- Separate multiple emails with commas
- No spaces between emails
- Anyone NOT in this list will be a student

### Email Setup (for Password Reset)

#### Using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security
   - Select "2-Step Verification"
   - Scroll to "App passwords"
   - Generate a password for "Mail"
3. Use this app password in `EMAIL_PASS`

#### Using Other Email Services:

Change `EMAIL_SERVICE` to your provider (e.g., `outlook`, `yahoo`)

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3000`
   - `http://localhost:5000`
6. Add authorized redirect URIs:
   - `http://localhost:3000`
7. Copy Client ID and Client Secret to `.env` files

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

1. Install MongoDB Community Edition
2. Start MongoDB service:

**Windows:**
```bash
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

3. Verify MongoDB is running:
```bash
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/loginsystem
```

---

## ▶️ Running the Application

### Development Mode

Run backend and frontend simultaneously in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run dev --prefix backend
```

**Terminal 2 - Frontend:**
```bash
npm start --prefix frontend
```

### Alternative: Using Root Scripts

From the project root:

```bash
# Start backend
npm run server

# Start frontend (in another terminal)
npm run client
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 👥 First User Setup

### Register as Student

1. Go to http://localhost:3000/register
2. Fill in your details
3. Click "Create Account"
4. You'll be logged in as a student

### Register as Teacher

1. Add your email to `TEACHER_EMAILS` in `backend/.env`
2. Restart the backend server
3. Register or login with that email
4. You'll automatically get teacher permissions

---

## 🧪 Testing the Setup

### Test Storage System

```bash
cd backend
node test-storage.js
```

Expected output:
```
📦 Storage Backend: GRIDFS
✅ MongoDB Connected
📤 Testing PDF Upload... ✅
🔍 Verifying Uploaded File... ✅
📥 Testing File Download Stream... ✅
📋 Listing Stored Files... ✅
✅ ALL STORAGE TESTS PASSED!
```

### Test Teacher Access

```bash
cd backend
node test-teacher-access.js
```

Expected output:
```
👨‍🏫 youremail@gmail.com → TEACHER
👨‍🎓 random@example.com → STUDENT
```

### Run Full Test Suite

```bash
npm test
```

---

## 📱 Mobile Testing

The app is fully responsive. Test on:

### Browser Dev Tools
1. Open Chrome/Firefox DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different device sizes

### Physical Device
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update frontend `.env`: `REACT_APP_API_URL=http://YOUR_IP:5000/api`
3. Update backend `.env`: `CLIENT_URL=http://YOUR_IP:3000`
4. Access from phone: `http://YOUR_IP:3000`

---

## 🛠️ Troubleshooting

### MongoDB Connection Error

**Problem:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB service is running
- Check `MONGO_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/loginsystem` instead of `localhost`

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
- Kill process using port: `npx kill-port 5000`
- Change port in `backend/.env`: `PORT=5001`

### Frontend Can't Connect to Backend

**Problem:** Network errors in browser console

**Solutions:**
- Ensure backend is running
- Check `REACT_APP_API_URL` in `frontend/.env`
- Verify CORS settings in `backend/server.js`

### Teacher Permissions Not Working

**Problem:** Still showing as student after adding email

**Solutions:**
- Restart backend server after changing `TEACHER_EMAILS`
- Check email spelling and format
- Run `node test-teacher-access.js` to verify

### PDF Upload Fails

**Problem:** "Failed to upload PDF"

**Solutions:**
- Ensure MongoDB is running
- Check file is actually a PDF
- Verify file size is under 20 MB
- Check MongoDB has enough disk space

### Google Sign-In Not Working

**Problem:** "Google authentication failed"

**Solutions:**
- Verify `GOOGLE_CLIENT_ID` in both `.env` files
- Check authorized origins in Google Console
- Ensure `http://localhost:3000` is added
- Clear browser cache and cookies

---

## 📁 Project Structure

```
Resource hub/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions (GridFS, email, JWT)
│   ├── test/            # Backend tests
│   ├── .env             # Backend configuration
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # API calls
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth, Theme)
│   │   ├── pages/       # Page components
│   │   └── index.css    # Global styles
│   ├── public/          # Static files
│   ├── .env             # Frontend configuration
│   └── package.json     # Dependencies
└── README.md            # Project documentation
```

---

## 🎉 Success Checklist

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend opens in browser
- [ ] Can register a new account
- [ ] Can login with credentials
- [ ] Teacher email is in allowlist
- [ ] Teacher can see upload form
- [ ] Can upload a PDF
- [ ] Can download a PDF
- [ ] Mobile layout looks good

---

## 💡 Next Steps

After successful setup:

1. **Customize Teacher Emails** - Add real teacher emails
2. **Configure Email** - Set up real email for password reset
3. **Upload Resources** - Teachers can start uploading PDFs
4. **Test Mobile** - Check responsiveness on actual devices
5. **Deploy** (optional) - See deployment guide for production setup

---

## 🆘 Need Help?

- Check the [README.md](README.md) for API documentation
- Run test scripts to diagnose issues
- Check MongoDB logs: `mongod --dbpath /path/to/data`
- Check browser console for frontend errors
- Check terminal output for backend errors

---

**You're all set! 🚀 Happy coding!**
