import type { FirebaseAuthUser } from "./firebase-compat";

const syncedUserIds = new Set<string>();
const inflightSyncs = new Map<string, Promise<void>>();

export async function syncFirebaseUserSession(user: FirebaseAuthUser | null | undefined) {
  if (!user?.uid || typeof user.getIdToken !== "function") return;
  if (syncedUserIds.has(user.uid)) return;
  if (inflightSyncs.has(user.uid)) return inflightSyncs.get(user.uid);

  const promise = (async () => {
    const token = await user.getIdToken();
    const response = await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.error || `User sync failed with status ${response.status}.`);
    }
    syncedUserIds.add(user.uid);
  })();

  inflightSyncs.set(user.uid, promise);
  try {
    await promise;
  } finally {
    inflightSyncs.delete(user.uid);
  }
}
