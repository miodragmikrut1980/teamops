import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, configurationVersions, invitations, memberships, products, queues, skills, teams, userSkills, users } from "../../../db/schema";
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
  const organizationId = tenant.organizationId;
  const [memberRows, teamRows, queueRows, productRows, skillRows, assignmentRows, invitationRows, configurationRows] = await Promise.all([
    db.select({ id: users.id, name: users.displayName, email: users.email, status: users.status, role: memberships.role }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).where(eq(memberships.organizationId, organizationId)),
    db.select().from(teams).where(eq(teams.organizationId, organizationId)),
    db.select().from(queues).where(eq(queues.organizationId, organizationId)),
    db.select().from(products).where(eq(products.organizationId, organizationId)),
    db.select().from(skills).where(eq(skills.organizationId, organizationId)),
    db.select().from(userSkills).where(eq(userSkills.organizationId, organizationId)),
    can(tenant.role, "member:invite") ? db.select().from(invitations).where(eq(invitations.organizationId, organizationId)).orderBy(desc(invitations.createdAt)) : Promise.resolve([]),
    db.select().from(configurationVersions).where(eq(configurationVersions.organizationId, organizationId)).orderBy(desc(configurationVersions.version)).limit(1),
  ]);
  const payload = configurationRows[0]?.payload as { teamProfile?: string } | undefined;
  return NextResponse.json({ members: memberRows, teams: teamRows, queues: queueRows, products: productRows, skills: skillRows, assignments: assignmentRows, invitations: invitationRows, teamProfile: payload?.teamProfile ?? "small", capabilities: { manage: can(tenant.role, "team:write") } });
}

type Action =
  | { action: "invite"; email: string; role: "manager" | "employee" | "auditor" }
  | { action: "createTeam"; name: string; timezone: string }
  | { action: "createQueue"; name: string; code: string }
  | { action: "createProduct"; name: string }
  | { action: "createSkill"; name: string; category: string; certificationRequired: boolean }
  | { action: "assignSkill"; userId: string; skillId: string; level: number; certificationName?: string }
  | { action: "changeRole"; userId: string; role: "manager" | "employee" | "auditor" }
  | { action: "setTeamProfile"; profile: "small" | "medium" | "large" };

