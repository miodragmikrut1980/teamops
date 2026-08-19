# TeamOps AI — Project Management Plan

**Status:** Discovery  
**Document version:** 0.1  
**Date:** 2026-08-19  
**Product type:** Multi-tenant B2B SaaS for support-team operations  
**Working product name:** TeamOps AI

---

## 1. Product vision

TeamOps AI gives support managers one operational view of schedules, leave, skills, ticket workload, customer ratings, escalations, and coverage risks. It recommends several explainable coverage options while preserving human approval.

### Product promise

> In less than two minutes, a manager can see who is working, where coverage will fail, why it will fail, and the safest and fairest ways to resolve it.

### Primary users

- Support Manager
- Team Lead
- Support Engineer / Employee
- Workforce Planner, in later releases
- Operations Director, in later releases

### Initial ideal customer profile

- B2B technical-support organization
- 20–200 support employees
- Multiple shifts, queues, skills, products, or time zones
- Ticket, leave, schedule, and quality data currently distributed across several tools
- Clear SLA and escalation obligations
- Willing to run a shadow-mode pilot

---

## 2. Product principles

1. **One operational picture:** schedules, absence, workload, skills, and risk must be visible together.
2. **Human-controlled AI:** no schedule or staffing change is published without approval.
3. **Explain every recommendation:** show reasons, trade-offs, confidence, and missing data.
4. **Configuration over custom code:** company-specific rules are stored as tenant configuration.
5. **Fairness by design:** distribute nights, weekends, and extra coverage fairly.
6. **No surveillance:** do not track screens, keystrokes, or unrelated employee activity.
7. **Quality over raw volume:** do not judge employees only by resolved-ticket count.
8. **Start narrow:** solve daily coverage for technical-support teams before expanding into general HR/WFM.
9. **Data confidence is visible:** recommendations must expose stale, incomplete, or conflicting input data.
10. **Mobile-first employee experience:** employees must complete common actions quickly from a phone.

---

## 3. MVP outcome and success criteria

### MVP outcome

A manager can import or synchronize team, schedule, leave, skill, and ticket data; see today's coverage and workload; simulate a staffing change; review three ranked coverage options; approve one; and notify affected employees.

### Pilot success metrics

| Metric | Target |
|---|---:|
| Reduction in daily planning/checking time | ≥ 60% |
| Reduction in uncovered intervals | ≥ 30% |
| Reduction in tickets entering SLA risk | 15–25% |
| Reduction in post-publication schedule changes | 10–20% |
| Recommendations accepted or lightly edited | ≥ 70% |
| Users rating explanations clear and fair | ≥ 80% |
| Critical cross-tenant data leaks | 0 |
| Unauthorized schedule publication | 0 |
| Audit coverage for staffing changes | 100% |

These are pilot hypotheses, not sales promises, until validated with real customers.

---

## 4. Scope

### MVP in scope

- Multi-tenant organizations
- Secure authentication
- Manager and Employee experiences
- Role-based access-control foundation
- Teams, locations, time zones, queues, and products
- Skill and certification matrix
- ROTA, shifts, on-call duties, and rotation templates
- Leave and other absence requests
- CSV/XLSX import for employees, shifts, absence, tickets, and CSAT
- One production ticketing integration
- Today Command Center
- Weighted workload score
- Coverage-gap detection
- Basic ticket-volume forecast
- AI-assisted coverage recommendations
- What-if simulations
- Approval and schedule publication
- Employee notifications
- Employee shift-swap request
- Audit log
- Export and basic data-retention controls
- Responsive web application / PWA

### MVP out of scope

- Payroll
- Full HRIS replacement
- Automated disciplinary or performance decisions
- Public employee leaderboards
- Autonomous schedule publication
- Native iOS and Android applications
- Dozens of enterprise integrations
- Generic project management
- Screen, keyboard, or presence surveillance
- Cross-customer model training without explicit contractual approval

---

## 5. Roles and permissions

### Manager

- View team schedules, absence, skills, workload, CSAT, and escalations
- View coverage and capacity risks
- Run simulations
- Review, edit, approve, and publish recommendations
- Approve leave and shift swaps
- Configure team-level rules within granted scope
- Access team analytics and audit history

### Employee

- View own schedule and on-call duty
- View relevant team coverage and manager-on-duty
- View own workload, priority tickets, and warnings
- Request leave or a shift swap
- Accept an offered shift
- Confirm schedule changes
- View reasons for recommendations affecting them
- Report incorrect data or inability to cover

