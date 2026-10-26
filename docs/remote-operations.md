# iGrow Remote Operations — release notes (V1)

This module adds two authenticated views inside iGrow OS:
- **Operations > My day / Communication log / Tasks** for frontdesk, teachers, helpers, and administrators.
- **Operations > Team today / Owner report** for the administrator only.

## Before first use
1. Finish the private iGrow owner setup if the account has not yet been claimed.
2. Deploy this PR only after checking the database migration and the build/test checks. No action was taken on production while preparing the feature.
3. As an administrator, create separate accounts in **Users & access**. Use the new `helper` role for community helpers who should not see general child, financial or family data. Create a unique account for each person; do not share passwords.
4. From **Operations**, assign concrete tasks with owners and due dates.
5. Explain to helpers that check-in is a timestamped self-report, not location-verified attendance.

## Daily procedure
- At arrival: open **Operations > My day > Check in**.
- Log **each relevant call attempt, WhatsApp message, in-person discussion, internal coordination or completed work item** with a purpose, factual summary, reply if applicable, outcome, and a next step for unfinished items.
- If a parent did not answer, choose **No answer** and add the next step and follow-up date. Do not imply a conversation occurred.
- Staff update assigned work as **In progress**, **Blocked**, or **Submitted for review**. The owner alone marks a task **Verified**.
- Before departure: check out with completed work, problems, and a handover.
- Owner checks the team report, unresolved follow-ups, handovers, and unverified submissions.

## Boundaries and limitations
- Communication data is **manually entered**. This does not intercept WhatsApp, listen to phone calls, capture private chats, or automatically infer what was said. Entries record the signed-in user and server time.
- Timed check-ins are **staff-submitted** and do not independently prove physical attendance. Confirm critical visits with the centre supervisor.
- Internal notes should summarise relevant operational decisions, not personal conversations. Only enter necessary parent/child information. Keep sensitive medical, financial or child welfare details in the existing restricted iGrow modules.
- The owner can see all operation logs; helpers can see only their own logs and tasks assigned to them. Logs are append-only via these endpoints, with database audit. Shift close and task updates retain audited before/after values.
- “Done” work is self-reported until the owner verifies it. Do not infer quality, integrity or productivity from raw call counts alone.
- No SMS/WhatsApp API integration, push notifications, GPS/QR verification, offline queue, attachments, call recordings, data-retention scheduler or automatic follow-up reminders in V1.
- The view requires a running authenticated production app and database. No sample/real parent interactions are seeded.

## Review checklist
- [ ] `npm run build` passes
- [ ] `npm test` passes, including helper read-scope
- [ ] First owner setup and existing login are unaffected
- [ ] Admin can create a helper; helper sees no general records
- [ ] Helper check-in prevents a second open shift; checkout requires summary
- [ ] Staff log a missed call with required next step/date, and see it in their timeline
- [ ] Owner sees who submitted that log, with server timestamp
- [ ] Helper cannot read other staff's entries through operations API
- [ ] Admin assigns a task; helper submits; only admin can verify
- [ ] Owner report and filtering work on a phone as well as desktop
- [ ] Existing student attendance, payments and parent portal still work
