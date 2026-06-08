import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Boost - Picked",
};

async function startBoost() {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 7);

  await supabase.from("boosts").insert({
    profile_id: user.id,
    boost_type: "basic",
    ends_at: endsAt.toISOString(),
    is_active: true,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/boost");
  revalidatePath("/dashboard/players");
  revalidatePath("/dashboard/teams");
}

export default async function BoostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const { data: activeBoost } = await supabase
    .from("boosts")
    .select("boost_type, starts_at, ends_at")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isPlayer = profile?.role !== "team";
  const endsAt = activeBoost?.ends_at
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(activeBoost.ends_at))
    : null;

  return (
    <div className="mx-auto max-w-[960px] px-6 py-8 sm:px-12 sm:py-10 lg:px-16">
      <div className="mb-8">
        <div className="label-meta text-terra">Visibility</div>
        <h1 className="display-sm mt-3">
          Boost your <span className="serif text-sage-deep">{isPlayer ? "profile." : "team."}</span>
        </h1>
        <p className="mt-3 max-w-[560px] text-[14px] leading-[1.6] text-ink-2">
          Boosted listings appear first in browse results and get a clearer badge in search.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-paper-2 p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h2 className="text-[20px] font-bold tracking-[-0.01em]">Basic boost</h2>
              <p className="mt-2 max-w-[520px] text-[14px] leading-[1.55] text-ink-2">
                A 7-day visibility boost for your current {isPlayer ? "player profile" : "team listing"}.
              </p>
            </div>
            <div className="rounded-full bg-sage/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-sage-deep">
              Free beta
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["Priority sort", "Shows ahead of standard listings"],
              ["Boosted badge", "Clear signal in browse cards"],
              ["7 days", "Ends automatically"],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-line bg-paper p-4">
                <div className="text-[13px] font-bold text-ink">{title}</div>
                <div className="mt-1 text-[12px] leading-[1.45] text-mute">{copy}</div>
              </div>
            ))}
          </div>

          {activeBoost ? (
            <div className="mt-7 rounded-xl border border-sage/30 bg-sage/10 p-4 text-[14px] text-sage-deep">
              Your {activeBoost.boost_type} boost is active{endsAt ? ` until ${endsAt}` : ""}.
            </div>
          ) : (
            <form action={startBoost} className="mt-7">
              <button type="submit" className="btn btn-terra btn-lg">
                Start 7-day boost
              </button>
            </form>
          )}
        </section>

        <aside className="rounded-2xl border border-line bg-paper-2 p-7">
          <h2 className="text-[16px] font-bold">Before you boost</h2>
          <p className="mt-3 text-[13px] leading-[1.6] text-ink-2">
            Boost works best after your listing is complete. Make sure your location, role, stats, and profile copy are filled in first.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/dashboard/ad" className="btn btn-ink justify-center">
              Review my listing
            </Link>
            <Link
              href={isPlayer ? "/dashboard/players" : "/dashboard/teams"}
              className="btn btn-ghost justify-center"
            >
              Preview browse results
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
