import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import DashboardClient from "./dashboard-client";
import OnboardingClient from "./onboarding-client";
import { getTenantContext } from "./lib/tenant";

export const dynamic = "force-dynamic";

export default async function Home() {
  const identity = await getChatGPTUser();
  if (!identity) return <main className="auth-page"><section className="auth-card"><div className="auth-mark">T</div><small>TEAMOPS AI</small><h1>Your support operation, under control.</h1><p>Sign in to access schedules, coverage risks, workload and decisions for your authorized organization only.</p><a className="primary auth-link" href={chatGPTSignInPath("/")}>Sign in with ChatGPT</a><span>Secure identity · Tenant isolation · Human-controlled AI</span></section></main>;
  const tenant = await getTenantContext(identity);
  if (!tenant) return <OnboardingClient displayName={identity.displayName} />;
  return <DashboardClient displayName={identity.displayName} role={tenant.role} organizationName={tenant.organizationName} />;
}
