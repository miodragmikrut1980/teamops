"use client";

import { useState } from "react";

export default function OnboardingClient({ displayName }: { displayName: string }) {
  const [name, setName] = useState("EMEA Support");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createWorkspace() {
    setBusy(true); setError("");
    const response = await fetch("/api/bootstrap", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationName: name }) });
    if (response.ok) window.location.reload();
    else { const body = await response.json().catch(() => ({})); setError(body.error ?? "Workspace setup failed."); setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-card"><div className="auth-mark">T</div><small>TEAMOPS AI · SECURE SETUP</small><h1>Welcome, {displayName}</h1><p>Create the first organization workspace. Your signed-in account becomes its Manager and every setup action is recorded.</p><label>Organization name<input value={name} maxLength={80} onChange={event => setName(event.target.value)} /></label>{error && <div className="auth-error">{error}</div>}<button className="primary" disabled={busy || name.trim().length < 2} onClick={createWorkspace}>{busy ? "Creating workspace…" : "Create secure workspace"}</button><span>Tenant isolation · Role-based access · Immutable audit trail</span></section></main>;
}
