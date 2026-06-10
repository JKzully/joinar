"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

function isLocalRequest(headersList) {
  const host = headersList.get("host") || "";
  const origin = headersList.get("origin") || "";
  const referer = headersList.get("referer") || "";
  const localHosts = ["localhost", "127.0.0.1"];

  return localHosts.some((localHost) =>
    host.startsWith(localHost) ||
    origin.includes(`://${localHost}`) ||
    referer.includes(`://${localHost}`)
  );
}

export async function createLocalTestAccount({ email, password, role, fullName }) {
  const headersList = await headers();

  if (!isLocalRequest(headersList)) {
    return { error: "Local test signup is only available on localhost." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      full_name: fullName,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
