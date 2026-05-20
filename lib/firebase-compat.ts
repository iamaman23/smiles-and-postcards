export type FirebaseCompat = {
  apps: unknown[];
  initializeApp: (config: Record<string, string>) => void;
  auth: (() => {
    onAuthStateChanged: (callback: (user: unknown) => void) => () => void;
    signInWithPopup: (provider: unknown) => Promise<void>;
    signOut?: () => Promise<void>;
  }) & {
    GoogleAuthProvider: new () => unknown;
  };
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
