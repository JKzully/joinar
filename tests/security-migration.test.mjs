import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../supabase/migrations/20260613103000_market_security_and_integrity.sql",
  import.meta.url
);

test("market hardening migration protects authorization columns", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /revoke update on public\.profiles from authenticated, anon/i);
  assert.match(sql, /grant update \([\s\S]*on public\.profiles to authenticated/i);
  assert.doesNotMatch(
    sql,
    /grant update \([\s\S]*\brole\b[\s\S]*on public\.profiles to authenticated/i
  );
});

test("market hardening migration makes drafts private and invitation updates narrow", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /Owners and active market profiles are viewable/i);
  assert.match(sql, /revoke update on public\.tryout_invitations from authenticated, anon/i);
  assert.match(sql, /respond_to_tryout_invitation/i);
  assert.match(sql, /idx_one_pending_invitation_per_pair/i);
});
