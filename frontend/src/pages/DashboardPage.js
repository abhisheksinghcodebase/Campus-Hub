import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from '../api/authApi';

// ─── Tab: Profile View ────────────────────────────────────────────────────────
const ProfileTab = ({ user }) => (
  <section className="tab-content">
    <h2>👤 My Profile Information</h2>
    <p className="tab-description">
      View your account details and membership information.
    </p>
    <div className="profile-grid">
      <div className="profile-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" />
        ) : (
          <div className="avatar-placeholder">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="profile-info">
        <div className="info-row"><span>Full Name</span><strong>{user.name}</strong></div>
        <div className="info-row"><span>Email Address</span><strong>{user.email}</strong></div>
        <div className="info-row">
          <span>Account Type</span>
          <strong className="role-badge">
            {user.role === 'teacher' ? '👨‍🏫 Teacher Account' : '👨‍🎓 Student Account'}
          </strong>
        </div>
        <div className="info-row">
          <span>Sign-in Method</span>
          <strong>{user.authProvider === 'google' ? '🌐 Google Account' : '✉️ Email & Password'}</strong>
        </div>
        <div className="info-row"><span>Phone Number</span><strong>{user.phone || 'Not provided'}</strong></div>
        <div className="info-row"><span>Bio</span><strong>{user.bio || 'No bio added'}</strong></div>
        <div className="info-row">
          <span>Member Since</span>
          <strong>{new Date(user.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</strong>
        </div>
      </div>
    </div>
  </section>
);

// ─── Tab: Edit Profile ────────────────────────────────────────────────────────
const EditProfileTab = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  });
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ error: 'Image must be less than 2MB', success: '' });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setStatus({ error: 'Please select a valid image file', success: '' });
      return;
    }
    
    // Convert to base64 for simplicity (in production, use file storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, avatar: reader.result }));
      setStatus({ error: '', success: '' }); // Clear any previous errors
    };
    reader.onerror = () => {
      setStatus({ error: 'Failed to read image file', success: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });
    setLoading(true);
    try {
      await updateProfile(form);
      await onUpdate(); // refresh user in context
      setStatus({ error: '', success: '✅ Profile updated successfully!' });
    } catch (err) {
      setStatus({ error: err.message, success: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tab-content">
      <h2>✏️ Edit Your Profile</h2>
      <p className="tab-description">
        Update your personal information and profile picture.
      </p>

      {status.error && <div className="alert alert-error">{status.error}</div>}
      {status.success && <div className="alert alert-success">{status.success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Avatar */}
        <div className="form-group">
          <label>Profile Picture <span style={{color: 'var(--color-muted)', fontWeight: 400, fontSize: '0.8rem'}}>(Max 2MB)</span></label>
          <div className="avatar-upload-row">
            {form.avatar ? (
              <img src={form.avatar} alt="preview" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder sm">{user.name?.charAt(0).toUpperCase()}</div>
            )}
            <input type="file" accept="image/*" onChange={handleAvatarFile} id="avatar-file" className="hidden" />
            <label htmlFor="avatar-file" className="btn btn-outline btn-sm">Upload Image</label>
            {form.avatar && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm((f) => ({ ...f, avatar: '' }))}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="+1 234 567 8900"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself…"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            maxLength={250}
          />
          <small className="char-count">{form.bio.length}/250</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </section>
  );
};

// ─── Tab: Change Password ─────────────────────────────────────────────────────
const ChangePasswordTab = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    if (form.newPassword !== form.confirm) {
      return setStatus({ error: 'New passwords do not match', success: '' });
    }
    if (form.newPassword.length < 6) {
      return setStatus({ error: 'New password must be at least 6 characters', success: '' });
    }

    setLoading(true);
    try {
      const data = await changePassword(form.currentPassword, form.newPassword);
      setStatus({ error: '', success: '✅ ' + data.message });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setStatus({ error: err.message, success: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tab-content">
      <h2>🔑 Change Password</h2>
      <p className="tab-description">
        Update your password to keep your account secure. We recommend using a strong, unique password.
      </p>

      {status.error && <div className="alert alert-error">{status.error}</div>}
      {status.success && <div className="alert alert-success">{status.success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            placeholder="••••••••"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            placeholder="Min. 6 characters"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm New Password</label>
          <input
            id="confirm"
            type="password"
            name="confirm"
            placeholder="••••••••"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </section>
  );
};

// ─── Tab: Danger Zone ─────────────────────────────────────────────────────────
const DangerZoneTab = ({ onDeleteAccount }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);
    try {
      await onDeleteAccount();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tab-content">
      <h2>🗑️ Delete Account</h2>
      <p className="tab-description">
        Permanently remove your account and all associated data.
      </p>
      <div className="danger-box">
        <h3>⚠️ Warning: This action cannot be undone!</h3>
        <p>
          Deleting your account will permanently remove:
        </p>
        <ul className="danger-list">
          <li>✗ Your profile and personal information</li>
          <li>✗ All your uploaded resources (if you're a teacher)</li>
          <li>✗ Your account history and activity</li>
          <li>✗ Access to all platform features</li>
        </ul>
        <p style={{ marginTop: '1rem', fontWeight: '600' }}>
          Please confirm that you understand this action is permanent:
        </p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          &nbsp;Yes, I want to permanently delete my account and all my data
        </label>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={!confirmed || loading}
        >
          {loading ? 'Deleting Account…' : '🗑️ Delete My Account Forever'}
        </button>
      </div>
    </section>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDeleteAccount = async () => {
    await deleteAccount();
    logout();
    navigate('/login');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  if (!user) return <div className="loading">Loading…</div>;

  return (
    <div className="dashboard">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="sidebar-toggle mobile-only"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span>⚙️</span>
        <span>Settings Menu</span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-user">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="sidebar-avatar" />
          ) : (
            <div className="avatar-placeholder">{user.name?.charAt(0).toUpperCase()}</div>
          )}
          <p className="sidebar-name">{user.name}</p>
          <p className="sidebar-email">{user.email}</p>
          <p className="sidebar-role-badge">
            {user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
          </p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => switchTab('profile')}
          >
            <span>👤</span> View Profile
          </button>
          <button
            className={`sidebar-link ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => switchTab('edit')}
          >
            <span>✏️</span> Edit Profile
          </button>
          <button
            className={`sidebar-link ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => switchTab('password')}
          >
            <span>🔑</span> Change Password
          </button>
          <button
            className={`sidebar-link ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => switchTab('danger')}
          >
            <span>🗑️</span> Delete Account
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'edit' && <EditProfileTab user={user} onUpdate={refreshUser} />}
        {activeTab === 'password' && <ChangePasswordTab />}
        {activeTab === 'danger' && <DangerZoneTab onDeleteAccount={handleDeleteAccount} />}
      </main>
    </div>
  );
};

export default DashboardPage;
