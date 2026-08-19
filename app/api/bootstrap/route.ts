import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, configurationVersions, memberships, organizations, teams, users } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json() as { organizationName?: string };
  const organizationName = body.organizationName?.trim();
  if (!organizationName || organizationName.length < 2 || organizationName.length > 80) return NextResponse.json({ error: "Organization name must contain 2–80 characters." }, { status: 400 });
  const db = getDb();
  const [{ value: organizationCount }] = await db.select({ value: count() }).from(organizations);
  if (organizationCount > 0) return NextResponse.json({ error: "Ask an existing Manager to invite you to TeamOps." }, { status: 409 });
  const now = new Date();
  const organizationId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const slug = `${organizationName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "team"}-${organizationId.slice(0, 6)}`;
  await db.batch([
    db.insert(organizations).values({ id: organizationId, name: organizationName, slug, timezone: "Europe/Belgrade", createdAt: now }),
    db.insert(users).values({ id: userId, email: identity.email.toLowerCase(), displayName: identity.displayName, status: "active", createdAt: now }),
    db.insert(memberships).values({ id: membershipId, organizationId, userId, role: "manager", createdAt: now }),
    db.insert(teams).values({ id: crypto.randomUUID(), organizationId, name: "Core Support", timezone: "Europe/Belgrade", createdAt: now }),
    db.insert(configurationVersions).values({ id: crypto.randomUUID(), organizationId, version: 1, status: "active", payload: { shadowMode: true, defaultTimezone: "Europe/Belgrade", teamProfile: "small" }, createdByUserId: userId, createdAt: now }),
    db.insert(auditEvents).values({ id: crypto.randomUUID(), organizationId, actorUserId: userId, action: "organization.bootstrapped", targetType: "organization", targetId: organizationId, metadata: { role: "manager", source: "authenticated_onboarding" }, createdAt: now }),
  ]);
  return NextResponse.json({ organizationId, role: "manager" }, { status: 201 });
}
