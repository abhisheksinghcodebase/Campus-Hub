# Testing Guide - UI/UX Redesign

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
npm start
```
Server will run on: `http://localhost:5000`

### 2. Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

---

## 👥 Test Accounts

### Teacher Account
- **Email**: `teacher@example.edu` (add this to `TEACHER_EMAILS` for local testing)
- **Features**: Can upload, edit, and delete resources
- **UI Labels**: Teacher-specific headings and descriptions

### Student Account
- **Email**: Any email NOT in the teacher allowlist
- **Features**: Can browse and download resources
- **UI Labels**: Student-specific headings and descriptions

---

## ✅ Testing Checklist

### 1. Navbar Testing

#### Desktop (>768px)
- [ ] Logo appears on the left
- [ ] Navigation links visible in center ("My Resources" / "Browse Resources" based on role)
- [ ] Theme toggle button works (moon/sun icon)
- [ ] User badge shows avatar (or initial), name, and role
- [ ] Logout button visible and functional
- [ ] Active page is highlighted in navigation

#### Mobile (≤768px)
- [ ] Logo appears on the left
- [ ] Theme toggle button visible
- [ ] Hamburger menu icon appears on the right
- [ ] Clicking hamburger opens slide-out menu from right
- [ ] Menu shows user profile badge at top
- [ ] Navigation links are large and touch-friendly
- [ ] Active page is highlighted
- [ ] Logout button at bottom of menu
- [ ] Clicking overlay closes menu
- [ ] Clicking menu item closes menu and navigates

#### Both Sizes
- [ ] Theme toggle switches between light and dark mode
- [ ] All colors update properly in dark mode
- [ ] Navigation links change based on user role
- [ ] User avatar/initial displays correctly

---

### 2. Dashboard Page Testing

#### Desktop Layout
- [ ] Sidebar fixed on left side (280px width)
- [ ] User profile card at top of sidebar with avatar
- [ ] Name, email, and role badge display correctly
- [ ] Navigation buttons: View Profile, Edit Profile, Change Password, Delete Account
- [ ] Active tab is highlighted with purple background
- [ ] Main content area on right side
- [ ] Content scrolls independently

#### Mobile Layout (≤768px)
- [ ] Floating action button appears in bottom-right corner (⚙️ icon)
- [ ] Clicking button opens sidebar from left
- [ ] Overlay backdrop appears when sidebar is open
- [ ] Clicking overlay closes sidebar
- [ ] Sidebar slides smoothly with transition
- [ ] After selecting tab, sidebar closes automatically
- [ ] Main content fills full width

#### Profile Tab (👤 My Profile Information)
- [ ] Heading with emoji appears
- [ ] Description text below heading
- [ ] Avatar or initial displays on left
- [ ] Info rows display correctly:
  - Full Name
  - Email Address
  - Account Type (with role badge: 👨‍🏫 Teacher or 👨‍🎓 Student)
  - Sign-in Method (🌐 Google or ✉️ Email)
  - Phone Number
  - Bio
  - Member Since (formatted date)
- [ ] Role badge styled with purple background
- [ ] Info rows stack on mobile (<640px)

#### Edit Profile Tab (✏️ Edit Your Profile)
- [ ] Heading with emoji appears
- [ ] Description text below heading
- [ ] Avatar preview shows current image or initial
- [ ] "Upload Image" button works
- [ ] File input accepts images only
- [ ] "Remove" button clears selected image
- [ ] Name field pre-filled with current name
- [ ] Phone field accepts phone format
- [ ] Bio textarea with 250 character limit
- [ ] Character counter shows remaining characters
- [ ] "Save Changes" button enabled when form is valid
- [ ] Success message appears after saving
- [ ] Profile updates in sidebar and navbar

#### Change Password Tab (🔑 Change Password)
- [ ] Heading with emoji appears
- [ ] Description text below heading
- [ ] Current password field required
- [ ] New password field required (min 6 characters)
- [ ] Confirm password field required
- [ ] Validation error if passwords don't match
- [ ] Validation error if new password < 6 characters
- [ ] Success message after successful update
- [ ] Form clears after successful update

#### Delete Account Tab (🗑️ Delete Account)
- [ ] Heading with emoji appears
- [ ] Description text below heading
- [ ] Red danger box with warning icon
- [ ] Warning message clear and prominent
- [ ] List of items that will be deleted:
  - ✗ Your profile and personal information
  - ✗ All your uploaded resources (if teacher)
  - ✗ Your account history and activity
  - ✗ Access to all platform features
