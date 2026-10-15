import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const { token } = useParams(); // token from URL: /reset-password/:token
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, form.password);
      // Backend returns a token so the user is auto-logged in
      if (data.token) {
        saveSession(data.token, null); // user will be fetched by AuthContext
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set new password</h1>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
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

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
