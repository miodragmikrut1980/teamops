"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Profile = "small" | "medium" | "large";
type Role = "manager" | "employee" | "auditor";
type Member = { id: string; name: string; email: string; role: Role; status: string };
type TeamData = {
  members: Member[];
  teams: { id: string; name: string; timezone: string }[];
  queues: { id: string; name: string; code: string; active: boolean }[];
  products: { id: string; name: string; active: boolean }[];
  skills: { id: string; name: string; category: string; certificationRequired: boolean }[];
  assignments: { id: string; userId: string; skillId: string; level: number; certificationName: string | null }[];
  invitations: { id: string; email: string; role: Role; status: string }[];
  teamProfile: Profile;
  capabilities: { manage: boolean };
};

const emptyData: TeamData = { members: [], teams: [], queues: [], products: [], skills: [], assignments: [], invitations: [], teamProfile: "small", capabilities: { manage: false } };

export default function TeamSetup({ role, notify }: { role: Role; notify: (message: string) => void }) {
  const [data, setData] = useState<TeamData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"people" | "structure" | "skills">("people");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const response = await fetch("/api/team-setup", { cache: "no-store" });
    if (!response.ok) { setError("Team configuration could not be loaded."); setLoading(false); return; }
    setData(await response.json()); setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/team-setup", { cache: "no-store" }).then(async response => {
      if (!active) return;
      if (!response.ok) setError("Team configuration could not be loaded.");
      else setData(await response.json());
      setLoading(false);
    }).catch(() => { if (active) { setError("Team configuration could not be loaded."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  async function act(payload: Record<string, unknown>, success: string) {
    setError("");
    const response = await fetch("/api/team-setup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error ?? "The change could not be saved."); return false; }
    notify(success); await load(); return true;
  }

  const profileInfo = useMemo(() => ({
    small: { label: "Small", range: "Up to 20 people", detail: "People, roles and essential skills", enabled: "Simple setup" },
    medium: { label: "Medium", range: "21–100 people", detail: "Multiple teams, queues and products", enabled: "Standard operations" },
    large: { label: "Large", range: "101+ people", detail: "Certifications and advanced segmentation", enabled: "Advanced controls" },
  }), []);

  if (loading) return <div className="team-loading"><i /><p><strong>Loading team configuration</strong><span>Checking organization access and current setup…</span></p></div>;

  return <div className="team-setup">
    <section className="team-intro">
      <div><small>TEAM & SKILLS SETUP</small><h2>Configure only what your team needs</h2><p>Start simple and unlock more structure as the operation grows. Your data remains in one model.</p></div>
      <div className="setup-health"><b>{data.members.length}</b><span>active members</span><em>{data.teamProfile} profile</em></div>
    </section>

    {data.capabilities.manage && <section className="profile-picker" aria-label="Team size profile">
      {(Object.keys(profileInfo) as Profile[]).map(profile => <button key={profile} className={data.teamProfile === profile ? "selected" : ""} onClick={() => void act({ action: "setTeamProfile", profile }, `${profileInfo[profile].label} team profile activated.`)}>
        <i>{data.teamProfile === profile ? "✓" : profile === "small" ? "1" : profile === "medium" ? "2" : "3"}</i><p><strong>{profileInfo[profile].label}</strong><span>{profileInfo[profile].range}</span><small>{profileInfo[profile].detail}</small></p><em>{profileInfo[profile].enabled}</em>
      </button>)}
    </section>}

    <nav className="setup-tabs">
      <button className={tab === "people" ? "active" : ""} onClick={() => setTab("people")}>People <b>{data.members.length}</b></button>
      <button className={tab === "structure" ? "active" : ""} onClick={() => setTab("structure")}>Structure <b>{data.teams.length + data.queues.length + data.products.length}</b></button>
      <button className={tab === "skills" ? "active" : ""} onClick={() => setTab("skills")}>Skills <b>{data.skills.length}</b></button>
    </nav>
    {error && <div className="setup-error">! {error}</div>}

    {tab === "people" && <PeoplePanel data={data} canManage={data.capabilities.manage} act={act} />}
    {tab === "structure" && <StructurePanel data={data} canManage={data.capabilities.manage} act={act} />}
    {tab === "skills" && <SkillsPanel data={data} canManage={data.capabilities.manage} act={act} />}
    {!data.capabilities.manage && <p className="readonly-note">Read-only access for {role}. A Manager must make configuration changes.</p>}
  </div>;
}

function PeoplePanel({ data, canManage, act }: PanelProps) {
  return <section className="setup-grid"><article className="setup-card wide"><SetupHead title="Organization members" sub="Roles are enforced on the server for every action" />
    <div className="member-list">{data.members.map(member => <div className="member-row" key={member.id}><div className="member-avatar">{initials(member.name)}</div><p><strong>{member.name}</strong><span>{member.email}</span></p>{canManage ? <select className="role-select" value={member.role} onChange={e => void act({ action: "changeRole", userId: member.id, role: e.target.value }, `${member.name}'s role updated.`)}><option value="manager">Manager</option><option value="employee">Employee</option><option value="auditor">Auditor</option></select> : <b className={`role-badge ${member.role}`}>{member.role}</b>}<em className="active-dot">● {member.status}</em></div>)}</div>
  </article>{canManage && <InviteForm act={act} invitations={data.invitations} />}</section>;
}

function InviteForm({ act, invitations }: { act: ActionFn; invitations: TeamData["invitations"] }) {
  const [email, setEmail] = useState(""); const [role, setRole] = useState<Role>("employee"); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); if (await act({ action: "invite", email, role }, `Invitation prepared for ${email}.`)) setEmail(""); setBusy(false); }
  return <article className="setup-card"><SetupHead title="Invite a teammate" sub="Invitation expires after 7 days" /><form className="setup-form" onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" /></label><label>Role<select value={role} onChange={e => setRole(e.target.value as Role)}><option value="employee">Employee</option><option value="manager">Manager</option><option value="auditor">Auditor</option></select></label><button disabled={busy}>{busy ? "Saving…" : "Create invitation"}</button></form>{invitations.slice(0, 3).map(item => <div className="pending-invite" key={item.id}><span>{item.email}</span><b>{item.role}</b><em>{item.status}</em></div>)}</article>;
}

function StructurePanel({ data, canManage, act }: PanelProps) {
  const profile = data.teamProfile;
  return <div className="structure-stack"><section className="structure-columns"><ResourceCard icon="◎" title="Teams" items={data.teams.map(x => [x.name, x.timezone])} form={canManage ? <SimpleCreate action="createTeam" labels={["Team name", "Timezone"]} defaults={["", "Europe/Belgrade"]} keys={["name", "timezone"]} act={act} /> : null} />
    {profile !== "small" && <ResourceCard icon="≋" title="Support queues" items={data.queues.map(x => [x.name, x.code])} form={canManage ? <SimpleCreate action="createQueue" labels={["Queue name", "Code"]} defaults={["", ""]} keys={["name", "code"]} act={act} /> : null} />}
    {profile !== "small" && <ResourceCard icon="◇" title="Products" items={data.products.map(x => [x.name, x.active ? "Active" : "Inactive"])} form={canManage ? <SimpleCreate action="createProduct" labels={["Product name"]} defaults={[""]} keys={["name"]} act={act} /> : null} />}</section>
    {profile === "small" && <UpgradeHint title="Queues and products stay hidden for small teams" text="Switch to Medium when separate support queues or product ownership becomes useful." />}
    {profile === "large" && <UpgradeHint title="Large-team foundation enabled" text="The data model is ready for locations, reporting lines and enterprise identity controls in later releases." />}
  </div>;
}

function SkillsPanel({ data, canManage, act }: PanelProps) {
  const [name, setName] = useState(""); const [category, setCategory] = useState("Technical"); const [cert, setCert] = useState(false);
  const [userId, setUserId] = useState(""); const [skillId, setSkillId] = useState(""); const [level, setLevel] = useState("3");
  async function submit(event: FormEvent) { event.preventDefault(); if (await act({ action: "createSkill", name, category, certificationRequired: data.teamProfile === "large" && cert }, `${name} skill created.`)) setName(""); }
  return <section className="setup-grid"><article className="setup-card wide"><SetupHead title="Skill matrix" sub="Levels 1–5 make coverage matching explainable" />{data.skills.length ? <div className="skill-list">{data.skills.map(skill => <div key={skill.id}><span>{skill.category}</span><strong>{skill.name}</strong>{skill.certificationRequired && <b>Certificate required</b>}<em>{data.assignments.filter(x => x.skillId === skill.id).length} people</em></div>)}</div> : <Empty text="No skills configured yet." />}</article>
    {canManage && <div className="setup-side"><article className="setup-card"><SetupHead title="Add a skill" sub={data.teamProfile === "small" ? "Keep the initial list focused" : "Build a reusable capability catalog"}/><form className="setup-form" onSubmit={submit}><label>Skill name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Linux troubleshooting" /></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option>Technical</option><option>Product</option><option>Language</option><option>Process</option></select></label>{data.teamProfile === "large" && <label className="check"><input type="checkbox" checked={cert} onChange={e => setCert(e.target.checked)} /> Certification required</label>}<button>Add skill</button></form></article>{data.members.length > 0 && data.skills.length > 0 && <article className="setup-card"><SetupHead title="Assign proficiency" sub="Verified skill level from 1 to 5"/><form className="setup-form" onSubmit={async e => { e.preventDefault(); if (await act({ action: "assignSkill", userId: userId || data.members[0].id, skillId: skillId || data.skills[0].id, level: Number(level) }, "Skill proficiency assigned.")) setLevel("3"); }}><label>Member<select value={userId} onChange={e => setUserId(e.target.value)}>{data.members.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label>Skill<select value={skillId} onChange={e => setSkillId(e.target.value)}>{data.skills.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label>Level<select value={level} onChange={e => setLevel(e.target.value)}>{[1,2,3,4,5].map(x => <option key={x} value={x}>{x} — {x === 1 ? "Basic" : x === 5 ? "Expert" : "Proficient"}</option>)}</select></label><button>Assign skill</button></form></article>}</div>}
  </section>;
}

type ActionFn = (payload: Record<string, unknown>, success: string) => Promise<boolean>;
type PanelProps = { data: TeamData; canManage: boolean; act: ActionFn };
function SetupHead({ title, sub }: { title: string; sub: string }) { return <header className="setup-head"><h3>{title}</h3><p>{sub}</p></header>; }
function Empty({ text }: { text: string }) { return <div className="setup-empty">{text}</div>; }
function UpgradeHint({ title, text }: { title: string; text: string }) { return <aside className="upgrade-hint"><b>✦</b><p><strong>{title}</strong><span>{text}</span></p></aside>; }
function ResourceCard({ icon, title, items, form }: { icon: string; title: string; items: string[][]; form: React.ReactNode }) { return <article className="resource-card"><header><b>{icon}</b><h3>{title}</h3><em>{items.length}</em></header>{items.length ? items.map((item, i) => <div className="resource-row" key={`${item[0]}-${i}`}><strong>{item[0]}</strong><span>{item[1]}</span></div>) : <Empty text={`No ${title.toLowerCase()} yet.`} />}{form}</article>; }
function SimpleCreate({ action, labels, defaults, keys, act }: { action: string; labels: string[]; defaults: string[]; keys: string[]; act: ActionFn }) { const [values, setValues] = useState(defaults); async function submit(e: FormEvent) { e.preventDefault(); const payload: Record<string, unknown> = { action }; keys.forEach((key, i) => payload[key] = values[i]); if (await act(payload, `${labels[0]} saved.`)) setValues(defaults); } return <form className="inline-create" onSubmit={submit}>{labels.map((label, i) => <input key={label} aria-label={label} required value={values[i]} placeholder={label} onChange={e => setValues(values.map((value, index) => index === i ? e.target.value : value))} />)}<button aria-label={`Add ${labels[0].toLowerCase()}`}>＋</button></form>; }
function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase(); }
