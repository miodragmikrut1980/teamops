import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("v0.3 migration adds scalable team and skill models", async () => {
  const migration = await readFile("drizzle/0001_overconfident_nocturne.sql", "utf8");
  for (const table of ["invitations", "products", "queues", "skills", "team_members", "user_skills"]) {
    assert.match(migration, new RegExp("CREATE TABLE `" + table + "`"));
  }
});

test("team setup enforces manager writes and tenant-scoped reads", async () => {
  const route = await readFile("app/api/team-setup/route.ts", "utf8");
  assert.match(route, /can\(tenant\.role, "team:write"\)/);
  assert.match(route, /organizationId/);
  assert.match(route, /Member is outside your organization/);
  assert.match(route, /membership\.role_changed/);
  assert.match(route, /configuration\.team_profile_changed/);
});

test("small, medium and large profiles progressively disclose complexity", async () => {
  const ui = await readFile("app/team-setup.tsx", "utf8");
  assert.match(ui, /Up to 20 people/);
  assert.match(ui, /21–100 people/);
  assert.match(ui, /101\+ people/);
  assert.match(ui, /profile !== "small"/);
  assert.match(ui, /data\.teamProfile === "large"/);
});