### Architecture requirement

The MVP user interface may expose two account types, but authorization must use granular roles and permissions so Team Lead, Scheduler, HR Read-only, Executive, and Auditor roles can be added without redesign.

---

## 6. Workstreams

| Workstream | Purpose | MVP owner |
|---|---|---|
| Product & UX | Validate workflows and make daily decisions fast | Product Lead |
| Core Platform | Tenant isolation, auth, RBAC, audit, configuration | Backend Lead |
| Workforce | ROTA, shifts, absence, on-call, availability | Full-stack Lead |
| Ticket Intelligence | Ticket ingestion, workload, SLA risk, trends | Data/Backend Lead |
| Coverage Engine | Constraint validation, scoring, recommendation ranking | AI/Optimization Lead |
| Integrations | CSV/XLSX and initial ticketing connector | Integration Engineer |
| Employee Experience | Mobile schedule, requests, confirmation, notifications | Frontend Lead |
| Security & Compliance | Privacy, access control, logging, retention | Security Owner |
| Quality Engineering | Automated tests, E2E, performance, accessibility | QA Lead |
| Pilot & Analytics | Baseline, shadow mode, feedback, outcome measurement | Product + Customer Success |

One person may own several workstreams in a small team.

---

## 7. Delivery phases

### Phase 0 — Discovery and data audit

**Duration:** 2–3 weeks  
**Exit gate:** Validated workflow, data map, and approved MVP backlog

Deliverables:

- Interview 5–10 support managers and 10 employees
- Inventory the five or more systems currently checked manually
- Map source ownership, API availability, data latency, and permissions
- Define canonical terms: shift, coverage, available, backlog, escalation, SLA risk
- Define initial weighted-workload formula
- Define hard and soft coverage constraints
- Document 20 realistic coverage scenarios and expected manager decisions
- Create clickable manager and employee prototypes
- Test the prototype with at least three managers and five employees
- Capture privacy and employee-trust concerns
- Select the first ticketing integration

### Phase 1 — Foundation

**Duration:** 3 weeks  
**Exit gate:** Secure tenant and identity foundation passes automated tests

Deliverables:

- Repository and CI pipeline
- Environments: local, test, staging, production
- Organization and tenant model
- Authentication and session security
- Granular RBAC
- User, team, time-zone, queue, and skill models
- Immutable audit-event framework
- Feature flags and configuration versioning
- Observability and error tracking

### Phase 2 — Workforce operations

**Duration:** 3 weeks  
**Exit gate:** A manager can create and publish a conflict-free schedule

Deliverables:

- Shift and rotation templates
- Weekly and daily ROTA
- On-call duties
- Availability and absence
- Leave approval workflow
- Conflict detection
- Employee schedule view
- Change confirmation and notification framework

### Phase 3 — Ticket and workload intelligence

**Duration:** 3 weeks  
**Exit gate:** Dashboard workload matches validated sample calculations

Deliverables:

- CSV/XLSX import and validation report
- Canonical ticket snapshot and event models
- Initial ticketing connector
- Queue and ownership mapping
- Backlog by age, priority, queue, and employee
- Weighted workload score
- Incoming/resolved trends
- SLA-risk and stale-ticket detection
- CSAT display with sample-size context
- Data freshness and confidence indicators

### Phase 4 — Coverage intelligence

**Duration:** 3 weeks  
**Exit gate:** Recommendation engine passes all agreed scenarios

Deliverables:

- Capacity demand by interval and skill
- Coverage-gap detection
- Basic historical forecast
- Hard-constraint solver
- Soft-constraint scoring
- Three ranked coverage options
- Explanation, confidence, missing-data, and trade-off output
- Reasons why other employees were not selected
- What-if simulation
- Recommendation feedback: accept, edit, reject, and reason

### Phase 5 — Command Center and pilot hardening

**Duration:** 2–3 weeks  
**Exit gate:** Staging release meets security, quality, and pilot-readiness criteria

Deliverables:

- Today Command Center
- Coverage timeline and risk cards
- Escalation summary
- Manager approval and publication flow
- Employee shift-swap flow
- Email and one chat-channel integration
- Shadow mode
- Baseline and outcome analytics
- Accessibility, performance, security, and E2E testing
- Runbooks, backup, restore test, and incident plan
- Pilot onboarding guide