export async function POST(request: Request) {
  const tenant = await context();
  if (!tenant || !can(tenant.role, "team:write")) return NextResponse.json({ error: "Manager permission required" }, { status: 403 });
  const body = await request.json() as Action;
  const db = getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  let actionName = "";
  let targetType = "";
  let metadata: Record<string, unknown> = {};

  try {
    if (body.action === "changeRole") {
      if (body.userId === tenant.userId && body.role !== "manager") return NextResponse.json({ error: "You cannot remove your own Manager role." }, { status: 400 });
      const [membership] = await db.select().from(memberships).where(and(eq(memberships.userId, body.userId), eq(memberships.organizationId, tenant.organizationId))).limit(1);
      if (!membership) return NextResponse.json({ error: "Member is outside your organization." }, { status: 404 });
      await db.update(memberships).set({ role: body.role }).where(eq(memberships.id, membership.id));
      actionName = "membership.role_changed"; targetType = "membership"; metadata = { userId: body.userId, from: membership.role, to: body.role };
    } else if (body.action === "setTeamProfile") {
      if (!["small", "medium", "large"].includes(body.profile)) return NextResponse.json({ error: "Invalid team profile." }, { status: 400 });
      const [current] = await db.select().from(configurationVersions).where(eq(configurationVersions.organizationId, tenant.organizationId)).orderBy(desc(configurationVersions.version)).limit(1);
      const currentPayload = (current?.payload ?? {}) as Record<string, unknown>;
      if (current) await db.update(configurationVersions).set({ status: "superseded" }).where(eq(configurationVersions.id, current.id));
      await db.insert(configurationVersions).values({ id, organizationId: tenant.organizationId, version: (current?.version ?? 0) + 1, status: "active", payload: { ...currentPayload, teamProfile: body.profile }, createdByUserId: tenant.userId, createdAt: now });
      actionName = "configuration.team_profile_changed"; targetType = "configuration_version"; metadata = { from: currentPayload.teamProfile ?? "small", to: body.profile };
    } else if (body.action === "invite") {
      const email = body.email?.trim().toLowerCase();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      await db.insert(invitations).values({ id, organizationId: tenant.organizationId, email, role: body.role, status: "pending", invitedByUserId: tenant.userId, expiresAt: new Date(now.getTime() + 7 * 86400000), createdAt: now });
      actionName = "member.invited"; targetType = "invitation"; metadata = { email, role: body.role };
    } else if (body.action === "createTeam") {
      const name = cleanName(body.name); if (!name) return invalidName();
      await db.insert(teams).values({ id, organizationId: tenant.organizationId, name, timezone: body.timezone || "Europe/Belgrade", createdAt: now });
      actionName = "team.created"; targetType = "team"; metadata = { name, timezone: body.timezone };
    } else if (body.action === "createQueue") {
      const name = cleanName(body.name); const code = body.code?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 16);
      if (!name || !code) return NextResponse.json({ error: "Queue name and code are required." }, { status: 400 });
      await db.insert(queues).values({ id, organizationId: tenant.organizationId, name, code, active: true, createdAt: now });
      actionName = "queue.created"; targetType = "queue"; metadata = { name, code };
    } else if (body.action === "createProduct") {
      const name = cleanName(body.name); if (!name) return invalidName();
      await db.insert(products).values({ id, organizationId: tenant.organizationId, name, active: true, createdAt: now });
      actionName = "product.created"; targetType = "product"; metadata = { name };
    } else if (body.action === "createSkill") {
      const name = cleanName(body.name); const category = cleanName(body.category);
      if (!name || !category) return NextResponse.json({ error: "Skill name and category are required." }, { status: 400 });
      await db.insert(skills).values({ id, organizationId: tenant.organizationId, name, category, certificationRequired: Boolean(body.certificationRequired), active: true, createdAt: now });
      actionName = "skill.created"; targetType = "skill"; metadata = { name, category, certificationRequired: Boolean(body.certificationRequired) };
    } else if (body.action === "assignSkill") {
      if (!Number.isInteger(body.level) || body.level < 1 || body.level > 5) return NextResponse.json({ error: "Skill level must be between 1 and 5." }, { status: 400 });
      const [member] = await db.select({ id: users.id }).from(users).innerJoin(memberships, eq(memberships.userId, users.id)).where(and(eq(users.id, body.userId), eq(memberships.organizationId, tenant.organizationId))).limit(1);
      const [skill] = await db.select({ id: skills.id }).from(skills).where(and(eq(skills.id, body.skillId), eq(skills.organizationId, tenant.organizationId))).limit(1);
      if (!member || !skill) return NextResponse.json({ error: "Member or skill is outside your organization." }, { status: 404 });
      await db.insert(userSkills).values({ id, organizationId: tenant.organizationId, userId: body.userId, skillId: body.skillId, level: body.level, certificationName: body.certificationName?.trim().slice(0, 120) || null, certificationExpiresAt: null, verifiedAt: now, createdAt: now });
      actionName = "skill.assigned"; targetType = "user_skill"; metadata = { userId: body.userId, skillId: body.skillId, level: body.level };
    } else return NextResponse.json({ error: "Unsupported action" }, { status: 400 });

    await db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId: tenant.organizationId, actorUserId: tenant.userId, action: actionName, targetType, targetId: id, metadata, createdAt: now });
    return NextResponse.json({ id, status: "created" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && /UNIQUE|unique/i.test(error.message) ? "This record already exists." : "The change could not be saved.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

function cleanName(value?: string) { const name = value?.trim(); return name && name.length <= 80 ? name : null; }
function invalidName() { return NextResponse.json({ error: "Name must contain 1–80 characters." }, { status: 400 }); }
