"use client";

import { useState } from "react";

type View = "manager" | "employee";
type Page = "Today" | "Schedule" | "Workload" | "Escalations" | "Team";

const people = [
  ["JM", "Jelena Marković", "Senior Support", "Available", 62, 8, "purple"],
  ["PN", "Petar Nikolić", "Support Engineer", "Available", 71, 11, "blue"],
  ["AK", "Ana Kovač", "Linux Specialist", "Leaves 14:00", 84, 13, "orange"],
  ["MS", "Miloš Savić", "Support Engineer", "On P1", 93, 9, "red"],
  ["IL", "Ivana Lukić", "Support Engineer", "Available", 46, 6, "green"],
] as const;

export default function Home() {
  const [view, setView] = useState<View>("manager");
  const [page, setPage] = useState<Page>("Today");
  const [option, setOption] = useState("A");
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  if (view === "employee") {
    return <EmployeeView onSwitch={() => setView("manager")} notify={notify} toast={toast} />;
  }

  return (
    <div className="shell">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <Logo subtitle="AI workforce intelligence" />
        <p className="nav-label">Workspace</p>
        {(["Today", "Schedule", "Workload", "Escalations", "Team"] as Page[]).map((item, i) => (
          <button className={page === item ? "nav active" : "nav"} key={item} onClick={() => { setPage(item); setMenu(false); }}>
            <span>{["⌁", "□", "≋", "◇", "◎"][i]}</span>{item}{item === "Escalations" && <b>2</b>}
          </button>
        ))}
        <p className="nav-label manage">Manage</p>
        <button className="nav" onClick={() => notify("Reports are planned for the next milestone.")}><span>↗</span>Reports</button>
        <button className="nav" onClick={() => notify("Configuration workspace opened.")}><span>⚙</span>Settings</button>
        <div className="sidebar-foot">
          <button className="view-switch" onClick={() => setView("employee")}>⇄ Switch to employee view</button>
          <div className="profile"><Avatar text="MM" color="navy" /><div><strong>Miodrag Mikrut</strong><small>Support Manager</small></div><span>•••</span></div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="hamburger" onClick={() => setMenu(true)} aria-label="Open navigation">☰</button>
          <div><small>Support Operations / {page}</small><h1>{page === "Today" ? "Good morning, Miodrag" : page}</h1></div>
          <div className="top-actions"><button className="square">⌕</button><button className="square">♢</button><button className="primary" onClick={() => notify("Schedule editor is ready.")}>＋ Edit schedule</button></div>
        </header>
        {page === "Today"
          ? <Today option={option} setOption={setOption} notify={notify} />
          : <ModulePage page={page} notify={notify} />}
      </main>
      {menu && <button className="scrim" onClick={() => setMenu(false)} aria-label="Close navigation" />}
      {toast && <Toast text={toast} />}
    </div>
  );
}

