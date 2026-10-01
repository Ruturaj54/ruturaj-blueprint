// The coaching sections of the mail: "Ruturaj, do this", today's missions in
// course order, health, avoid-and-growing, the overall plan, and the weekend
// blocks. Every figure comes from the digest; nothing is estimated.

import { formatHM } from './schedule.mjs';
import { COLORS as C, FONT, esc, bar, pill, card, bullets, label, paragraph, statRow } from './mail.mjs';

const TIER_SHORT = { 1: 'Course 1 · Apna College', 2: 'Course 2 · Five Minute Engineering', 3: 'Practice' };

export const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const gap = (px = 12) => `<div style="height:${px}px;line-height:${px}px;font-size:0;">&nbsp;</div>`;

/** The mission whose coaching card leads the mail — the first one that has one. */
export const leadMission = (d) => d.missions.find((m) => m.coach) ?? null;

function row(title, text) {
  return `<p style="margin:0 0 9px;font:400 13px/1.55 ${FONT};color:${C.muted};"><b style="font-weight:600;color:${C.fg};">${esc(title)}</b> &nbsp;${esc(text)}</p>`;
}

/** "Ruturaj, do this today — it will help you." The lead recommendation. */
export function doThisHtml(d) {
  const m = leadMission(d);
  if (!m) return '';
  const c = m.coach;
  return card(
    `${label('Ruturaj, do this today', C.accent)}
     <p style="margin:0 0 3px;font:600 15px/1.4 ${FONT};color:${C.fg};">${esc(m.title)}</p>
     <p style="margin:0 0 12px;font:400 12px/1.4 ${FONT};color:${C.faint};">${esc(TIER_SHORT[m.tier] ?? m.context)} &middot; ${esc(m.context)}</p>
     <p style="margin:0 0 14px;font:500 15px/1.55 ${FONT};color:${C.fg};">${esc(c.doThis)}</p>
     ${row('Why it helps', c.why)}
     ${row('Go harder', c.harder)}
     ${row('Proof by tonight', c.proof)}`,
    C.accent,
  );
}

/** Today's missions, each tagged with where it sits in the course order. */
export function missionsHtml(d) {
  if (!d.missions.length) {
    return paragraph('Nothing queued — open the roadmap and pull the next milestone forward.');
  }
  const lead = leadMission(d)?.subjectId;
  return d.missions
    .map(
      (m, i) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:11px;"><tr>
        <td width="24" valign="top" style="font:600 13px/1.5 ui-monospace,Menlo,monospace;color:${C.faint};">${i + 1}</td>
        <td>
          <p style="margin:0 0 5px;font:500 15px/1.4 ${FONT};color:${C.fg};">${esc(m.title)}</p>
          <p style="margin:0;">${pill(m.tier ? TIER_SHORT[m.tier] : m.context)} ${pill(formatHM(m.minutes))}${m.carriedFrom ? ` ${pill('carried over', C.accent)}` : ''}</p>
          ${m.coach && m.subjectId !== lead ? `<p style="margin:6px 0 0;font:400 12px/1.5 ${FONT};color:${C.muted};">Do: ${esc(m.coach.doThis)}</p>` : ''}
        </td>
      </tr></table>`,
    )
    .join('');
}

/** Health: doctor-directed items, his own tracking, then general evidence. */
export function healthHtml(d) {
  const h = d.health;
  const parts = [];

  if (h.doctor.length) {
    parts.push(
      label('Doctor-directed — exactly as prescribed', C.success) +
        bullets(
          h.doctor.map((x) => ({
            text: x.dose ? `${x.name} — ${x.dose}` : x.name,
            sub: x.timing === 'night' ? 'Night, with the PM routine' : 'Morning, with breakfast',
          })),
          C.success,
        ),
    );
  }
  if (h.self.length) {
    parts.push(label('Self-added') + bullets(h.self.map((x) => ({ text: x.name })), C.muted));
  }

  const tracking = [];
  if (h.weight) {
    const w = h.weight;
    tracking.push({
      text: `Weight ${w.latest.kg} kg (${shortDate(w.latest.date)})`,
      sub:
        w.entries > 1
          ? `${w.change > 0 ? '+' : ''}${w.change} kg since ${shortDate(w.first.date)} across ${w.entries} weigh-ins`
          : 'First weigh-in logged. The trend starts with the next one.',
    });
  } else if (h.areas.includes('Weight loss')) {
    tracking.push({ text: 'Weight: Metric needed', sub: 'Log a weigh-in on Health — same morning each week.' });
  }
  if (h.noSugarStreak > 0) tracking.push({ text: `No added sugar: ${h.noSugarStreak}-day streak` });
  for (const l of h.labs) tracking.push({ text: `${l.marker}: ${l.value}`, sub: `As reported, ${shortDate(l.date)}` });
  if (h.daysToTest !== null && h.daysToTest >= 0 && h.daysToTest <= 30) {
    tracking.push({ text: `Retest in ${h.daysToTest} day${h.daysToTest === 1 ? '' : 's'} (${shortDate(h.nextTestDate)})` });
  }
  if (tracking.length) parts.push(label('Your tracking') + bullets(tracking, C.info));

  if (h.hasFocus) {
    parts.push(
      label(`General evidence · ${h.evidenceArea}`) +
        paragraph(h.evidence) +
        gap(10) +
        (h.tipDo ? row('Do', h.tipDo.line) : '') +
        (h.tipAvoid ? row('Avoid', h.tipAvoid.line) : ''),
    );
  }

  if (!parts.length) {
    return card(
      `${label('Set up your health focus', C.info)}${paragraph(
        'Health → pick your focus areas, add what your doctor directed, log a weigh-in and your last lab values. Thirty seconds. It stays in your private synced store, not in the public code — and from tomorrow this section tracks it for you.',
      )}`,
      C.info,
    );
  }
  parts.push(
    `<p style="margin:4px 0 0;font:400 11px/1.5 ${FONT};color:${C.faint};">Tracking and general evidence only — never a diagnosis or a dose. Your doctor's plan comes first.</p>`,
  );
  return parts.join(gap(14));
}