### Estimated MVP duration

Approximately 14–18 weeks for a focused, experienced team after discovery. A solo or part-time implementation will require materially more time.

---

## 8. Epics and acceptance criteria

### EPIC-01 — Multi-tenant identity and access

**Goal:** Each company and user accesses only authorized data and actions.

Acceptance criteria:

- A user belongs to an organization and one or more teams.
- All tenant-owned records require a tenant identifier.
- Tenant isolation is enforced server-side, not only in the UI.
- Manager and Employee permissions are covered by authorization tests.
- Privilege changes are audited.
- Cross-tenant access tests fail closed.
- Session revocation is supported.

### EPIC-02 — Team setup and configuration

**Goal:** A new company can configure its operating model without code changes.

Acceptance criteria:

- Manager can configure teams, queues, products, locations, and time zones.
- Manager can create skills, proficiency levels, and required certifications.
- Manager can set minimum coverage by interval, queue, and skill.
- Configuration changes are versioned.
- Invalid or contradictory rules are rejected with a clear explanation.
- A configuration can be tested in simulation mode before activation.

### EPIC-03 — ROTA, shifts, and on-call

**Goal:** Managers and employees share a reliable schedule.

Acceptance criteria:

- Manager can create shifts manually or from templates.
- Schedule supports multiple time zones and daylight-saving transitions.
- Overlapping shifts and unavailable employees trigger conflicts.
- Schedule versions have Draft, Published, Superseded, and Cancelled states.
- Employees see only published schedules unless granted planning access.
- Every publication and subsequent change is audited.

### EPIC-04 — Absence and availability

**Goal:** Leave decisions include their operational impact.

Acceptance criteria:

- Employee can request leave with dates, partial days, and optional notes.
- Manager sees projected coverage impact before approval.
- Approved absence removes the employee from available capacity.
- The system proposes alternatives but never autonomously rejects leave.
- Sensitive absence reasons are permission-restricted.
- Conflicting data from calendar and manual sources is flagged.

### EPIC-05 — Ticket data and workload

**Goal:** Workload reflects complexity and urgency, not only ticket count.

Acceptance criteria:

- Import validates required fields and produces row-level error feedback.
- Reimport is idempotent.
- Ticket age, priority, SLA status, queue, owner, and escalation state are retained.
- Workload weights are configurable and versioned.
- Workload calculations are reproducible for a given rule version.
- Data freshness and last successful sync are visible.
- CSAT includes response count and time window.

### EPIC-06 — Today Command Center

**Goal:** A manager understands today's operational state in under 30 seconds.

Acceptance criteria:

- Header shows planned, available, absent, and at-risk capacity.
- Timeline shows coverage by hour and relevant skill/queue.
- Dashboard highlights the three most urgent risks.
- Backlog, SLA risk, and active escalations are visible without opening another product area.
- Manager can filter by team, time zone, queue, product, and skill.
- Every metric links to its definition and source freshness.
- Desktop and mobile layouts have no horizontal page overflow.

### EPIC-07 — Forecast and coverage gaps

**Goal:** Detect likely understaffing before service deteriorates.

Acceptance criteria:

- Forecast can operate at daily and hourly intervals.
- The model stores expected volume and confidence range.
- Manager can exclude outliers or add known events.
- Required capacity calculation is versioned and explainable.
- A gap identifies interval, queue/skill, missing capacity, and severity.
- Cold-start mode clearly states when history is insufficient.

### EPIC-08 — Coverage Recommendation Engine

**Goal:** Produce safe, fair, and explainable staffing options.

Acceptance criteria:

- Hard constraints can never be overridden by ranking.
- Each recommendation contains affected people, period, assignment, and expected effect.
- Three options are returned where feasible.
- Each option includes benefits, remaining risks, confidence, and missing inputs.
- The system lists important reasons for excluding candidates.
- Fairness penalties consider recent nights, weekends, and extra coverage.
- Manager can accept, edit, or reject with a reason.
- No change is published without an authorized human action.
- Recommendation inputs, rule version, model version, output, and decision are logged.

### EPIC-09 — Employee experience

**Goal:** Employees can understand and manage their schedule from a phone.

Acceptance criteria:

