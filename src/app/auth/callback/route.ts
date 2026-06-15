import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect target of Supabase email links (e.g. password
// recovery). Exchanges the one-time `code` for a session, persisting the
// auth cookies, then forwards the user to `next` (defaults to the password
// reset page).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/reset-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or the exchange failed (e.g. expired link).
  return NextResponse.redirect(`${origin}/?error=auth-callback`);
}
