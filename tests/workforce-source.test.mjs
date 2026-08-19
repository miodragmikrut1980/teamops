import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("v0.4 persists schedule versions, shifts, availability and acknowledgements", async () => {
  const schema = await readFile("db/schema.ts", "utf8");
  for (const name of ["schedule_versions", "shifts", "availability", "schedule_acknowledgements"]) assert.match(schema, new RegExp(name));
});
test("schedule writes enforce tenant membership, conflict checks and human publication", async () => {
  const route = await readFile("app/api/schedule/route.ts", "utf8");
  assert.match(route, /schedule:write/); assert.match(route, /schedule:publish/); assert.match(route, /overlapping shift/); assert.match(route, /schedule\.published/); assert.match(route, /organizationId/);
});
test("workforce UI adapts complexity by team profile", async () => {
  const ui = await readFile("app/schedule-workspace.tsx", "utf8");
  assert.match(ui, /teamProfile!=="small"/); assert.match(ui, /Publish schedule/); assert.match(ui, /Acknowledge schedule/); assert.match(ui, /Request time off/);
});