- Employee sees today's shift, upcoming shifts, on-call duty, and manager-on-duty.
- Employee can request leave or a shift swap.
- Employee can accept or decline offered coverage.
- Employee can see why a recommendation affects them.
- Employee can report an incorrect skill, absence, schedule, or workload input.
- Sensitive team performance data is not exposed.
- Common tasks meet mobile accessibility requirements.

### EPIC-10 — Notifications and approvals

**Goal:** Changes reach the right people and receive explicit confirmation.

Acceptance criteria:

- Notifications support in-app and email in MVP.
- One Teams or Slack connector is supported for pilot.
- Messages include action, effective time, owner, and approval status.
- Repeated delivery is idempotent.
- Failed delivery is retried and visible to managers.
- Critical changes require employee acknowledgement when configured.

### EPIC-11 — Audit, privacy, and administration

**Goal:** Operational decisions are traceable and privacy controls are enforceable.

Acceptance criteria:

- Audit events cannot be edited through application APIs.
- Audit captures actor, action, target, time, tenant, and relevant before/after values.
- Retention rules can be configured by tenant.
- Data export and deletion workflows are documented.
- Employees can view relevant personal data and submit corrections.
- Recommendation data is excluded from shared model training by default.
- Administrative secrets are never returned to the browser.

### EPIC-12 — Pilot measurement

**Goal:** Prove or disprove value with measurable evidence.

Acceptance criteria:

- Baseline metrics are captured before recommendations influence decisions.
- Shadow-mode recommendations cannot publish changes.
- Acceptance, edit, rejection, and rejection reason are measured.
- Planning time, coverage gaps, SLA risk, overtime, and employee feedback are tracked.
- Reports distinguish correlation from validated improvement.

---

## 9. Initial prioritized backlog

### P0 — Required for pilot

- PM-001: Confirm ideal customer profile and pilot team
- PM-002: Map current tools, files, and data owners
- PM-003: Define canonical operational vocabulary
- PM-004: Create 20 coverage test scenarios
- UX-001: Prototype Today Command Center
- UX-002: Prototype employee mobile schedule
- SEC-001: Implement tenant isolation and RBAC
- CORE-001: Organization, user, team, queue, and skill models
- WFM-001: Shift, ROTA, rotation, and on-call models
- WFM-002: Availability and absence workflow
- DATA-001: CSV/XLSX import with validation
- DATA-002: Ticket snapshot and workload calculation
- INT-001: First ticketing connector
- FORE-001: Basic demand forecast
- COV-001: Coverage-gap engine
- COV-002: Constraint-based candidate selection
- COV-003: Ranked options and explanations
- UI-001: Today Command Center implementation
- EMP-001: Employee schedule and request experience
- FLOW-001: Approval, publication, and notifications
- AUD-001: Recommendation and staffing audit trail
- PILOT-001: Shadow mode and outcome measurement
- QA-001: Unit, integration, authorization, and E2E test suites

### P1 — Commercial pilot

- Real-time ticket sync
- Escalation ownership and handover
- Intraday reforecast
- Microsoft Teams/Slack actions
- Outlook/Google Calendar synchronization
- No-code rule builder
- Dashboard customization
- SSO/SAML and SCIM
- Advanced retention and data-residency controls
- Coaching opportunities with strict permission boundaries

### P2 — Scale

- Additional ticketing and HR connectors
- Full schedule generation
- Shift bidding and open-shift marketplace
- Advanced QA analytics
- Executive portfolio view
- Mobile native application, only if validated
- Template marketplace
- Industry-specific configuration packs

---

## 10. Suggested sprint plan

Assumption: two-week sprints after Discovery.

| Sprint | Main objective | Demonstrable result |
|---:|---|---|
| 0 | Discovery and architecture | Approved workflows, scenarios, data map, ADRs |
| 1 | Identity and tenant foundation | Secure organization with Manager/Employee access |
| 2 | Team and skill setup | Configurable team, queue, product, and skill matrix |
| 3 | ROTA and absence | Publish a schedule and process leave |
| 4 | Employee experience | Employee sees shifts and submits requests on mobile |
| 5 | Ticket import and workload | Validated backlog and workload dashboard |
| 6 | First integration and freshness | Automated sync with visible data health |
| 7 | Forecast and gaps | Predict demand and show uncovered intervals |
| 8 | Recommendation engine | Three constraint-safe coverage options |
| 9 | Command Center | Complete manager daily workflow |
| 10 | Approvals and notifications | Approved plan reaches affected employees |
| 11 | Shadow mode and measurement | Pilot runs without operational side effects |
| 12 | Hardening and pilot release | Security, E2E, performance, docs, and release candidate |

