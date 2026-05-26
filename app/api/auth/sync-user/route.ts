import { NextResponse } from "next/server";
import { verifyFirebaseRequest } from "../../../../lib/firebase-auth-server";
import { syncFirebaseUserToSupabase } from "../../../../lib/supabase-users";

export async function POST(request: Request) {
  try {
    const user = await verifyFirebaseRequest(request);
    await syncFirebaseUserToSupabase(user);
    return NextResponse.json({ ok: true, uid: user.uid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Firebase user sync failure.";
    const status = /missing firebase auth token|verify firebase auth token|did not resolve/i.test(message) ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
