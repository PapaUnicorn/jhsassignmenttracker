/**
 * Google Workspace OAuth & Google Identity Services (GIS) Integration
 * 
 * Optimized for browser popup security:
 * - Token client is initialized early and invoked synchronously on user click
 * - Preserves browser user activation context to prevent popup blocker errors
 * - Manages in-memory OAuth access token
 */

import firebaseConfig from '../../firebase-applet-config.json';

export const OAUTH_CLIENT_ID =
  firebaseConfig.oAuthClientId ||
  '667023974320-10g53oj6a2q9je8hhtkshq4955sj3kqb.apps.googleusercontent.com';

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

/**
 * Initialize or get the GIS Token Client singleton
 */
export function getOrCreateGisTokenClient(
  onSuccess: (token: string) => void,
  onError: (err: Error) => void
) {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    return null;
  }

  // Update callbacks
  gisTokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: OAUTH_CLIENT_ID,
    scope: WORKSPACE_SCOPES.join(' '),
    callback: (response: any) => {
      if (response.error) {
        const errorDesc = response.error_description || response.error;
        console.error('GIS Callback Error:', response);
        onError(new Error(`Login Google dibatalkan atau ditolak: ${errorDesc}`));
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
      const isClosedByUser =
        err?.type === 'popup_closed' ||
        err?.message?.includes('Popup window closed') ||
        err?.message?.includes('popup_closed');

      if (isClosedByUser) {
        console.info('Jendela dialog Google Sign-In ditutup oleh pengguna.');
        onError(new Error('USER_CLOSED_POPUP'));
        return;
      }

      console.warn('GIS Notice:', err);
      let errorMsg = 'Gagal membuka popup Google Sign-In.';
      if (err?.type === 'popup_failed_to_open' || err?.message?.includes('Failed to open popup')) {
        errorMsg =
          'Popup Google diblokir oleh browser. Pastikan untuk mengizinkan popup untuk situs ini atau buka aplikasi di tab baru.';
      }
      onError(new Error(errorMsg));
    },
  });

  return gisTokenClient;
}

/**
 * Trigger GIS Login synchronously on user click to prevent browser popup blockers
 */
export function triggerSynchronousGisLogin(
  onSuccess: (token: string) => void,
  onError: (err: Error) => void
): boolean {
  try {
    const client = getOrCreateGisTokenClient(onSuccess, onError);
    if (!client) {
      onError(
        new Error(
          'Library Google Identity Services belum selesai dimuat. Tunggu beberapa saat lalu klik kembali.'
        )
      );
      return false;
    }

    // Must be called synchronously inside user event
    client.requestAccessToken({ prompt: 'select_account' });
    return true;
  } catch (err: any) {
    console.error('Failed to trigger GIS login:', err);
    onError(new Error(err.message || 'Gagal memulai login Google.'));
    return false;
  }
}

/**
 * Get in-memory access token
 */
export function getAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Set token manually (e.g. from token prompt or restore)
 */
export function setAccessToken(token: string | null) {
  cachedAccessToken = token;
}

/**
 * Revoke and clear token on logout
 */
export function logoutUser(onComplete?: () => void) {
  if (cachedAccessToken && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(cachedAccessToken, () => {
        console.log('Google Access Token revoked.');
        cachedAccessToken = null;
        onComplete?.();
      });
      return;
    } catch (e) {
      console.warn('Revoke warning:', e);
    }
  }

  cachedAccessToken = null;
  onComplete?.();
}