Adjust sprint count after discovery; do not preserve dates at the cost of unsafe or incomplete foundations.

---

## 11. Technical decision record

Initial recommendations to confirm through Architecture Decision Records:

- **Frontend:** Next.js, React, TypeScript
- **Backend:** FastAPI/Python or NestJS/TypeScript modular monolith
- **Database:** PostgreSQL
- **Jobs/cache:** Redis plus Celery/RQ or BullMQ
- **Optimization:** OR-Tools or equivalent constraint solver
- **Forecasting:** versioned statistical/ML service with confidence intervals
- **LLM use:** explanation, summarization, and natural-language querying only
- **Files:** object storage for imports and exports
- **Integrations:** adapter interface, webhooks, scheduled sync, idempotency keys
- **Events:** transactional outbox before adopting a message broker
- **Deployment:** containerized staging and production environments
- **Observability:** structured logs, metrics, traces, error tracking, audit separation

### Non-negotiable architecture constraints

- Tenant authorization is checked in the backend for every request.
- Optimization results are deterministic or reproducible for stored inputs and versions.
- LLM output cannot bypass constraint validation.
- Every staffing decision can be traced to source inputs and rule/model versions.
- External synchronization is retryable and idempotent.
- Dates are stored consistently; user-visible times respect tenant and employee time zones.
- Sensitive absence and coaching data have separate permissions.

---

## 12. Quality strategy

### Required automated tests

- Domain unit tests
- Workload formula tests
- Forecast input/output contract tests
- Constraint and fairness scenario tests
- Tenant-isolation tests
- Role and permission matrix tests
- Import validation and idempotency tests
- Integration contract tests
- API integration tests
- Migration tests
- Browser E2E for critical Manager and Employee journeys
- Accessibility checks
- Mobile viewport and horizontal-overflow tests
- Time-zone and daylight-saving tests
- Backup and restore validation

### Critical E2E journeys

1. Manager imports team and ticket data, sees validation results, and opens Command Center.
2. Employee requests leave; manager sees coverage impact and approves it.
3. System detects a gap, proposes options, manager edits and approves one.
4. Affected employee receives and acknowledges the change.
5. Unauthorized employee cannot view another employee's sensitive metrics.
6. Tenant A cannot access any Tenant B identifier or object.
7. Failed external sync leaves previous data intact and exposes stale-data status.
8. Shadow mode cannot publish or notify a real staffing change.

---

## 13. Definition of Ready

A story is ready when:

- User and business outcome are clear.
- Acceptance criteria are testable.
- Permission and privacy impact are identified.
- Required data sources and field mappings are known.
- Loading, empty, error, stale-data, and permission-denied states are specified.
- UX design exists for user-facing work.
- Dependencies are resolved or explicitly scheduled.
- Analytics events are defined where needed.
- Test approach is agreed.

---

## 14. Definition of Done

A story is done when:

- Acceptance criteria pass.
- Code is reviewed.
- Unit and relevant integration/E2E tests pass.
- Authorization is verified server-side.
- Tenant isolation is covered where applicable.
- Audit behavior is implemented where applicable.
- Accessibility and responsive behavior are verified.
- Error, empty, loading, stale-data, and retry states work.
- Logs contain no secrets or unnecessary personal data.
- Metrics and alerts are added for production-critical behavior.
- Documentation and configuration examples are updated.
- Database migration and rollback strategy are reviewed.
- Feature is demonstrated in staging.
- Product owner accepts the outcome.

---

## 15. Release gates

### Alpha gate

- Core workflows work with seeded data
- Tenant and RBAC tests pass
- Workload is reproducible
- Coverage scenarios pass at least 90%
- No critical accessibility blocker

### Pilot gate

- Real pilot data import succeeds
- Shadow mode is enforced
- Recommendation audit is complete
- Backup and restore are tested
- Security review has no unresolved critical/high issue
- All critical E2E journeys pass
- Support and incident runbooks exist
- Manager and employee onboarding materials exist

### Commercial gate

- SSO and enterprise access requirements validated
- Retention/export/deletion workflows validated
- Connector reliability and sync monitoring meet target
- Availability and recovery objectives are documented and tested
- Contractual security and privacy documentation is ready
- Pilot evidence supports commercial ROI claims

---

