import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Onboarding - Picked",
};

export default async function OnboardingLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <Link href="/" className="mb-8">
        <Image src="/logo.svg" alt="Picked" width={88} height={40} />
      </Link>
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
