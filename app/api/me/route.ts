import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getTenantContext } from "../../lib/tenant";

export async function GET() {
  const identity = await getChatGPTUser();
  if (!identity) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const tenant = await getTenantContext(identity);
  if (!tenant) return NextResponse.json({ error: "No TeamOps membership" }, { status: 403 });
  return NextResponse.json({ identity, tenant });
}