## 16. Risk register

| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Poor or incomplete source data | High | High | Data quality score, validation, freshness indicators | Data Lead |
| Enterprise API access delayed | High | High | CSV-first pilot, connector abstraction | Product/Integration |
| Employees perceive surveillance | Medium | High | No invasive tracking, transparency, correction workflow | Product/Privacy |
| Metrics reward simple tickets | High | High | Complexity-adjusted workload and quality context | Product/Data |
| AI selects the same person repeatedly | Medium | High | Fairness constraints and historical burden | Optimization Lead |
| Forecast lacks sufficient history | High | Medium | Cold-start mode and confidence range | Data Lead |
| Scope expands into full HR/WFM | High | High | Enforce MVP boundaries and outcome gates | Product Owner |
| Cross-tenant exposure | Low | Critical | Backend isolation, automated adversarial tests | Security Owner |
| Time-zone/DST schedule errors | Medium | High | UTC model, IANA zones, scenario tests | Backend Lead |
| Managers overtrust recommendation | Medium | High | Explanations, confidence, missing data, approval | Product/AI |
| Labor-law or works-council conflict | Medium | High | Configurable rules, legal review, DPIA | Legal/Privacy |
| Excessive integration maintenance | Medium | High | Canonical model, adapters, connector health telemetry | Integration Lead |

Review the risk register at least once per sprint.

---

## 17. Security and privacy checklist

- Tenant isolation
- Least-privilege RBAC
- SSO readiness
- Strong session controls
- Encryption in transit and at rest
- Secret management
- Immutable operational audit
- Rate limiting and abuse controls
- Input validation and safe file parsing
- Malware scanning for uploaded files where applicable
- Dependency and container scanning
- Backup encryption and restore tests
- Data-retention configuration
- Data export and deletion process
- Personal-data correction workflow
- Restricted absence and coaching information
- No customer data used for shared training by default
- DPIA before broad employee deployment
- EU AI Act and employment-law review before AI-assisted HR decisions

---

## 18. Product analytics

Track:

- Time from manager login to understanding today's risk
- Time from detected gap to approved plan
- Recommendations generated, accepted, edited, and rejected
- Rejection reasons
- Remaining capacity gap after chosen option
- SLA-risk change following staffing action
- Additional shifts by employee over rolling periods
- Fairness distribution for nights, weekends, and extra coverage
- Import and sync success/failure
- Data freshness
- Employee acknowledgement time
- Employee correction requests
- Mobile task completion and abandonment

Do not use product analytics for hidden individual surveillance.

---

## 19. Team operating model

### Recommended small delivery team

- 1 Product Owner / domain expert
- 1 Product Designer
- 1 Frontend Engineer
- 2 Backend/Full-stack Engineers
- 1 Data/AI/Optimization Engineer
- 1 QA Automation Engineer
- Part-time Security/DevOps support
- Pilot Customer Success owner

### Ceremonies

- Weekly product/data discovery
- Two-week sprint planning
- Short daily engineering sync
- Mid-sprint risk and dependency review
- Sprint demo with real workflows
- Retrospective
- Monthly pilot steering review
- Regular employee-feedback session during pilot

### Decision rules

- Product Owner decides scope and sequencing.
- Security owner may block unsafe release.
- Domain assumptions require validation with managers and employees.
- AI changes require scenario-set regression testing.
- Architecture changes are recorded as ADRs.

---

## 20. Immediate next actions

- [ ] Confirm working name: TeamOps AI or CoverPilot
- [ ] Choose first pilot support team
- [ ] Identify current schedule, leave, ticket, CSAT, and escalation sources
- [ ] Obtain approved anonymized sample data
- [ ] Define the first ticketing connector
- [ ] Write 20 real coverage scenarios
- [ ] Define initial hard constraints
- [ ] Define weighted-workload formula v0.1
- [ ] Define fairness rules v0.1
- [ ] Prototype Today Command Center
- [ ] Prototype Employee mobile experience
- [ ] Conduct manager and employee usability sessions
- [ ] Approve MVP backlog and delivery team
- [ ] Create repository, CI, environments, and ADR structure
- [ ] Begin Phase 1 only after Discovery exit gate is met

---

## 21. Product north star

The north-star measure is not the number of schedules generated. It is:

> The percentage of operational intervals in which the required support skills are covered without unfair overload, avoidable SLA risk, or emergency manual coordination.
