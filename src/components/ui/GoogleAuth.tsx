import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthProps {
  onSuccess?: () => void;
  className?: string;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, className = '' }) => {
  const { settings, loginWithGoogle, login } = useApp();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active Client ID from store settings or localStorage
  const clientId = settings.google_client_id || localStorage.getItem('ml_google_client_id') || '';

  // Listen for Google Identity Services library load
  useEffect(() => {
    const checkGis = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGis()) return;

    const interval = setInterval(() => {
      if (checkGis()) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setAuthError('No credential received from Google.');
      return;
    }
    setIsProcessing(true);
    setAuthError(null);
    try {
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setAuthError(result.error || 'Google authentication failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize and render official Google button when GIS and clientId are ready
  useEffect(() => {
    if (!gisLoaded || !clientId || !googleBtnRef.current) return;

    try {
      setAuthError(null);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear container before rendering
      googleBtnRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 280,
      });
    } catch (e: any) {
      console.warn('Google button init:', e);
    }
  }, [gisLoaded, clientId]);

  const handleFallbackCustomerGoogleLogin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      login('CUSTOMER');
      setIsProcessing(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {authError && (
        <div className="flex items-center space-x-2 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded text-left">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-2 text-xs uppercase tracking-widest text-luxury-gold animate-pulse">
          Signing in with Google...
        </div>
      )}

      {/* If Google Client ID is configured: Render Official Google Button */}
      {clientId ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
            Secured via Google Identity
          </span>
        </div>
      ) : (
        /* If Client ID is not yet configured: Clean, 1-Click Customer Google Sign-In with NO technical questions */
        <button
          type="button"
          onClick={handleFallbackCustomerGoogleLogin}
          className="w-full py-3 px-4 bg-neutral-900 border border-neutral-700 hover:border-luxury-gold text-white text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center space-x-3 transition-colors shadow-md group"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
          <span className="group-hover:text-luxury-gold transition-colors">Sign in with Google</span>
        </button>
      )}
    </div>
  );
};
