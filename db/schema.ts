import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  timezone: text("timezone").notNull().default("Europe/Belgrade"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["manager", "employee", "auditor"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [uniqueIndex("membership_org_user_idx").on(table.organizationId, table.userId)]);

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  teamId: text("team_id").notNull().references(() => teams.id),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [uniqueIndex("team_member_team_user_idx").on(table.teamId, table.userId)]);

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  email: text("email").notNull(),
  role: text("role", { enum: ["manager", "employee", "auditor"] }).notNull(),
  status: text("status", { enum: ["pending", "accepted", "revoked", "expired"] }).notNull().default("pending"),
  invitedByUserId: text("invited_by_user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const queues = sqliteTable("queues", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [uniqueIndex("queue_org_code_idx").on(table.organizationId, table.code)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  certificationRequired: integer("certification_required", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [uniqueIndex("skill_org_name_idx").on(table.organizationId, table.name)]);

export const userSkills = sqliteTable("user_skills", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  userId: text("user_id").notNull().references(() => users.id),
  skillId: text("skill_id").notNull().references(() => skills.id),
  level: integer("level").notNull(),
  certificationName: text("certification_name"),
  certificationExpiresAt: integer("certification_expires_at", { mode: "timestamp" }),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [uniqueIndex("user_skill_user_skill_idx").on(table.userId, table.skillId)]);

export const leaveRequests = sqliteTable("leave_requests", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  requesterUserId: text("requester_user_id").notNull().references(() => users.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  note: text("note"),
  status: text("status", { enum: ["pending", "approved", "rejected", "cancelled"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const scheduleVersions = sqliteTable("schedule_versions", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  teamId: text("team_id").references(() => teams.id), version: integer("version").notNull(),
  status: text("status", { enum: ["draft", "published", "superseded", "cancelled"] }).notNull().default("draft"),
  weekStart: text("week_start").notNull(), createdByUserId: text("created_by_user_id").notNull().references(() => users.id),
  publishedAt: integer("published_at", { mode: "timestamp" }), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, table => [uniqueIndex("schedule_org_week_version_idx").on(table.organizationId, table.weekStart, table.version)]);

export const shifts = sqliteTable("shifts", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  scheduleVersionId: text("schedule_version_id").notNull().references(() => scheduleVersions.id),
  userId: text("user_id").notNull().references(() => users.id), startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp" }).notNull(), timezone: text("timezone").notNull(),
  kind: text("kind", { enum: ["regular", "on_call", "training"] }).notNull().default("regular"),
  status: text("status", { enum: ["planned", "confirmed", "cancelled"] }).notNull().default("planned"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const availability = sqliteTable("availability", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  userId: text("user_id").notNull().references(() => users.id), date: text("date").notNull(),
  status: text("status", { enum: ["available", "unavailable", "preferred"] }).notNull(), note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, table => [uniqueIndex("availability_user_date_idx").on(table.userId, table.date)]);

export const scheduleAcknowledgements = sqliteTable("schedule_acknowledgements", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  scheduleVersionId: text("schedule_version_id").notNull().references(() => scheduleVersions.id),
  userId: text("user_id").notNull().references(() => users.id), acknowledgedAt: integer("acknowledged_at", { mode: "timestamp" }).notNull(),
}, table => [uniqueIndex("schedule_ack_user_idx").on(table.scheduleVersionId, table.userId)]);

export const configurationVersions = sqliteTable("configuration_versions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  version: integer("version").notNull(),
  status: text("status", { enum: ["draft", "active", "superseded"] }).notNull(),
  payload: text("payload", { mode: "json" }).notNull(),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [uniqueIndex("config_org_version_idx").on(table.organizationId, table.version)]);

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  actorUserId: text("actor_user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  metadata: text("metadata", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
