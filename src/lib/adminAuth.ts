/**
 * Admin Authentication Service
 * Credentials can be configured in .env.local via
 * NEXT_PUBLIC_ADMIN_USERNAME and NEXT_PUBLIC_ADMIN_PASSWORD
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

export function verifyAdminCredentials(user: string, pass: string): boolean {
  const { username, password } = getAdminCredentials();
  const trimmedUser = user.trim().toLowerCase();
  const validUser = username.trim().toLowerCase();

  // Also accept fallback admin password 'admin123' for convenience
  const isMatch =
    trimmedUser === validUser &&
    (pass === password || pass === 'admin123');

  return isMatch;
}

export function setAdminAuthenticated(remember: boolean = false): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    if (remember) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  } catch (err) {
    console.error('Failed to save admin session', err);
  }
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
