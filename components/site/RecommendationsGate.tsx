"use client";

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
  if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);
  return window.firebase.auth();
}

export function RecommendationsGate() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let timer = 0;

    const start = () => {
      const auth = getAuth();
      if (!auth) {
        timer = window.setTimeout(start, 200);
        return;
      }

      unsubscribe = auth.onAuthStateChanged((user) => {
        setIsSignedIn(Boolean(user));
        setReady(true);
      });
    };

    start();
    return () => {
      if (timer) window.clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  async function handleSignIn() {
    const auth = getAuth();
    const firebase = window.firebase;
    if (!auth || !firebase) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  }

  if (!ready || isSignedIn) return null;

  return (
    <section className="reco-access reco-access__gate" id="recommendations-gate">
      <div className="reco-access__card reveal">
        <div className="reco-access__eyebrow">Members Only</div>
        <h1 className="reco-access__title">Sign in with Google to unlock recommendation routes.</h1>
        <p className="reco-access__text">
          The recommendation library is gated behind Firebase Google login. Once you are signed in,
          the curated lanes and ranked city pages become available.
        </p>
        <div className="reco-access__actions">
          <button className="search__btn" type="button" onClick={handleSignIn}>
            Continue with Google
          </button>
        </div>
        <p className="reco-access__status" id="recommendations-gate-status">
          You need to be signed in to continue.
        </p>
      </div>
    </section>
  );
}
