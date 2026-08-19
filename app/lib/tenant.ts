import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { memberships, organizations, users } from "../../db/schema";
import type { ChatGPTUser } from "../chatgpt-auth";
import type { Role } from "./authorization";

export type TenantContext = { organizationId: string; userId: string; role: Role; organizationName: string };

export async function getTenantContext(identity: ChatGPTUser): Promise<TenantContext | null> {
  const db = getDb();
  const rows = await db.select({
    organizationId: memberships.organizationId,
    userId: users.id,
    role: memberships.role,
    organizationName: organizations.name,
  }).from(users)
    .innerJoin(memberships, eq(memberships.userId, users.id))
    .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
    .where(eq(users.email, identity.email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}
