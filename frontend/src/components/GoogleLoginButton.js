import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLoginApi, fetchGoogleClientId } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const GoogleLoginButton = ({ text = 'continue_with', onError }) => {
  const buttonRef = useRef(null);
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(
    process.env.REACT_APP_GOOGLE_CLIENT_ID || ''
  );
  const [initError, setInitError] = useState('');

  // 1. Fetch Client ID from backend if not in frontend env
  useEffect(() => {
    if (!clientId) {
      fetchGoogleClientId()
        .then((res) => {
          if (res.clientId) {
            setClientId(res.clientId);
          } else {
            setInitError('Google Client ID is not configured on the server.');
          }
        })
        .catch((err) => {
          console.error('Failed to get Google Client ID:', err);
          setInitError('Unable to connect to Google authentication service.');
        });
    }
  }, [clientId]);

  // 2. Handle Google Credential Response
  const handleCredentialResponse = useCallback(
    async (response) => {
      setLoading(true);
      try {
        const data = await googleLoginApi(response.credential);
        saveSession(data.token, data.user);
        navigate('/resources');
      } catch (err) {
        console.error('Google Sign-In failed:', err);
        const errMsg = err.message || 'Google Sign-In failed. Please try again.';
        if (onError) onError(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [saveSession, navigate, onError]
  );

  // 3. Render Google Sign-In Button
  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    let checkInterval = null;

    const setupGoogleButton = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render Google button
          if (buttonRef.current) {
            buttonRef.current.innerHTML = ''; // clear previous render
            window.google.accounts.id.renderButton(buttonRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: text,
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 340,
            });
          }

          if (checkInterval) clearInterval(checkInterval);
        } catch (e) {
          console.error('Error initializing Google Sign-In:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogleButton();
    } else {
      // Poll briefly if script is still loading asynchronously
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          setupGoogleButton();
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, text, handleCredentialResponse]);

  if (initError) {
    return <div className="alert alert-error" style={{ fontSize: '0.85rem' }}>{initError}</div>;
  }

  return (
    <div className="google-btn-wrapper">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '0.75rem', color: '#666' }}>
          Signing in with Google…
        </div>
      ) : (
        <div ref={buttonRef} className="google-btn-container" />
      )}
    </div>
  );
};

export default GoogleLoginButton;
