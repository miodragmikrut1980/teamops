import { and, desc, eq, lt, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, configurationVersions, leaveRequests, memberships, scheduleAcknowledgements, scheduleVersions, shifts, users } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { can } from "../../lib/authorization";
import { getTenantContext } from "../../lib/tenant";

async function context() { const identity = await getChatGPTUser(); return identity ? getTenantContext(identity) : null; }

export async function GET() {
  const tenant = await context(); if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); const org = tenant.organizationId;
  const [versions, allShifts, members, leaves, configs] = await Promise.all([
    db.select().from(scheduleVersions).where(eq(scheduleVersions.organizationId, org)).orderBy(desc(scheduleVersions.createdAt)),
    can(tenant.role, "schedule:read:any") ? db.select().from(shifts).where(eq(shifts.organizationId, org)) : db.select().from(shifts).where(and(eq(shifts.organizationId, org), eq(shifts.userId, tenant.userId))),
    db.select({ id: users.id, name: users.displayName }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).where(eq(memberships.organizationId, org)),
    can(tenant.role, "leave:read:any") ? db.select().from(leaveRequests).where(eq(leaveRequests.organizationId, org)) : db.select().from(leaveRequests).where(and(eq(leaveRequests.organizationId, org), eq(leaveRequests.requesterUserId, tenant.userId))),
    db.select().from(configurationVersions).where(eq(configurationVersions.organizationId, org)).orderBy(desc(configurationVersions.version)).limit(1),
  ]);
  const payload = configs[0]?.payload as { teamProfile?: string } | undefined;
  return NextResponse.json({ versions, shifts: allShifts, members, leaves, teamProfile: payload?.teamProfile ?? "small", capabilities: { manage: can(tenant.role, "schedule:write"), publish: can(tenant.role, "schedule:publish") } });
}

type Action = { action: "createShift"; userId: string; startsAt: string; endsAt: string; kind: "regular" | "on_call" | "training"; weekStart: string }
  | { action: "publish"; scheduleVersionId: string } | { action: "acknowledge"; scheduleVersionId: string };

export async function POST(request: Request) {
  const tenant = await context(); if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Action; const db = getDb(); const now = new Date();
  if (body.action === "createShift") {
    if (!can(tenant.role, "schedule:write")) return NextResponse.json({ error: "Manager permission required" }, { status: 403 });
    const start = new Date(body.startsAt); const end = new Date(body.endsAt);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end || end.getTime() - start.getTime() > 24 * 3600000) return NextResponse.json({ error: "Invalid shift interval" }, { status: 400 });
    const [member] = await db.select().from(memberships).where(and(eq(memberships.organizationId, tenant.organizationId), eq(memberships.userId, body.userId))).limit(1);
    if (!member) return NextResponse.json({ error: "Employee is outside your organization" }, { status: 404 });
    const conflicts = await db.select().from(shifts).where(and(eq(shifts.organizationId, tenant.organizationId), eq(shifts.userId, body.userId), lt(shifts.startsAt, end), gt(shifts.endsAt, start)));
    if (conflicts.length) return NextResponse.json({ error: "This employee already has an overlapping shift." }, { status: 409 });
    let [version] = await db.select().from(scheduleVersions).where(and(eq(scheduleVersions.organizationId, tenant.organizationId), eq(scheduleVersions.weekStart, body.weekStart), eq(scheduleVersions.status, "draft"))).limit(1);
    if (!version) { const existing = await db.select().from(scheduleVersions).where(and(eq(scheduleVersions.organizationId, tenant.organizationId), eq(scheduleVersions.weekStart, body.weekStart))); const id = crypto.randomUUID(); await db.insert(scheduleVersions).values({ id, organizationId: tenant.organizationId, teamId: null, version: existing.length + 1, status: "draft", weekStart: body.weekStart, createdByUserId: tenant.userId, publishedAt: null, createdAt: now }); [version] = await db.select().from(scheduleVersions).where(eq(scheduleVersions.id, id)); }
    const id = crypto.randomUUID(); await db.batch([db.insert(shifts).values({ id, organizationId: tenant.organizationId, scheduleVersionId: version.id, userId: body.userId, startsAt: start, endsAt: end, timezone: "Europe/Belgrade", kind: body.kind, status: "planned", createdAt: now }), db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId: tenant.organizationId, actorUserId: tenant.userId, action: "shift.created", targetType: "shift", targetId: id, metadata: { userId: body.userId, startsAt: body.startsAt, endsAt: body.endsAt, kind: body.kind }, createdAt: now })]);
    return NextResponse.json({ id, scheduleVersionId: version.id }, { status: 201 });
  }
  if (body.action === "publish") {
    if (!can(tenant.role, "schedule:publish")) return NextResponse.json({ error: "Manager permission required" }, { status: 403 });
    const [version] = await db.select().from(scheduleVersions).where(and(eq(scheduleVersions.id, body.scheduleVersionId), eq(scheduleVersions.organizationId, tenant.organizationId))).limit(1);
    if (!version || version.status !== "draft") return NextResponse.json({ error: "Draft schedule not found" }, { status: 404 });
    await db.batch([db.update(scheduleVersions).set({ status: "published", publishedAt: now }).where(eq(scheduleVersions.id, version.id)), db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId: tenant.organizationId, actorUserId: tenant.userId, action: "schedule.published", targetType: "schedule_version", targetId: version.id, metadata: { weekStart: version.weekStart, version: version.version }, createdAt: now })]);
    return NextResponse.json({ status: "published" });
  }
  if (!can(tenant.role, "schedule:acknowledge")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [version] = await db.select().from(scheduleVersions).where(and(eq(scheduleVersions.id, body.scheduleVersionId), eq(scheduleVersions.organizationId, tenant.organizationId), eq(scheduleVersions.status, "published"))).limit(1);
  if (!version) return NextResponse.json({ error: "Published schedule not found" }, { status: 404 });
  const id = crypto.randomUUID(); await db.batch([db.insert(scheduleAcknowledgements).values({ id, organizationId: tenant.organizationId, scheduleVersionId: version.id, userId: tenant.userId, acknowledgedAt: now }), db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId: tenant.organizationId, actorUserId: tenant.userId, action: "schedule.acknowledged", targetType: "schedule_version", targetId: version.id, metadata: {}, createdAt: now })]);
  return NextResponse.json({ status: "acknowledged" });
}
