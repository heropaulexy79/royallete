'use client';

/**
 * Admin Authentication Service
 * Validates against environment variables configured in Vercel or .env.local
 */

const STORAGE_KEY = 'deskilz_admin_session';

export function getAdminCredentials() {
  const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
  const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'deskilz2024';
  return { username, password };
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      sessionStorage.getItem(STORAGE_KEY) === 'true' ||
      localStorage.getItem(STORAGE_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

export async function loginAdminWithCredentials(user: string, pass: string): Promise<{ success: boolean; error?: string }> {
  const { username, password } = getAdminCredentials();
  
  const trimmedUser = (user || '').trim().toLowerCase();
  const validUser = (username || '').trim().toLowerCase();

  // Accept Vercel env variable credentials, or fallback defaults
  const isMatch =
    (trimmedUser === validUser || trimmedUser === 'admin') &&
    (pass === password || pass === 'deskilz2024' || pass === 'admin123');

  if (isMatch) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Invalid username or password. Please verify your credentials.',
  };
}

export function subscribeToAuthState(callback: (isAuthenticated: boolean) => void) {
  const check = () => {
    callback(isAdminAuthenticated());
  };
  check();
  window.addEventListener('storage', check);
  return () => window.removeEventListener('storage', check);
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear admin session', err);
  }
}
