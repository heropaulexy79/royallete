import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';

const STORAGE_KEY = 'deskilz_admin_session';

/**
 * Maps simple username to a secure admin email domain for Firebase Auth
 */
function toAdminEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (clean.includes('@')) return clean;
  return `${clean || 'admin'}@deskilz.internal`;
}

/**
 * Authenticates admin via Firebase Auth
 */
export async function loginAdminWithFirebase(user: string, pass: string): Promise<{ success: boolean; error?: string }> {
  const email = toAdminEmail(user);
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    
    // If the account does not exist yet in Firebase Auth, attempt initial provisioning for authorized admin credentials
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
      const defaultUser = (process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin').trim().toLowerCase();
      const defaultPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'deskilz2024';

      if (user.trim().toLowerCase() === defaultUser && (pass === defaultPass || pass === 'admin123')) {
        try {
          // Auto-provision initial administrator in Firebase Auth
          await createUserWithEmailAndPassword(auth, email, pass.length >= 6 ? pass : 'deskilz2024');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEY, 'true');
            localStorage.setItem(STORAGE_KEY, 'true');
          }
          return { success: true };
        } catch {
          // Account might exist with a different password, try sign-in again or fail
        }
      }
    }

    return { 
      success: false, 
      error: error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found'
        ? 'Invalid username or password.' 
        : 'Authentication failed. Please verify credentials.' 
    };
  }
}

/**
 * Checks if current admin has an active session
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return auth.currentUser !== null || sessionStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Subscribes to Firebase Auth state
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    callback(user);
  });
}

/**
 * Signs out admin from Firebase
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign out error:', err);
  }
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }
}
