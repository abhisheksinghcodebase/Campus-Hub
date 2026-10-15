import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewUrl('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message);
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot password?</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a reset link.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {previewUrl && (
          <div className="alert alert-success" style={{ marginTop: '0.75rem', wordBreak: 'break-all' }}>
            <p><strong>🛠️ Local Dev Shortcut:</strong></p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}>
              Since you're running locally, here is your generated reset link:
            </p>
            <a
              href={previewUrl}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-block', marginTop: '0.25rem' }}
            >
              Open Reset Link →
            </a>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
