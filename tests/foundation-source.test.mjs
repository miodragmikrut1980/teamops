import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("foundation enables D1 and packages the tenant migration", async () => {
  const hosting = JSON.parse(await readFile(".openai/hosting.json", "utf8"));
  assert.equal(hosting.d1, "DB");
  const migration = await readFile("drizzle/0000_mighty_skaar.sql", "utf8");
  for (const table of ["organizations", "users", "memberships", "teams", "leave_requests", "configuration_versions", "audit_events"]) {
    assert.match(migration, new RegExp("CREATE TABLE `" + table + "`"));
  }
});

test("write endpoints authenticate and enforce tenant context", async () => {
  const bootstrap = await readFile("app/api/bootstrap/route.ts", "utf8");
  const leave = await readFile("app/api/leave-requests/route.ts", "utf8");
  assert.match(bootstrap, /getChatGPTUser/);
  assert.match(bootstrap, /organization\.bootstrapped/);
  assert.match(leave, /getTenantContext/);
  assert.match(leave, /leave:create/);
  assert.match(leave, /organizationId/);
});
