import { createClient } from "@/lib/supabase/server";
import AccountForm from "./AccountForm";

export const metadata = {
  title: "My Account - Picked",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Account</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your personal information
        </p>
      </div>
      <AccountForm profile={profile} />
    </div>
  );
}
