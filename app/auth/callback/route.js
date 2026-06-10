import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function redirectToLoginWithError(origin, message) {
  const url = new URL("/login", origin);
  url.searchParams.set("auth_error", message || "auth");
  return NextResponse.redirect(url);
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const authError =
    searchParams.get("error_description") ||
    searchParams.get("error_code") ||
    searchParams.get("error");

  if (authError) {
    return redirectToLoginWithError(origin, authError);
  }

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }

    return redirectToLoginWithError(origin, error.message);
  }

  // If there's no code or exchange failed, redirect to login with error
  return redirectToLoginWithError(origin, "auth");
}
