# TeamOps AI — Code Patterns

> **AI agents: Follow these patterns exactly when writing new code.**
> All examples are taken from the real codebase. Do not invent new patterns.

---

## API Route Pattern

Every API route follows this exact structure:
1. Resolve identity from SIWC headers
2. Resolve tenant context (org + user + role)
3. Check permission
4. Validate input
5. Run DB operation (always org-scoped)
6. Write audit event in the same batch

```typescript
// app/api/your-feature/route.ts
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, yourTable } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { can } from "../../lib/authorization";
import { getTenantContext } from "../../lib/tenant";

// Always resolve auth the same way
async function context() {
  const identity = await getChatGPTUser();
  return identity ? getTenantContext(identity) : null;
}

export async function GET() {
  const tenant = await context();
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Always filter by organizationId — never skip this
  const db = getDb();
  const records = await db.select()
    .from(yourTable)
    .where(eq(yourTable.organizationId, tenant.organizationId));

  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const tenant = await context();
  if (!tenant || !can(tenant.role, "your:permission")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate input at the boundary — never trust the client
  const body = await request.json() as { name?: string };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const db = getDb();

  // Write data + audit event in one atomic batch
  await db.batch([
    db.insert(yourTable).values({
      id,
      organizationId: tenant.organizationId,
      name: body.name.trim(),
      createdAt: now,
    }),
    db.insert(auditEvents).values({
      id: crypto.randomUUID(),
      organizationId: tenant.organizationId,
      actorUserId: tenant.userId,
      action: "your_entity.created",       // format: entity.verb
      targetType: "your_entity",
      targetId: id,
      metadata: { name: body.name },        // include relevant context
      createdAt: now,
    }),
  ]);

  return NextResponse.json({ id }, { status: 201 });
}
```

---

## Permission Check Pattern

Use `can()` for conditional logic. Use `assertPermission()` inside utilities
where you want an immediate throw.

```typescript
import { can, assertPermission } from "../../lib/authorization";

// Conditional: show different data based on role
const condition = can(tenant.role, "leave:read:any")
  ? eq(leaveRequests.organizationId, tenant.organizationId)
  : and(
      eq(leaveRequests.organizationId, tenant.organizationId),
      eq(leaveRequests.requesterUserId, tenant.userId)
    );

// Hard block: throw immediately if not permitted
assertPermission(tenant.role, "schedule:publish"); // throws "FORBIDDEN" if denied
```

**Available permissions:**
```typescript
manager:  ["team:read", "team:write", "member:invite", "skill:write",
           "leave:read:any", "leave:approve", "schedule:read:any",
           "schedule:write", "schedule:publish", "audit:read", "config:write"]

employee: ["team:read", "leave:create", "leave:read:own",
           "schedule:read:own", "schedule:acknowledge"]

auditor:  ["team:read", "leave:read:any", "audit:read"]
```

---

## Drizzle ORM Patterns

### Single record fetch (safe — always check org scope)
```typescript
const [record] = await db.select()
  .from(yourTable)
  .where(and(
    eq(yourTable.id, id),
    eq(yourTable.organizationId, tenant.organizationId)  // always include this
  ))
  .limit(1);

if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
```

### Update with audit
```typescript
await db.batch([
  db.update(yourTable)
    .set({ status: "approved", updatedAt: now })
    .where(eq(yourTable.id, record.id)),
  db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    organizationId: tenant.organizationId,
    actorUserId: tenant.userId,
    action: "your_entity.approved",
    targetType: "your_entity",
    targetId: record.id,
    metadata: { previousStatus: record.status },
    createdAt: now,
  }),
]);
```

### Join pattern
```typescript
const rows = await db.select({
  organizationId: memberships.organizationId,
  userId: users.id,
  role: memberships.role,
}).from(users)
  .innerJoin(memberships, eq(memberships.userId, users.id))
  .where(eq(users.email, email.toLowerCase()))
  .limit(1);
```

---

## Schema Pattern

All tables go in `db/schema.ts`. Never define tables elsewhere.

```typescript
// db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const yourTable = sqliteTable("your_table", {
  id:             text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),   // always include
  name:           text("name").notNull(),
  status:         text("status", {
                    enum: ["active", "archived"]
                  }).notNull().default("active"),
  createdAt:      integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt:      integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

After editing `db/schema.ts`, always run:
```bash
npx drizzle-kit generate   # creates migration file in /drizzle
npx drizzle-kit migrate    # applies it locally
```

Never edit files in `/drizzle/` manually.

---

## Audit Event Action Names

Use the format `entity.verb` consistently:

| Entity | Actions |
|---|---|
| `leave_request` | `leave.requested`, `leave.approved`, `leave.rejected`, `leave.cancelled` |
| `schedule` | `schedule.published`, `schedule.cancelled`, `schedule.superseded` |
| `shift` | `shift.created`, `shift.updated`, `shift.deleted` |
| `member` | `member.invited`, `member.joined`, `member.removed` |
| `skill` | `skill.assigned`, `skill.verified`, `skill.removed` |
| `team` | `team.created`, `team.updated`, `team.archived` |

---

## Error Response Pattern

Always return `{ error: string }` with an appropriate HTTP status:

```typescript
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
return NextResponse.json({ error: "Forbidden" }, { status: 403 });
return NextResponse.json({ error: "Not found" }, { status: 404 });
return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
```

Never return 200 with an error field. Never throw unhandled errors to the client.

---

## What NOT to Write

```typescript
// ❌ Never raw SQL
db.run("SELECT * FROM users WHERE org_id = ?", [orgId]);

// ❌ Never skip org scope
db.select().from(schedules);  // missing .where(eq(...organizationId...))

// ❌ Never use any
const body = await request.json() as any;

// ❌ Never console.log in production paths
console.log("user:", tenant.userId);

// ❌ Never default export for utilities
export default function can() { ... }

// ❌ Never write data without an audit event in the same batch
await db.insert(yourTable).values({ ... });  // missing audit event
```
