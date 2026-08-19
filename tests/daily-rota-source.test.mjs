import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("v0.4.1 provides distinct daily, weekly, on-call and leave views", async () => {
  const ui = await readFile("app/schedule-workspace.tsx", "utf8");
  for (const label of ["Daily ROTA", "Today", "Week", "On-call", "Leave requests", "Coverage", "Uncovered"]) assert.match(ui, new RegExp(label));
  assert.match(ui, /teamProfile!=="small"/);
  assert.match(ui, /selectedDate/);
});
