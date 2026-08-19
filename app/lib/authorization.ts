export const permissions = {
  manager: ["team:read", "team:write", "member:invite", "skill:write", "leave:read:any", "leave:approve", "audit:read", "config:write"],
  employee: ["team:read", "leave:create", "leave:read:own", "schedule:read:own"],
  auditor: ["team:read", "leave:read:any", "audit:read"],
} as const;

export type Role = keyof typeof permissions;
export type Permission = (typeof permissions)[Role][number];

export function can(role: Role, permission: string): boolean {
  return (permissions[role] as readonly string[]).includes(permission);
}

export function assertPermission(role: Role, permission: string): void {
  if (!can(role, permission)) throw new Error("FORBIDDEN");
}
