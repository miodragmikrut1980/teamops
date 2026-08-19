import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, leaveRequests } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { can } from "../../lib/authorization";
import { getTenantContext } from "../../lib/tenant";

async function context() {
  const identity = await getChatGPTUser();
  return identity ? getTenantContext(identity) : null;
}

export async function GET() {
  const tenant = await context();
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const condition = can(tenant.role, "leave:read:any")
    ? eq(leaveRequests.organizationId, tenant.organizationId)
    : and(eq(leaveRequests.organizationId, tenant.organizationId), eq(leaveRequests.requesterUserId, tenant.userId));
  const records = await db.select().from(leaveRequests).where(condition).orderBy(desc(leaveRequests.createdAt));
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const tenant = await context();
  if (!tenant || !can(tenant.role, "leave:create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as { startDate?: string; endDate?: string; note?: string };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.startDate ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(body.endDate ?? "") || body.startDate! > body.endDate!) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date();
  const db = getDb();
  await db.batch([
    db.insert(leaveRequests).values({ id, organizationId: tenant.organizationId, requesterUserId: tenant.userId, startDate: body.startDate!, endDate: body.endDate!, note: body.note?.slice(0, 500) || null, status: "pending", createdAt: now, updatedAt: now }),
    db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId: tenant.organizationId, actorUserId: tenant.userId, action: "leave.requested", targetType: "leave_request", targetId: id, metadata: { startDate: body.startDate, endDate: body.endDate }, createdAt: now }),
  ]);
  return NextResponse.json({ id, status: "pending" }, { status: 201 });
}

export async function PATCH(request: Request) {
  const tenant = await context();
  if (!tenant || !can(tenant.role, "leave:approve")) return NextResponse.json({ error: "Manager permission required" }, { status: 403 });
  const body = await request.json() as { id?: string; decision?: "approved" | "rejected" };
  if (!body.id || !["approved", "rejected"].includes(body.decision ?? "")) return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  const db = getDb();
  const [record] = await db.select().from(leaveRequests).where(and(eq(leaveRequests.id, body.id), eq(leaveRequests.organizationId, tenant.organizationId))).limit(1);
  if (!record || record.status !== "pending") return NextResponse.json({ error: "Pending request not found" }, { status: 404 });
  const now = new Date();
  await db.batch([
    db.update(leaveRequests).set({ status: body.decision!, updatedAt: now }).where(eq(leaveRequests.id, record.id)),
    db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId: tenant.organizationId, actorUserId: tenant.userId, action: `leave.${body.decision}`, targetType: "leave_request", targetId: record.id, metadata: { requesterUserId: record.requesterUserId }, createdAt: now }),
  ]);
  return NextResponse.json({ status: body.decision });
}
