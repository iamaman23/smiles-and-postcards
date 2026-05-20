"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FirebaseCompat } from "../../lib/firebase-compat";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0kSb-V1yZuq_j4gUCUC43GD-UK1Wzfh0",
  authDomain: "travelwebsite-d2716.firebaseapp.com",
  projectId: "travelwebsite-d2716",
  storageBucket: "travelwebsite-d2716.firebasestorage.app",
  messagingSenderId: "1096145054146",
  appId: "1:1096145054146:web:bf2039f6d149ff31af4e5b",
  measurementId: "G-HPH5NHBT8M"
};

function getAuth() {
  if (typeof window === "undefined" || !window.firebase) return null;
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(FIREBASE_CONFIG);
  }
  return window.firebase.auth();
}

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let timer = 0;

    const start = () => {
      const auth = getAuth();
      if (!auth) {
        timer = window.setTimeout(start, 200);
        return;
      }

      unsubscribe = auth.onAuthStateChanged((user) => setIsSignedIn(Boolean(user)));
    };

    start();
    return () => {
      if (timer) window.clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  async function handleGoogleSignIn() {
    const auth = getAuth();
    const firebase = window.firebase;
    if (!auth || !firebase) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  }

  async function handleGoogleSignOut() {
    const auth = getAuth();
    if (!auth?.signOut) return;
    await auth.signOut();
  }

  return (
    <nav className="nav" id="nav">
      <Link className="nav__logo" href="/">
        Smiles and <span>Postcards</span>
      </Link>
      <button
        className="nav__toggle"
        type="button"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      <div className={`nav__links${isOpen ? " open" : ""}`} id="nav-links">
        <Link className="nav__link" href="/">Stories</Link>
        <Link className="nav__link" href="/recommendations">Recommendations</Link>
        <Link className="nav__link" href="/about">About</Link>
        {!isSignedIn ? (
          <button className="nav__auth" id="googleSignInBtn" type="button" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
        ) : (
          <button className="nav__auth" id="googleSignOutBtn" type="button" onClick={handleGoogleSignOut}>
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
