import { FIREBASE_CONFIG } from "./site-config";

export type VerifiedAdminUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  providerIds: string[];
  createdAt: string;
  lastSignInAt: string;
};

function normalizeFirebaseTimestamp(value?: string) {
  const timestamp = Number(value || 0);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "";
  return new Date(timestamp).toISOString();
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function verifyFirebaseRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("Missing Firebase auth token.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_CONFIG.apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store"
    }
  );
  const payload = (await response.json().catch(() => ({}))) as {
    users?: Array<{
      localId?: string;
      email?: string;
      displayName?: string;
      photoUrl?: string;
      emailVerified?: boolean;
      createdAt?: string;
      lastLoginAt?: string;
      providerUserInfo?: Array<{ providerId?: string }>;
    }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Unable to verify Firebase auth token.");
  }

  const user = payload.users?.[0];
  if (!user?.localId || !user.email) {
    throw new Error("Firebase auth token did not resolve to an admin account.");
  }

  return {
    uid: user.localId,
    email: user.email,
    displayName: String(user.displayName || ""),
    photoURL: String(user.photoUrl || ""),
    emailVerified: Boolean(user.emailVerified),
    providerIds: Array.isArray(user.providerUserInfo)
      ? user.providerUserInfo.map((item) => String(item.providerId || "")).filter(Boolean)
      : [],
    createdAt: normalizeFirebaseTimestamp(user.createdAt),
    lastSignInAt: normalizeFirebaseTimestamp(user.lastLoginAt)
  } satisfies VerifiedAdminUser;
}