function Today({ option, setOption, notify }: { option: string; setOption: (x: string) => void; notify: (x: string) => void }) {
  return <div className="content">
    <div className="live-row"><strong><i />Live overview</strong><span>Tuesday, 19 August · EMEA Support</span><button onClick={() => notify("Operational data refreshed.")}>↻ Refresh data <small>2 min ago</small></button></div>
    <section className="metrics">
      <Metric icon="◉" tone="blue" label="People coverage" value="16 / 18" detail="2 absent today" chip="89% staffed" />
      <Metric icon="≋" tone="purple" label="Active backlog" value="142" detail="12 more than yesterday" chip="+9.2%" warning />
      <Metric icon="△" tone="orange" label="SLA at risk" value="11" detail="3 need action this hour" chip="High priority" warning />
      <Metric icon="♡" tone="green" label="Customer rating" value="94.2%" detail="87 responses · 30 days" chip="+1.8%" />
    </section>
    <section className="risk"><div>⚡</div><p><small>Coverage risk detected</small><strong>Linux / EMEA queue will be understaffed from 14:00–17:00</strong><span>Ana leaves at 14:00 and ticket volume is forecast to rise 31% above the daily average.</span></p><aside><b>HIGH RISK</b><strong>1.4 FTE gap</strong></aside></section>
    <section className="hero-grid">
      <article className="card chart-card">
        <CardHead title="Coverage timeline" sub="Required vs. available capacity by hour" action="View schedule" />
        <div className="legend"><span><i className="a" />Available</span><span><i className="r" />Required</span><span><i className="g" />Coverage gap</span></div>
        <div className="chart">
          {[72, 77, 81, 85, 88, 71, 59, 66, 75, 81].map((height, i) => <div className="bar-wrap" key={i}><div className={i > 4 && i < 8 ? "bar gapbar" : "bar"} style={{ height: height + "%" }} /><small>{i + 8}:00</small></div>)}
          <div className="required-line" />
        </div>
        <div className="chart-alert"><b>14:00</b><span><strong>Coverage drops below requirement</strong> · Linux skills: 2 available / 4 required</span></div>
      </article>
      <article className="card ai-card">
        <header><div className="ai-icon">✦</div><p><small>TEAMOPS AI</small><strong>Coverage plan ready</strong></p><span>•••</span></header>
        <p className="ai-copy">I found three safe options to cover today&apos;s Linux queue gap. All respect availability, skill and fairness rules.</p>
        <div className="confidence"><span>Recommendation confidence</span><i><b /></i><strong>86%</strong></div>
        <Choice id="A" title="Balanced coverage" line="Jelena 14–16h · Petar 16–17h" detail="Best workload balance · No overtime" selected={option === "A"} set={setOption} recommended />
        <Choice id="B" title="Single owner" line="Ivana 14–17h" detail="Better continuity · Moderate backlog impact" selected={option === "B"} set={setOption} />
        <Choice id="C" title="Queue rebalance" line="Move 8 tickets · Petar covers 14–17h" detail="Fastest action · Higher individual load" selected={option === "C"} set={setOption} />
        <button className="approve" onClick={() => notify(`Plan ${option} approved. Team notification prepared.`)}>Approve plan {option} <span>→</span></button>
        <button className="link" onClick={() => notify("What-if simulation opened.")}>Run a what-if simulation</button>
      </article>
    </section>
    <section className="lower-grid">
      <article className="card team-card"><CardHead title="Team workload" sub="Live weighted workload, not just ticket count" action="View team" />
        <div className="people">{people.map(p => <div className="person" key={p[1]}><Avatar text={p[0]} color={p[6]} /><p><strong>{p[1]}</strong><small>{p[2]}</small></p><em className={p[3] === "Available" ? "ok" : p[3] === "On P1" ? "bad" : "away"}>● {p[3]}</em><div className="load"><span>Load <b>{p[4]}%</b></span><i><b className={p[4] > 85 ? "hot" : p[4] > 70 ? "warm" : ""} style={{ width: p[4] + "%" }} /></i></div><div className="tickets"><b>{p[5]}</b><small>tickets</small></div></div>)}</div>
      </article>
      <article className="card escalation-card"><CardHead title="Active escalations" sub="2 critical cases need attention" action="View all" />
        <Incident level="P1" title="Database cluster unavailable" meta="INC-4812 · Acme Financial" owner="Miloš Savić · Updated 12 min ago" time="00:38" />
        <Incident level="P2" title="Intermittent agent disconnects" meta="INC-4798 · NordTel" owner="Jelena Marković · Updated 26 min ago" time="01:24" />
        <button className="handover" onClick={() => notify("Shift handover summary generated.")}>Generate shift handover <span>↗</span></button>
      </article>
    </section>
  </div>;
}

