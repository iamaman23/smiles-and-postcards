export type FirebaseCompat = {
  apps: unknown[];
  initializeApp: (config: Record<string, string>) => void;
  auth: (() => {
    onAuthStateChanged: (callback: (user: FirebaseAuthUser | null) => void) => () => void;
    signInWithPopup: (provider: unknown) => Promise<void>;
    signOut?: () => Promise<void>;
  }) & {
    GoogleAuthProvider: new () => unknown;
  };
};

export type FirebaseAuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  getIdToken: () => Promise<string>;
};

declare global {
  interface Window {
    firebase?: FirebaseCompat;
    SmileAndPostcardsAnalytics?: {
      getConsentStatus?: () => string;
      setConsentStatus?: (status: string) => string;
    };
  }
}
