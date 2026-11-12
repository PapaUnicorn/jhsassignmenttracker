/**
 * Google Workspace OAuth & Firebase Authentication
 * 
 * Supports:
 * 1. Firebase Auth signInWithPopup (routes via authDomain gen-lang-client-0367272811.firebaseapp.com to prevent origin_mismatch)
 * 2. Google Identity Services (GIS) Token Client fallback
 * 3. In-memory Access Token caching
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const DEFAULT_OAUTH_CLIENT_ID =
  firebaseConfig.oAuthClientId ||
  '667023974320-10g53oj6a2q9je8hhtkshq4955sj3kqb.apps.googleusercontent.com';

export function getActiveClientId(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('custom_oauth_client_id');
    if (custom && custom.trim()) return custom.trim();
  }
  return DEFAULT_OAUTH_CLIENT_ID;
}

export function setActiveClientId(clientId: string) {
  if (typeof window !== 'undefined') {
    if (clientId.trim()) {
      localStorage.setItem('custom_oauth_client_id', clientId.trim());
    } else {
      localStorage.removeItem('custom_oauth_client_id');
    }
  }
}

export const OAUTH_CLIENT_ID = DEFAULT_OAUTH_CLIENT_ID;

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

// In-memory token cache
let cachedAccessToken: string | null = null;
let gisTokenClient: any = null;

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Initialize Firebase Auth state listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Primary Sign-In using Firebase Auth popup (routes through *.firebaseapp.com to prevent origin_mismatch)
 */
export async function signInWithFirebaseAuth(): Promise<{
  accessToken: string;
  user: User;
}> {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Gagal memperoleh Google OAuth Access Token dari autentikasi.');
  }

  cachedAccessToken = credential.accessToken;
  return { accessToken: credential.accessToken, user: result.user };
}

/**
 * Fallback Sign-In using Google Identity Services (GIS) Token Client
 */
export function signInWithGisClient(
  onSuccess: (token: string) => void,
  onError: (err: Error) => void
): boolean {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    onError(new Error('Google Identity Services SDK belum selesai dimuat.'));
    return false;
  }

  try {
    const activeClientId = getActiveClientId();
    gisTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: activeClientId,
      scope: WORKSPACE_SCOPES.join(' '),
      callback: (response: any) => {
        if (response.error) {
          const desc = response.error_description || response.error;
          if (desc?.includes('origin_mismatch') || response.error === 'origin_mismatch') {
            onError(new Error('ORIGIN_MISMATCH'));
          } else {
            onError(new Error(`Login Google dibatalkan atau ditolak: ${desc}`));
          }
          return;
        }

        if (response.access_token) {
          cachedAccessToken = response.access_token;
          onSuccess(response.access_token);
        } else {
          onError(new Error('Tidak ada Access Token yang diterima dari Google.'));
        }
      },
      error_callback: (err: any) => {
        const isClosed =
          err?.type === 'popup_closed' ||
          err?.message?.includes('Popup window closed');
        if (isClosed) {
          onError(new Error('USER_CLOSED_POPUP'));
          return;
        }

        if (err?.message?.includes('origin_mismatch')) {
          onError(new Error('ORIGIN_MISMATCH'));
          return;
        }

        onError(new Error(err?.message || 'Gagal membuka jendela login Google.'));
      },
    });

    gisTokenClient.requestAccessToken({ prompt: 'select_account' });
    return true;
  } catch (err: any) {
    onError(new Error(err.message || 'Gagal memulai GIS login.'));
    return false;
  }
}

/**
 * Universal Google Sign-In:
 * 1. Tries Firebase Auth popup (whitelisted authDomain to prevent origin_mismatch)
 * 2. If Firebase Auth reports domain issues, tries GIS Token Client
 */
export async function executeGoogleLogin(
  onSuccess: (token: string, user?: User) => void,
  onError: (err: Error) => void
) {
  try {
    // Attempt 1: Firebase Auth popup
    const res = await signInWithFirebaseAuth();
    if (res?.accessToken) {
      onSuccess(res.accessToken, res.user);
      return;
    }
  } catch (firebaseErr: any) {
    console.warn('Firebase Auth sign in attempt notice:', firebaseErr);

    // If popup was explicitly closed by user
    if (firebaseErr.code === 'auth/popup-closed-by-user') {
      onError(new Error('USER_CLOSED_POPUP'));
      return;
    }

    // Attempt 2: GIS Token Client
    signInWithGisClient(
      (token) => onSuccess(token),
      (gisErr) => {
        onError(gisErr);
      }
    );
  }
}

/**
 * Get in-memory cached token
 */
export function getAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Set in-memory token
 */
export function setAccessToken(token: string | null) {
  cachedAccessToken = token;
}

/**
 * Sign out
 */
export async function logoutUser(onComplete?: () => void) {
  if (cachedAccessToken && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(cachedAccessToken, () => {
        console.log('Google Access Token revoked.');
      });
    } catch (e) {
      console.warn('Revoke error:', e);
    }
  }

  try {
    await signOut(auth);
  } catch (e) {
    console.warn('SignOut error:', e);
  }

  cachedAccessToken = null;
  onComplete?.();
}