- [ ] List items styled with red theme
- [ ] Checkbox for confirmation required
- [ ] Delete button disabled until checkbox checked
- [ ] Delete button shows warning text
- [ ] Confirmation dialog appears before deletion
- [ ] Account deleted and redirected to login

---

### 3. Resources Page Testing

#### Teacher View

##### Header Section
- [ ] Eyebrow label: "TEACHER DASHBOARD"
- [ ] Main heading: "📚 Manage Your Resources"
- [ ] Intro text: "Upload, organize, and share educational content with your students."
- [ ] User badge shows name and "👨‍🏫 Teacher Account"

##### Upload Section (📤 UPLOAD CENTER)
- [ ] Section heading: "➕ Publish New Resource"
- [ ] Description: "Share your knowledge by uploading educational materials for students."
- [ ] Form fields:
  - Title (required, max 120 chars)
  - Subject (required, max 100 chars)
  - Topic/unit (required, max 100 chars)
  - Resource type (dropdown: Notes, Previous-year paper, Important questions)
  - Description (optional, max 1000 chars, spans full width)
- [ ] File upload field accepts PDF only
- [ ] "Choose an existing PDF" button works
- [ ] Dropdown appears with existing PDFs after clicking button
- [ ] "Load more" button appears if more files available
- [ ] Selected file name displays below form
- [ ] "Publish resource" button submits form
- [ ] Success message appears after publishing
- [ ] Form resets after successful submission

##### Edit Mode
- [ ] Clicking "Edit" on a resource card loads data into form
- [ ] Heading changes to "✏️ Edit Resource"
- [ ] Description updates for edit mode
- [ ] "Cancel" button appears next to heading
- [ ] Form pre-filled with resource data
- [ ] "Save changes" button replaces "Publish resource"
- [ ] Success message after saving
- [ ] Resource updates in list

