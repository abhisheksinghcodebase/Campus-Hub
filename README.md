# Campus Resource Hub

A full-stack academic resource library for students and teachers. Students can search and download course notes, previous-year question papers, and important questions. Authorized teachers can upload PDFs, stored directly in MongoDB using GridFS.

## Stack

- React 19, React Router, and Axios
- Node.js, Express, and MongoDB/Mongoose
- JWT authentication with student/teacher roles
- MongoDB GridFS for PDF storage (no cloud storage needed!)

## Run locally

Requirements: Node.js 18 or newer and MongoDB

1. Install dependencies from the project root:

   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Configure `backend/.env`:

   ```env
   MONGO_URI=mongodb://localhost:27017/loginsystem
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   TEACHER_EMAILS=teacher1@college.edu,teacher2@college.edu
   ```

   Preserve any existing email and Google OAuth settings.

3. Start MongoDB (if not already running)

4. Run the backend and frontend in separate terminals:

   ```bash
   npm run dev --prefix backend
   npm start --prefix frontend
   ```

   Backend: `http://localhost:5000`  
   Frontend: `http://localhost:3000`

The root `package.json` also provides `npm run server` and `npm run client`.

## Roles

Every new registration is a student by default. The backend compares the normalized account email with `TEACHER_EMAILS`; matching accounts receive teacher permissions. The client cannot choose a role, and all resource write operations are also checked by the server. Google sign-in applies the same allowlist.

## PDF Storage

- PDFs are stored directly in MongoDB using GridFS
- Maximum file size: 20 MB per PDF
- Files are split into chunks and stored efficiently
- No AWS account or cloud storage needed
- Direct streaming to browser for downloads

## Resource API

All resource endpoints require a JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/resources?q=&type=&page=&limit=` | Signed in | Search resources by title, description, subject, or topic; filter by type |
| `GET` | `/api/resources?mine=true` | Signed in | List resources published by the current user |
| `GET` | `/api/resources/:id/download` | Signed in | Stream PDF directly from database |
| `GET` | `/api/resources/stored-files` | Teacher | List PDF files in database |
| `POST` | `/api/resources/upload` | Teacher | Upload a PDF (`multipart/form-data`, field `file`) |
| `POST` | `/api/resources` | Teacher | Publish resource metadata for an uploaded PDF |
| `PATCH` | `/api/resources/:id` | Owner teacher | Edit resource metadata or replace its PDF |
| `DELETE` | `/api/resources/:id` | Owner teacher | Remove a resource record |

Resource types are `notes`, `pyq`, and `important-questions`. The resource catalog is stored in MongoDB; PDF bytes stay in GridFS.

## Existing authentication endpoints

The project includes email/password and Google sign-in, profile editing, password reset, and account deletion. See `backend/.env.example` for the configuration variable names.

## Tests

Run the project test suite from the root:

```bash
npm test
```

This runs backend tests (`node:test`) and headless Chromium browser flows (Playwright). The backend suite covers teacher allowlisting, login/token protection, resource model validation, search/pagination, and ownership checks. Browser tests mock API responses while covering student search/filter/PDF download and the teacher publish/edit/delete workflow; they do not verify live MongoDB/GridFS integration.

## Mobile Responsive

The application is fully optimized for mobile devices:
- Responsive grid layouts that adapt to screen size
- Touch-friendly buttons and controls
- Optimized font sizes with `clamp()` for all screen sizes
- Mobile-first navigation and forms
- Tested on phones, tablets, and desktops
