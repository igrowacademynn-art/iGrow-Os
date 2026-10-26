# iGrow Remote Operations – V1 handover

This module extends the existing iGrow OS. It **does not** use a separate login, domain, or database. The new **Remote operations** menu is visible to owner/admin, front desk, teachers, and restricted helper users. Normal parent accounts cannot access it.

## Staff and Atman helper flow

1. Ask the owner to create a dedicated named staff login under **Users & access**. Choose **helper** for volunteers who should not see student, finance, or admissions records. Do not share logins.
2. Open **Remote operations → My day** on a mobile device and tap **Check in** on arrival. The server records time. Check in is a staff declaration; there is no location/GPS verification.
3. For each relevant work conversation, log call, WhatsApp/SMS, in-person or internal contact. Save name/contact label, reason, outcome, response, and next step. Every attempt may be a separate record.
4. On no answer, waiting or follow-up, enter a next action and follow-up date. Escalate owner decisions using **Needs owner**. After a reply, record the new contact and close the old pending item with an explanation. Both history and closure are audited.
5. Accept assigned tasks, change to in-progress, report blockers and submit completion with an outcome. Owner verifies completed work.
6. At exit, check out and report accomplished work, difficulties, and the handover. **Remote work** should be logged as a remote interaction instead of pretending to be a centre attendance check-in.

## Owner review flow

- **Team today** shows staff-reported check-ins and outs and counts of logged interactions.
- **Communication log** filters by day, person, channel, and keyword, and shows the actual narrated outcome, responses, next step and resolution.
- **Tasks & accountability** assigns owners, due dates, priority, blocked/submitted status, and owner verification.
- **Owner report** summarises logged work and completed shift handovers.

## What is not automatic

- This does **not** automatically read WhatsApp, call records, or conversations from devices. Staff must submit work summaries.
- Logging a call does not independently prove it occurred. It shows who submitted a declaration at a server timestamp.
- Do not use counts of calls or check-in time alone to rank people. Review difficult cases, outcomes and verified task completion.
- Live alerts, notifications, automatic cross-linking to fee/admission records, and reconciliation with official phone/message logs are **not yet integrated**.
- There are no covert monitoring, background GPS, microphone capture or automatic call recordings.

## Privacy and security

- Helpers have no generic records access and cannot see children, family contacts, financials or other helpers' logged work.
- Teachers/front-desk can view only their own operations log; admins can view operations of the entire team.
- Every update to shifts, follow-up closure and task status is written to the existing audit history; event creation also records the actor.
- Inform staff/volunteers what work is recorded and why. Log only centre-related communication, not private discussion.
- Parent/student data in a note must be minimised and shared only with authorised users. Do not record unnecessary sensitive personal information. 
- Users need a signed-in account; the existing access controls apply. Avoid shared passwords.

## Deployment

This feature is implemented on a **development branch** and should be typechecked/tested and reviewed before merge or deployment. The existing production site does not change merely because the PR is opened.

For first-time iGrow production usage, owner bootstrap/account creation may still be necessary. See `docs/owner-setup.md`. Once owner access is set up, create separate accounts for Kalai, seniors, and Atman helpers, then test with one demo communication and task before rollout.