##### Resource Library Section (📚 RESOURCE LIBRARY)
- [ ] Section heading: "All Published Resources"
- [ ] Description for teachers
- [ ] Badge shows "📝 X by you" (count of teacher's resources)
- [ ] Search input with magnifying glass icon
- [ ] Type filter dropdown
- [ ] Resource cards display in grid (3 columns on desktop)
- [ ] Each card shows:
  - Resource type badge (colored)
  - Date
  - Title
  - Subject · Topic
  - Description (if provided)
  - PDF filename
  - "Open PDF" button
  - "Edit" and "Delete" buttons (for teacher's own resources)
  - Uploader name at bottom
- [ ] "Open PDF" opens in new tab
- [ ] "Edit" loads resource into form at top
- [ ] "Delete" shows confirmation dialog
- [ ] Pagination shows if more than 12 resources
- [ ] Search filters results
- [ ] Type filter works correctly

##### My Publications Section (🎯 MY PUBLICATIONS)
- [ ] Section heading: "Manage Your Resources"
- [ ] Description for managing resources
- [ ] Shows only teacher's own resources
- [ ] All resource cards show "Edit" and "Delete" buttons
- [ ] Message if no resources published yet

#### Student View

##### Header Section
- [ ] Eyebrow label: "STUDENT PORTAL"
- [ ] Main heading: "🔍 Discover Learning Materials"
- [ ] Intro text: "Access course notes, previous-year papers, and important questions all in one place."
- [ ] User badge shows name and "👨‍🎓 Student Account"

##### Browse Section (🎓 AVAILABLE RESOURCES)
- [ ] Section heading: "Browse & Download"
- [ ] Description for students
- [ ] Search and filter work same as teacher view
- [ ] Resource cards show only "Open PDF" button
- [ ] No edit/delete buttons visible
- [ ] Pagination works correctly

##### No Upload Section
- [ ] Upload section not visible for students
- [ ] No "My Publications" section visible

#### Mobile Responsive (≤768px)
- [ ] Header elements stack vertically
- [ ] User badge aligns to the right or bottom
- [ ] Form fields stack in single column
- [ ] File upload controls stack vertically
- [ ] Buttons take full width
- [ ] Search and filter take full width
- [ ] Resource grid shows 2 columns on tablet
- [ ] Resource grid shows 1 column on mobile (≤640px)
- [ ] Resource card buttons stack vertically on mobile
- [ ] Touch targets are 44px+ for easy tapping
- [ ] No horizontal scrolling

---

## 🎨 Dark Mode Testing

### Toggle Functionality
- [ ] Button shows 🌙 in light mode
- [ ] Button shows ☀️ in dark mode
- [ ] Clicking toggles theme immediately
- [ ] Preference persists after page reload

### Component Testing in Dark Mode
- [ ] Navbar background and text colors correct
- [ ] All buttons styled correctly
- [ ] Cards and borders visible
- [ ] Forms readable and styled
- [ ] Alerts (success/error) styled correctly
- [ ] Sidebar styled correctly
- [ ] Resource cards readable
- [ ] Profile info readable
- [ ] Danger zone styled appropriately
- [ ] Shadows and borders adjusted for dark theme

---

## 🔄 Responsive Design Testing

### Breakpoints to Test
1. **Desktop**: 1920px, 1440px, 1280px
2. **Tablet**: 1024px, 768px
3. **Mobile**: 640px, 414px, 375px, 360px

### What to Check at Each Breakpoint
- [ ] Text is readable (not too small or too large)
- [ ] Buttons are touchable (44px minimum on mobile)
- [ ] Forms fit on screen without horizontal scroll
- [ ] Images/avatars scale appropriately
- [ ] Grid layouts adjust column count
- [ ] Navigation adapts (menu vs hamburger)
- [ ] Spacing feels comfortable
- [ ] No overlapping elements

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

---

## 🐛 Known Issues to Watch For

1. **Avatar Upload**: Uses base64 encoding - not recommended for production (consider using GridFS or external storage)
2. **File Selection**: Existing PDF dropdown may be slow with many files
3. **Mobile Safari**: Test theme toggle persistence
4. **Touch Events**: Test slide-out menus on actual touch devices

---

## 📊 Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Images/avatars load quickly
- [ ] Transitions are smooth (no lag)
- [ ] No layout shifts during load
- [ ] Theme toggle responds instantly
- [ ] Menu animations smooth on mobile

---

## ♿ Accessibility Testing

- [ ] Tab navigation works through all interactive elements
- [ ] Focus indicators visible on all inputs
- [ ] Buttons have accessible labels
- [ ] Forms have associated labels
- [ ] ARIA labels on icon buttons
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader can navigate page

---

## ✨ Feature Testing

### Registration
- [ ] Can register with email/password
- [ ] Can register with Google OAuth
- [ ] Teacher email gets teacher role automatically
- [ ] Non-teacher email gets student role
- [ ] Redirects to /resources after registration

### Login
- [ ] Can login with email/password
- [ ] Can login with Google OAuth
- [ ] Teacher redirects to /resources (not /dashboard)
- [ ] Student redirects to /resources
- [ ] Navbar shows correct role badge

### Resource Management (Teacher)
- [ ] Can upload PDF resource
- [ ] Can edit own resource
- [ ] Can delete own resource
- [ ] Cannot edit/delete other teacher's resources
- [ ] PDF opens in new tab correctly
- [ ] All fields validate correctly

### Resource Browsing (Student)
- [ ] Can view all resources
- [ ] Can search resources
- [ ] Can filter by type
- [ ] Can download/open PDFs
- [ ] Cannot see edit/delete buttons
- [ ] Cannot access upload form

### Profile Management
- [ ] Can view profile
- [ ] Can edit profile details
- [ ] Can change password
- [ ] Can delete account
- [ ] All changes persist

---

## 🎯 Edge Cases to Test

1. **Long text**: 
   - Very long names (20+ characters)
   - Very long email addresses
   - Very long resource titles
   - Very long descriptions

2. **Special characters**:
   - Emojis in name/bio
   - Special characters in titles
   - Unicode characters

3. **Empty states**:
   - No resources available
   - No search results
   - New user with no profile data

4. **Network issues**:
   - Slow connection
   - Failed API calls
   - Timeout scenarios

5. **Concurrent actions**:
   - Multiple tabs open
   - Editing from multiple devices

---

## 📸 Screenshots to Capture

For documentation, capture screenshots of:
1. Desktop navbar (light and dark mode)
2. Mobile menu open
3. Dashboard desktop layout
4. Dashboard mobile with sidebar open
5. Profile view tab
6. Edit profile tab
7. Danger zone
8. Resources page - teacher view
9. Resources page - student view
10. Resource cards on mobile
11. Upload form on mobile
12. Search and filter on mobile

---

## ✅ Final Checklist Before Production

- [ ] All tests passed
- [ ] No console errors
- [ ] No 404 errors for resources
- [ ] All images load
- [ ] All fonts load
- [ ] Theme persists correctly
- [ ] Logout works properly
- [ ] No data leaks between roles
- [ ] Mobile experience smooth
- [ ] Dark mode works everywhere
- [ ] All links work
- [ ] All buttons work
- [ ] Forms submit correctly
- [ ] Validation messages clear
- [ ] Error messages helpful

---

**Happy Testing! 🎉**

If you find any issues, please document:
- What you were doing
- What you expected to happen
- What actually happened
- Browser and device information
- Screenshots if applicable