/** "Avoid this — you are growing." */
export function avoidGrowHtml(avoid, growing) {
  return card(
    `${label('Avoid today', C.danger)}${bullets(avoid.map((text) => ({ text })), C.danger)}
     ${gap(8)}${label('You are growing', C.success)}
     <p style="margin:0 0 10px;font:400 14px/1.55 ${FONT};color:${C.fg};">${esc(growing.line)}</p>
     ${statRow(growing.stats)}`,
  );
}

const STATUS = {
  done: ['Done', C.success],
  active: ['Now', C.accent],
  next: ['Next', C.info],
  queued: ['After that', C.faint],
};

/** The overall plan: courses in order with a forecast, then the four phases. */
export function planHtml(d) {
  const courses = d.courses
    .map((c) => {
      const [tag, tone] = STATUS[c.status];
      const eta =
        c.status === 'done'
          ? 'Complete.'
          : c.etaDate
            ? `At three a day: done by Day ${c.etaDay} · ${shortDate(c.etaDate)}`
            : `At three a day: past Day 161 — pace has to rise`;
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr><td>
        <p style="margin:0 0 6px;font:500 14px/1.35 ${FONT};color:${c.status === 'queued' ? C.muted : C.fg};">${esc(c.label)} &nbsp;${pill(tag, tone)}</p>
        ${bar(c.pct, tone)}
        <p style="margin:5px 0 0;font:400 11px/1.4 ${FONT};color:${C.faint};">${c.done} of ${c.total} modules &middot; ${esc(eta)}</p>
      </td></tr></table>`;
    })
    .join('');

  const phases = d.phases
    .map((p) => {
      const now = p.id === d.phase.id;
      return `<p style="margin:0 0 5px;font:${now ? 600 : 400} 13px/1.45 ${FONT};color:${now ? C.accent : C.muted};">${esc(p.label)} &nbsp;${esc(p.title)} <span style="color:${C.faint};font-weight:400;">&middot; from ${shortDate(p.startDate)}${now ? ' &middot; you are here' : ''}</span></p>`;
    })
    .join('');

  return `${courses}${gap(4)}${label('The 161 days')}${phases}`;
}

/** The week in numbers, for Saturday ("so far") and Sunday ("closing"). */
export function weekHtml(d) {
  const w = d.weekStats;
  const lines = [];
  if (w.best) lines.push(`Best day: ${shortDate(w.best.date)} at ${w.best.score}%.`);
  if (w.quietDays > 0) lines.push(`${w.quietDays} day${w.quietDays === 1 ? '' : 's'} with nothing closed — name why in tonight's review.`);
  return `${statRow([
    { label: 'Of plan', value: w.pct === null ? '—' : `${w.pct}%`, tone: w.pct !== null && w.pct >= 70 ? C.success : C.fg },
    { label: 'Problems', value: w.problems },
    { label: 'Runs', value: w.runs },
    { label: 'Focus', value: formatHM(w.focusMinutes) },
  ])}${lines.length ? gap(10) + paragraph(lines.join(' ')) : ''}`;
}

/** Saturday and Sunday: the ride, done safely and without undoing the week. */
export function rideHtml() {
  return card(
    `${label('Ride smart — Classic 350', C.success)}${bullets(
      [
        { text: 'Full gear: helmet strapped, gloves, jacket, proper shoes.' },
        { text: 'Down from the ghat before it is fully dark. Share your live location with someone at home.' },
        { text: 'Stops: tender coconut, chaas, unsweetened chai, roasted chana — not cold drinks and fried snacks.' },
        { text: 'Phone in the pocket. This is the one part of the week with no screen — keep it that way.' },
      ],
      C.success,
    )}`,
    C.success,
  );
}

/** Sunday 20:30 — the questions that turn a week into a better next one. */
export function reviewHtml(d) {
  const best = d.weekStats.best;
  return card(
    `${label('Sunday review · 20:30')}${bullets(
      [
        { text: 'What moved the most this week?', sub: best ? `Your best day was ${shortDate(best.date)} at ${best.score}%. What made it work?` : 'Name one module you can now explain without notes.' },
        { text: 'What slipped — and the one change that fixes it?', sub: 'One change, not five. Write it in the weekly review on Analytics.' },
        { text: 'What will you protect next week no matter what?', sub: 'Usually the night block or the morning run.' },
      ],
      C.accent,
    )}`,
  );
}
