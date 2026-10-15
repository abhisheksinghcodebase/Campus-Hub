import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'google'
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      saveSession(data.token, data.user);
      // Redirect to resources page where teachers can see upload/publish features
      navigate('/resources');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        {error && <div className="alert alert-error">{error}</div>}

        {/* Tab 1: Email & Password */}
        {activeTab === 'email' && (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                  <Link to="/forgot-password" className="form-link float-right">
                    Forgot password?
                  </Link>
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or quick switch</span>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={() => setActiveTab('google')}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <GoogleIcon /> Sign in with Google
            </button>
          </>
        )}

        {/* Tab 2: Google Account */}
        {activeTab === 'google' && (
          <div className="google-tab-content">
            <p className="google-tab-desc">
              Sign in securely using your Google account. We'll automatically verify
              your email and set up your profile.
            </p>

            <GoogleLoginButton
              text="signin_with"
              onError={(err) => setError(err)}
            />

            <small style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              Protected by Google OAuth 2.0 Security
            </small>

            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={() => setActiveTab('email')}
              style={{ marginTop: '0.5rem' }}
            >
              ✉️ Sign in with Email instead
            </button>
          </div>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
