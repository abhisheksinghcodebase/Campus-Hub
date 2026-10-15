import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResourcesPage from './pages/ResourcesPage';

// ── Protected Route: redirects to /login if not authenticated ─────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Public Route: redirects to /dashboard if already authenticated ────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  // Already logged in users go to resources page
  return !user ? children : <Navigate to="/resources" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public-only pages */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* Protected pages */}
            <Route path="/resources" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="auth-page">
                <div className="auth-card">
                  <h1>404</h1>
                  <p>Page not found.</p>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
