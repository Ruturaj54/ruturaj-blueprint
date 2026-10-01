// Plain-text versions of both mails. Some clients show only this, and it is
// what a notification preview reads — so it carries the same plan, in order.

import { formatHM } from './schedule.mjs';
import { SITE_URL } from './mail.mjs';
import { shortDate, leadMission } from './coach.mjs';

const TIER = { 1: 'Course 1 · Apna', 2: 'Course 2 · 5ME', 3: 'Practice' };

const line = (s = '') => `${s}\n`;

function timetable(d) {
  return [
    ...d.schedule.slots.flatMap((s) => [
      line(`  ${s.start}-${s.end}  ${s.label}`),
      ...s.items.map((i) =>
        line(
          `      - ${i.title} (${i.partial && i.totalMinutes ? `${formatHM(i.minutes)} of ${formatHM(i.totalMinutes)}` : formatHM(i.minutes)})${i.carried ? ' — carried over' : ''}`,
        ),
      ),
    ]),
    d.schedule.overflow.length
      ? line(`  CONTINUES TOMORROW: ${d.schedule.overflow.map((i) => `${i.title} (${formatHM(i.minutes)} left)`).join(' · ')}`)
      : '',
  ];
}

function health(d) {
  const h = d.health;
  const out = [];
  if (h.doctor.length) out.push(line(`  Doctor-directed: ${h.doctor.map((x) => x.name).join(', ')} — exactly as prescribed`));
  if (h.weight) out.push(line(`  Weight: ${h.weight.latest.kg} kg (${shortDate(h.weight.latest.date)})${h.weight.entries > 1 ? `, ${h.weight.change > 0 ? '+' : ''}${h.weight.change} kg since ${shortDate(h.weight.first.date)}` : ''}`));
  if (h.noSugarStreak > 0) out.push(line(`  No added sugar: ${h.noSugarStreak}-day streak`));
  if (h.tipDo) out.push(line(`  Do: ${h.tipDo.line}`));
  if (h.tipAvoid) out.push(line(`  Avoid: ${h.tipAvoid.line}`));
  if (!out.length) out.push(line('  Set up your health focus on the Health page — it stays in your private store.'));
  return out;
}

export function morningText(d, { q, challenge, praise, avoid, grow, intro }) {
  const lead = leadMission(d);
  return [
    line(`${d.dayType === 'weekday' ? 'GOOD MORNING RUTURAJ' : d.dayType.toUpperCase()} — Day ${d.day} of 161 · ${d.weekday} ${d.dateLabel}`),
    line(`${d.phase.label} ${d.phase.title} · ${d.daysLeft} days to 10 Mar 2027`),
    line(),
    line(`"${q.line}"`),
    line(),
    intro ? line(intro) : '',
    intro ? line() : '',
    lead ? line(`RUTURAJ, DO THIS TODAY — ${lead.title}`) : '',
    lead ? line(`  ${lead.coach.doThis}`) : '',
    lead ? line(`  Why: ${lead.coach.why}`) : '',
    lead ? line(`  Go harder: ${lead.coach.harder}`) : '',
    lead ? line(`  Proof by tonight: ${lead.coach.proof}`) : '',
    lead ? line() : '',
    line("TODAY'S MISSIONS"),
    ...d.missions.map((m, i) =>
      line(`  ${i + 1}. ${m.title} (${[TIER[m.tier], m.context].filter(Boolean).join(' · ')})${m.carriedFrom ? ' — carried over' : ''}`),
    ),
    line(),
    line(d.dayType === 'weekday' ? 'YOUR DAY — EVERY HOUR' : `YOUR ${d.dayType.toUpperCase()}`),
    ...timetable(d),
    line(),
    line('HEALTH TODAY'),
    ...health(d),
    line(),
    line('AVOID TODAY'),
    ...avoid.map((a) => line(`  - ${a}`)),
    line(),
    line(`YOU ARE GROWING: ${grow.line}`),
    line(`  ${grow.stats.map((s) => `${s.label} ${s.value}`).join(' · ')}`),
    line(),
    line('THE PLAN'),
    ...d.courses.map((c) =>
      line(`  ${c.label}: ${c.done}/${c.total}${c.status === 'done' ? ' — complete' : c.etaDate ? ` — at three a day, done by ${shortDate(c.etaDate)}` : ''}`),
    ),
    line(),
    line(`DSA TARGET: ${d.dsa.target} problems${d.dsa.weakest ? ` — start with ${d.dsa.weakest}` : ''}`),
    line(`  ${d.dsa.total} logged · ${d.dsa.accuracy}% clean · ${d.dsa.streak}-day streak`),
    line(),
    praise ? line(`WORTH NAMING: ${praise}`) : '',
    line(`THE CHALLENGE: ${challenge}`),
    line(),
    line(`Open today's plan: ${SITE_URL}/#/today`),
  ].join('');
}

export function eveningText(d, { eq, questions, recovery, tomorrow }) {
  const t = d.todayLog;
  const w = d.weekStats;
  return [
    line(`RUTURAJ — DAILY ACCOUNTABILITY — Day ${d.day} of 161 · ${d.weekday} ${d.dateLabel}`),
    line(),
    t && t.score !== null
      ? line(`PLANNED VS ACTUAL: ${t.completed}/${t.planned} of your plan — ${t.score}%${(t.extras ?? 0) > 0 ? ` (plus ${t.extras} extra)` : ''}`)
      : line('PLANNED VS ACTUAL: today was never started in the app.'),
    t && t.missed.length ? line(`  Carries to tomorrow: ${t.missed.join(' · ')}`) : '',
    line(`  Focused minutes: ${d.focusToday}`),
    ...(t?.done ?? []).slice(0, 8).map((x) => line(`  + ${x}`)),
    d.dayType === 'sunday'
      ? line(`WEEK ${d.week}: ${w.pct === null ? '—' : `${w.pct}%`} of plan · ${w.problems} problems · ${w.runs} runs · ${formatHM(w.focusMinutes)} focus`)
      : '',
    line(`DAILY CARE: ${d.health.habits.done.length} of ${d.health.habits.total} ticked${d.health.habits.done.length ? ` (${d.health.habits.done.join(', ')})` : ''}`),
    line(),
    line(`"${eq}"`),
    line(),
    d.praise?.hasWins ? line(`WHAT YOU DID WELL: ${d.praise.headline}`) : '',
    ...(d.praise?.wins ?? []).map((x) => line(`  + ${x.label} — ${x.detail}`)),
    d.praise?.hasWins ? line() : '',
    line('ANSWER HONESTLY'),
    ...questions.map((q) => line(`  - ${q}`)),
    line(),
    line(`DSA streak ${d.dsa.streak} · ${d.dsa.total} problems · ${d.daysLeft} days left`),
    line(),
    recovery ? line(`RECOVERY: ${recovery}`) : '',
    line(`${d.dayType === 'sunday' ? "MONDAY'S FIRST MISSION" : "TOMORROW'S MISSION"}: ${tomorrow}`),
    line(),
    line(`Log it: ${SITE_URL}/#/today`),
  ].join('');
}
