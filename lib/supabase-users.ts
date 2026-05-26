import type { VerifiedAdminUser } from "./firebase-auth-server";
import { upsertRows } from "./supabase-rest";

type UserRow = Record<string, unknown> & {
  id: string;
  email: string;
};

export async function syncFirebaseUserToSupabase(user: VerifiedAdminUser) {
  const now = new Date().toISOString();
  const createdAt = user.createdAt || now;
  const lastSignInAt = user.lastSignInAt || now;

  await upsertRows<UserRow>(
    "users",
    [
      {
        id: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        email_verified: user.emailVerified,
        provider_ids: user.providerIds,
        created_at: createdAt,
        updated_at: now,
        last_sign_in_at: lastSignInAt
      }
    ],
    "id"
  );
}