function EmployeeView({ onSwitch, notify, toast }: { onSwitch: () => void; notify: (x: string) => void; toast: string }) {
  return <div className="employee">
    <header className="employee-top"><Logo subtitle="My workspace" /><button className="view-switch light" onClick={onSwitch}>⇄ Manager view</button><Avatar text="JM" color="purple" /></header>
    <div className="employee-content">
      <section className="welcome"><div><p>Tuesday, 19 August</p><h1>Good morning, Jelena</h1><span>Here&apos;s your day at a glance.</span></div><button onClick={() => notify("Availability updated.")}><i /> I&apos;m available</button></section>
      <section className="shift-card"><div className="date"><span>AUG</span><b>19</b><small>TUE</small></div><div className="shift-info"><small>YOUR SHIFT TODAY</small><h2>08:00 – 16:00</h2><p>EMEA Core Support · Remote</p><div><b>Linux</b><b>Instana</b><b>English</b></div></div><div className="manager-duty"><small>MANAGER ON DUTY</small><div><Avatar text="MM" color="navy" /><p><strong>Miodrag Mikrut</strong><span>Available now</span></p></div></div></section>
      <section className="employee-grid">
        <article className="employee-card"><header><div><small>MY WORKLOAD</small><h2>8 active tickets</h2></div><b className="load-chip">62% load</b></header><div className="ticket-focus"><b>P2</b><p><strong>Agent connectivity degraded</strong><span>INC-4798 · Next update in 34 min</span></p><em>→</em></div><div className="stats"><p><b>2</b><span>SLA risk</span></p><p><b>3</b><span>Waiting</span></p><p><b>3</b><span>In progress</span></p></div><button className="link" onClick={() => notify("Your ticket queue opened.")}>Open my queue →</button></article>
        <article className="employee-card request"><div className="ai-icon">✦</div><small>COVERAGE REQUEST</small><h2>Can you cover Linux queue?</h2><p>Today · 14:00–16:00</p><aside><b>Why you?</b><span>Your Linux skill matches, you have capacity, and you haven&apos;t had extra coverage this week.</span></aside><div><button onClick={() => notify("Coverage accepted. Manager will review.")}>Accept</button><button onClick={() => notify("Coverage declined. Your manager was notified.")}>Decline</button></div><button className="link">View impact on my workload</button></article>
        <article className="employee-card week"><header><div><small>UPCOMING SCHEDULE</small><h2>This week</h2></div><button className="link">Full schedule →</button></header>{[["Wed 20","08:00 – 16:00","EMEA"],["Thu 21","08:00 – 16:00","EMEA"],["Fri 22","10:00 – 18:00","EMEA"],["Sat 23","Off","REST DAY"]].map(x => <div className="week-row" key={x[0]}><b>{x[0]}</b><span>{x[1]}</span><em>{x[2]}</em></div>)}</article>
        <article className="employee-card quick"><small>QUICK ACTIONS</small><Quick icon="☼" title="Request time off" sub="See coverage impact before sending" onClick={() => notify("Time-off request opened.")} /><Quick icon="⇄" title="Swap a shift" sub="Find eligible teammates" onClick={() => notify("Shift-swap finder opened.")} /><Quick icon="!" title="Report incorrect data" sub="Schedule, skill or workload" onClick={() => notify("Data correction form opened.")} /></article>
      </section>
    </div>{toast && <Toast text={toast} />}
  </div>;
}

function Logo({ subtitle }: { subtitle: string }) { return <div className="logo"><b>T</b><p><strong>TeamOps</strong><small>{subtitle}</small></p></div>; }
function Avatar({ text, color }: { text: string; color: string }) { return <div className={`avatar ${color}`}>{text}</div>; }
function Metric(p: { icon:string; tone:string; label:string; value:string; detail:string; chip:string; warning?:boolean }) { return <article className="metric"><div className={`metric-icon ${p.tone}`}>{p.icon}</div><p><span>{p.label}</span><strong>{p.value}</strong><small>{p.detail}</small></p><b className={p.warning ? "warn" : ""}>{p.chip}</b></article>; }
function CardHead({ title, sub, action }: { title:string; sub:string; action:string }) { return <header className="card-head"><p><strong>{title}</strong><small>{sub}</small></p><button>{action} →</button></header>; }
function Choice({ id,title,line,detail,selected,set,recommended }: { id:string;title:string;line:string;detail:string;selected:boolean;set:(x:string)=>void;recommended?:boolean }) { return <button className={selected ? "choice selected" : "choice"} onClick={() => set(id)}><i>{selected && <b />}</i><p><strong>{title}{recommended && <em>RECOMMENDED</em>}</strong><span>{line}</span><small>{detail}</small></p></button>; }
function Incident({ level,title,meta,owner,time }: { level:string;title:string;meta:string;owner:string;time:string }) { return <div className={level === "P1" ? "incident p1" : "incident"}><b>{level}</b><p><strong>{title}</strong><span>{meta}</span><small>{owner}</small></p><em>{time}</em></div>; }
function Toast({ text }: { text:string }) { return <div className="toast" role="status"><b>✓</b>{text}</div>; }
function Quick({ icon,title,sub,onClick }: { icon:string;title:string;sub:string;onClick:()=>void }) { return <button onClick={onClick}><b>{icon}</b><p><strong>{title}</strong><span>{sub}</span></p><em>→</em></button>; }
function ModulePage({ page, notify }: { page: Page; notify:(x:string)=>void }) { const copy: Record<string,[string,string]> = { Schedule:["Team schedule","Build rotations, shifts and on-call coverage across time zones."], Workload:["Workload intelligence","Compare weighted workload, backlog age and SLA exposure."], Escalations:["Escalation command","Keep ownership, timers and handovers visible in one place."], Team:["Team & skills","Manage availability, products, languages and certifications."] }; return <div className="module"><div>{page === "Schedule" ? "□" : page === "Workload" ? "≋" : page === "Escalations" ? "◇" : "◎"}</div><small>TEAMOPS MODULE</small><h2>{copy[page][0]}</h2><p>{copy[page][1]}</p><button className="primary" onClick={() => notify(`${page} workflow opened.`)}>＋ Open {page.toLowerCase()}</button></div>; }
