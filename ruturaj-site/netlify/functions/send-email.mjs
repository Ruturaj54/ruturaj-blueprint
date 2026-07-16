// Netlify Function — send-email
// Called by "Email Me" button: /.netlify/functions/send-email?type=morning|evening
// Generates a unique, story-driven motivation card daily using SVG→base64 (no extra packages)

import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

// 14 unique themes — each with quote + sub + mission + push (call-to-action) + story (mini-narrative)
const THEMES = [
  { emoji:"🔥", accent:"#e8ff47", g1:"#1a2200", g2:"#0a0f00",
    quote:"WAKE UP RUTURAJ. THIS IS YOUR DAY.",
    sub:"Every minute past 7:30 is a minute Google didn't hire you.",
    mission:"Out of bed in 60 sec · Gym by 7:50 · No snooze",
    push:"DROP THE PHONE. PUT FEET ON FLOOR. GO.",
    story:"Somewhere in Bangalore, a kid who was YOU 5 years ago just woke at 5 AM. He's already on LeetCode. He doesn't know your name yet — but he wants the same offer letter. Out-grind him. TODAY." },

  { emoji:"⚡", accent:"#47c8ff", g1:"#001828", g2:"#000d18",
    quote:"MAANG IS BUILT ON BORING DAILY REPS.",
    sub:"Every great engineer you respect did THIS — same day, again, today.",
    mission:"2 LeetCode mediums + 1 DDIA chapter · Today",
    push:"OPEN LEETCODE. PICK PROBLEM. START.",
    story:"In 2017 a guy in Pune solved 1 LeetCode a day. Boring. Repetitive. By 2020 he was at Google ₹85L. He didn't have a secret — he had a HABIT. Yours starts in the next 30 minutes." },

  { emoji:"💎", accent:"#c084fc", g1:"#1a0030", g2:"#0d0018",
    quote:"YOU HAVE A MOAT. USE IT.",
    sub:"4G/5G + AI is a profile 99% of freshers can't replicate. Build louder.",
    mission:"1 GitHub commit + write 2 lines on LinkedIn",
    push:"CODE FIRST. COFFEE LATER.",
    story:"Picture the recruiter scrolling 200 resumes today. 199 say 'B.Tech, knows Python, did MERN project.' Then YOURS — '4G L2 stack at Parallel Wireless + RAG pipeline + 200 LeetCode'. They stop. They call. That moment = built TODAY." },

  { emoji:"🏆", accent:"#fbbf24", g1:"#1c1400", g2:"#0f0b00",
    quote:"6 MONTHS. YOUR ENTIRE LIFE FLIPS.",
    sub:"You will look back at TODAY as the day you decided. Don't waste it.",
    mission:"Hit 100% on the daily checklist — every box ticked",
    push:"OPEN THE APP. TICK BOX 1. NOW.",
    story:"November 2026, 8:42 AM. Email pings. Subject: 'Offer — Software Engineer L4'. Salary line: ₹68L base + 40L stock. You scroll down. Smile. Cry. Call Mummy-Papa. THAT moment was paid for, in installments, starting TODAY." },

  { emoji:"🚀", accent:"#fb923c", g1:"#1c0800", g2:"#0f0400",
    quote:"FOUNDATION FIRST. THEN ROCKET.",
    sub:"PPA + Logic + Python = the bedrock everything sits on. Strengthen it.",
    mission:"1 PPA chapter + 3 logic problems + 1 Python concept",
    push:"OPEN PPA NOTES. READ FIRST PAGE.",
    story:"You already know 70% of this. The brain that solved problems in 2nd year is still in your skull — it's just dusty. Today you wipe the dust. Tomorrow you sharpen the blade. Next week you cut deep." },

  { emoji:"💪", accent:"#4ade80", g1:"#001c0d", g2:"#000f06",
    quote:"GYM = INTERVIEW PREP TOO.",
    sub:"Strong body = stronger focus. Lower cortisol = better LeetCode pattern recognition.",
    mission:"Gym 7:50 sharp · Cardio 20 min · PPL weights",
    push:"BAG PACKED. GYM SHOES ON. GO.",
    story:"You walk into the L5 interview room. The panel sees: clear skin, sharp jaw, confident posture, calm eyes. Before you say one word, half the battle is won. That walk-in starts at the squat rack — TODAY." },

  { emoji:"🌅", accent:"#ffa94d", g1:"#1c1000", g2:"#0f0800",
    quote:"THE CITY IS ASLEEP. YOU'RE NOT.",
    sub:"Most 23 year olds are still scrolling. You're already moving. That's the gap.",
    mission:"Gym done · Skincare done · Office at 10:00 sharp",
    push:"WIN THE FIRST 90 MINUTES.",
    story:"7:32 AM. 80% of your batch is asleep, hungover, doomscrolling. You? Already drinking water, sun on your face, mind clear. The 6-month gap between you and them isn't talent — it's THIS hour. Right now. Repeated 200 times." },

  { emoji:"🎯", accent:"#f87171", g1:"#1c0008", g2:"#0f0004",
    quote:"FOCUS IS A MUSCLE. TRAIN IT.",
    sub:"Each phone resist = 1 rep for focus. Each scroll = 1 rep against you.",
    mission:"Phone face-down both study blocks · 4 hrs deep work",
    push:"PUT PHONE IN ANOTHER ROOM. NOW.",
    story:"Reels promise 30-second dopamine. LeetCode promises ₹1 CR over 6 months. Your phone is a slot machine designed by 1000 PhDs to steal your future. Beat it. Lock it. Win." },

  { emoji:"🧠", accent:"#86efac", g1:"#001c0a", g2:"#000f05",
    quote:"NEVER MISS TWO IN A ROW.",
    sub:"One bad day = recoverable. Two = identity. Don't let yesterday become a habit.",
    mission:"Whatever you skipped yesterday — DO IT FIRST today",
    push:"FIX THE GAP. TODAY.",
    story:"James Clear's rule: missing once is an accident, missing twice is a NEW HABIT. Right now you're the guy with a streak. One more skip and you're 'the guy who tried'. Don't let yesterday rebrand you. Lift today." },

  { emoji:"📈", accent:"#22d3ee", g1:"#001820", g2:"#000d14",
    quote:"₹1 CR CTC = 100 SMALL WINS COMPOUNDING.",
    sub:"You don't crack MAANG in 1 day. You crack it in 308 small daily wins.",
    mission:"Win TODAY by 9 PM. Repeat tomorrow. Repeat 200x.",
    push:"TICK TODAY'S FIRST BOX RIGHT NOW.",
    story:"₹1 cr = ₹47,619/day for 308 days. That's what TODAY pays — if you do the work. You won't see the deposit, but the bank of your future is recording every rep. Skip today = ₹47,619 stolen from yourself." },

  { emoji:"⚔️", accent:"#fde047", g1:"#1c1800", g2:"#0e0c00",
    quote:"DISCIPLINE > MOTIVATION. ALWAYS.",
    sub:"Motivation runs out by 11 AM. Discipline gets you to 1 AM.",
    mission:"Follow schedule even when you don't feel like it",
    push:"DON'T FEEL IT. JUST DO IT.",
    story:"David Goggins: 'Motivated people quit. Disciplined people don't.' You won't FEEL like LeetCode at 8 PM. You won't FEEL like gym Wednesday. Do it anyway. Discipline is the bridge between who you are and who you said you'd be." },

  { emoji:"🥷", accent:"#a78bfa", g1:"#180030", g2:"#0c0018",
    quote:"SILENT GRIND > LOUD HYPE.",
    sub:"Don't post about it. Don't talk about it. Just SHIP it.",
    mission:"Code in silence · Push to GitHub · Tell no one",
    push:"CLOSE TWITTER. OPEN VS CODE.",
    story:"The loudest grinders rarely make it. The quiet ones do. Show up. Push code. Disappear. In 6 months, when the offer drops, THEN talk. Until then? You don't exist online. Only in commits." },

  { emoji:"💯", accent:"#34d399", g1:"#001c14", g2:"#000d09",
    quote:"SHOW UP EVEN AT 60%.",
    sub:"Bad days happen. The streak doesn't break — you finish at 60% instead of 100%.",
    mission:"At minimum: 1 LeetCode + Gym + 1 study block",
    push:"START SMALL. JUST START.",
    story:"You're tired. You're sick. You don't want to. FINE. Do ONE problem. Do 10 minutes of gym. Touch the keyboard. Half a workout > zero. Half a study block > zero. The streak is the asset — protect it at any cost." },

  { emoji:"🌋", accent:"#f472b6", g1:"#1c0014", g2:"#0e000a",
    quote:"YOUR FUTURE SELF IS WATCHING TODAY.",
    sub:"In 6 months you'll be the one who DID THE WORK — or the one who didn't. Choose now.",
    mission:"Make today's Ruturaj proud of next year's Ruturaj",
    push:"WHAT WILL YOU REGRET BY 9 PM? DO THAT FIRST.",
    story:"Imagine 25-year-old Ruturaj. Earning ₹80L. Healthy. Confident. Engaged. Mom-Dad proud. He's looking back at THIS exact morning, May 2026. He whispers: 'Bhai, please don't waste it. I'm depending on you.' Don't let him down." },
];

function getDayNumber() {
  const start = new Date("2026-07-16T00:00:00+05:30");
  return Math.max(1, Math.floor((new Date() - start) / 86400000) + 1);
}
function getDateStr() {
  return new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Kolkata"
  });
}
function pickTheme(lastIdx) {
  let idx;
  do { idx = Math.floor(Math.random() * THEMES.length); } while (idx === lastIdx && THEMES.length > 1);
  return { theme: THEMES[idx], idx };
}

function escXml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function wrapText(text, maxChars) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

function generateCardSvg(theme, dayNum) {
  const W = 600;
  const quoteLines = wrapText(theme.quote, 26);
  const subLines   = wrapText(theme.sub, 70);
  const storyLines = wrapText(theme.story, 64);

  let quoteY = 168;
  const quoteSvg = quoteLines.map(l => {
    const y = quoteY; quoteY += 36;
    return `<text x="24" y="${y}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="24" fill="${theme.accent}">${escXml(l)}</text>`;
  }).join("\n  ");

  let subY = quoteY + 8;
  const subSvg = subLines.map(l => {
    const y = subY; subY += 18;
    return `<text x="24" y="${y}" font-family="Arial,sans-serif" font-size="12" fill="#aaaaaa">${escXml(l)}</text>`;
  }).join("\n  ");

  const storyTitleY = subY + 22;
  const storyBoxY = storyTitleY + 6;
  const storyTextY = storyBoxY + 22;
  const storyHeight = storyLines.length * 17 + 22;
  const storySvg = storyLines.map((l, i) =>
    `<text x="38" y="${storyTextY + i * 17}" font-family="Georgia,serif" font-style="italic" font-size="13" fill="#e8e8e8">${escXml(l)}</text>`
  ).join("\n  ");

  const missionY = storyBoxY + storyHeight + 20;
  const mLines = wrapText(theme.mission, 70);
  const missionSvg = mLines.map((l, i) =>
    `<text x="38" y="${missionY + 18 + i * 16}" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${theme.accent}">⚡ ${escXml(l)}</text>`
  ).join("\n  ");

  const pillH = Math.max(34, mLines.length * 16 + 22);
  const svgH = Math.max(380, missionY + pillH + 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${theme.g1}"/><stop offset="100%" stop-color="${theme.g2}"/></linearGradient>
  <linearGradient id="bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${theme.accent}"/><stop offset="60%" stop-color="${theme.accent}88"/><stop offset="100%" stop-color="transparent"/></linearGradient>
  <clipPath id="rr"><rect width="${W}" height="${svgH}" rx="18" ry="18"/></clipPath>
</defs>
<rect width="${W}" height="${svgH}" rx="18" ry="18" fill="url(#bg)"/>
<rect y="0" width="${W}" height="4" fill="url(#bd)" clip-path="url(#rr)"/>
<rect x="24" y="24" width="96" height="26" rx="6" fill="${theme.accent}22" stroke="${theme.accent}55" stroke-width="1"/>
<text x="32" y="41" font-family="Courier New,monospace" font-weight="700" font-size="11" fill="${theme.accent}">DAY ${dayNum} / 308</text>
<text x="24" y="112" font-size="42">${theme.emoji}</text>
<text x="24" y="138" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${theme.accent}" opacity="0.75">TODAY'S IGNITION</text>
${quoteSvg}
${subSvg}
<text x="24" y="${storyTitleY}" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${theme.accent}" opacity="0.75">📖 STORY OF THE DAY</text>
<rect x="24" y="${storyBoxY}" width="${W-48}" height="${storyHeight}" rx="8" fill="#000000" fill-opacity="0.35" stroke="${theme.accent}33" stroke-width="1"/>
${storySvg}
<rect x="24" y="${missionY}" width="${W-48}" height="${pillH}" rx="8" fill="${theme.accent}15" stroke="${theme.accent}40" stroke-width="1"/>
${missionSvg}
</svg>`;
}


// ─── plain-text fallback ─────────────────────────────────────────────────────
function buildPlainText(type, body, theme, dayNum, dateStr) {
  const isMorning = type === "morning";
  const pct = body.pct || 0;
  const scoreWord = pct >= 90 ? "PERFECT DAY 🏆" : pct >= 70 ? "GREAT DAY ✅" : pct >= 50 ? "DECENT DAY ⚡" : "NEEDS PUSH ⚠️";
  return [
    isMorning ? "GOOD MORNING RUTURAJ 🌅" : "EVENING CHECK-IN ⚡",
    "Day " + dayNum + " of 308 · " + dateStr,
    "",
    theme.emoji + " " + theme.quote,
    theme.sub,
    "",
    ">>> " + theme.push + " <<<",
    "",
    "STORY OF THE DAY:",
    theme.story,
    "",
    "MISSION: " + theme.mission,
    "",
    isMorning
      ? "STREAK: " + (body.streak||0) + " | LC SOLVED: " + (body.lcTotal||0) + " | AI PROJECTS: " + (body.aiProj||0)
      : "SCORE: " + pct + "% — " + scoreWord + " | TASKS: " + (body.done||0) + "/" + (body.total||20),
    "",
    "RUTURAJ BLUEPRINT · 7 MONTH PLAN · 2026",
  ].join("\n");
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function planRow(ico, time, task, color) {
  return "<tr>"
    + "<td style='padding:5px 10px 5px 0;font-size:17px;'>" + ico + "</td>"
    + "<td style='padding:5px 10px 5px 0;color:" + color + ";font-family:monospace;font-size:12px;white-space:nowrap;'>" + time + "</td>"
    + "<td style='padding:5px 0;color:#cccccc;font-size:13px;'>" + task + "</td>"
    + "</tr>";
}
function chipRow(ico, task, color) {
  return "<tr>"
    + "<td style='padding:4px 10px 4px 0;font-size:17px;'>" + ico + "</td>"
    + "<td style='padding:4px 0;color:#cccccc;font-size:13px;'>" + task + "</td>"
    + "</tr>";
}
function statCell(val, lbl, color) {
  return "<td style='padding:10px 8px;text-align:center;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;'>"
    + "<div style='font-size:20px;font-weight:800;color:" + color + ";font-family:monospace;'>" + val + "</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:3px;'>" + lbl + "</div>"
    + "</td>";
}
function buildPushBlock(theme) {
  return "<div style='background:linear-gradient(135deg," + theme.accent + "18," + theme.accent + "08);border:2px solid " + theme.accent + "55;border-radius:12px;padding:18px 20px;margin-bottom:20px;text-align:center;'>"
    + "<p style='margin:0 0 6px;font-size:9px;letter-spacing:3px;color:" + theme.accent + ";text-transform:uppercase;'>⚡ DO THIS RIGHT NOW</p>"
    + "<p style='margin:0;font-size:18px;font-weight:900;color:#fff;letter-spacing:1px;'>" + theme.push + "</p>"
    + "</div>";
}

// ─── HTML email ───────────────────────────────────────────────────────────────
function buildHtml(type, body, theme, dayNum, dateStr, svgDataUri) {
  const isMorning = type === "morning";
  const { accent } = theme;
  const streak  = body.streak  || 0;
  const done    = body.done    || 0;
  const total   = body.total   || 20;
  const pct     = body.pct     || 0;
  const lcTotal = body.lcTotal || 0;
  const aiProj  = body.aiProj  || 0;
  const filled  = Math.min(10, Math.round(pct / 10));
  const scoreBar  = "█".repeat(filled) + "░".repeat(10 - filled);
  const scoreWord = pct >= 90 ? "PERFECT DAY 🏆" : pct >= 70 ? "GREAT DAY ✅" : pct >= 50 ? "DECENT DAY ⚡" : "NEEDS PUSH ⚠️";

  const statsRow = isMorning
    ? statCell(streak + "🔥", "STREAK", accent) + "<td width='8'></td>"
      + statCell(lcTotal, "LC SOLVED", "#47c8ff") + "<td width='8'></td>"
      + statCell(aiProj, "AI PROJECTS", "#4ade80")
    : statCell(pct + "%", "TODAY SCORE", accent) + "<td width='8'></td>"
      + statCell(done + "/" + total, "TASKS DONE", "#4ade80") + "<td width='8'></td>"
      + statCell(streak + "🔥", "STREAK", "#fb923c");

  const planRows = isMorning
    ? planRow("⏰","7:30 AM","Wake up · 500ml water · AM skincare",accent)
      + planRow("🏋️","7:50 AM","GYM — cardio + PPL weights",accent)
      + planRow("💼","10:00 AM","Office — deliver fast, learn in gaps",accent)
      + planRow("🏠","5:00 PM","Home from office — evening is yours",accent)
      + planRow("🍽️","5:30 PM","Early dinner + family (5:30–6:00)",accent)
      + planRow("🎓","6:00 PM","5 Minute Engineering AI course (6:00–7:00)",accent)
      + planRow("💡","7:30 PM","STUDY BLOCK 1 (2 hrs) — core build",accent)
      + planRow("📖","9:45 PM","STUDY BLOCK 2 (3.25 hrs) — project + AI + DSA",accent)
      + planRow("✨","1:00 AM","PM skincare + Minoxidil",accent)
      + planRow("📝","1:15 AM","Review + plan tomorrow",accent)
      + planRow("😴","2:00 AM","SLEEP — ~5.5–6 hrs",accent)
    : planRow("🍽️","5:30 PM","Early dinner with family (5:30–6:00)",accent)
      + planRow("🎓","6:00 PM","5 Minute Engineering AI course (6:00–7:00)",accent)
      + planRow("💡","7:30 PM","STUDY BLOCK 1 (2 hrs) — core build, phone away",accent)
      + planRow("📖","9:45 PM","STUDY BLOCK 2 (3.25 hrs) — project + AI + GitHub push",accent)
      + planRow("✨","1:00 AM","PM skincare + Minoxidil",accent)
      + planRow("📝","1:15 AM","Review · journal · prep tomorrow",accent)
      + planRow("😴","2:00 AM","SCREENS OFF. SLEEP.",accent);

  const nonNeg = isMorning
    ? [["🏋️","Gym 7:50 AM — no excuses"],["📚","Solve 2 LeetCode problems"],["💻","Push 1 commit to GitHub"],["☀️","AM skincare: Cleanser → Niacinamide → SPF 50+"],["🥗","150g+ protein · 3–4L water"]]
    : [["📚","2 LeetCode problems solved"],["💻","GitHub commit pushed tonight"],["🤖","AI project progress made"],["🌿","PM skincare + Minoxidil done"],["😴","In bed by 2:00 AM"]];
  const nonNegRows = nonNeg.map(([ico,task]) => chipRow(ico, task, accent)).join("");

  const scoreLine = !isMorning
    ? "<div style='background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-family:monospace;font-size:13px;color:#888;'>"
      + "[<span style='color:" + accent + ";'>" + scoreBar + "</span>]&nbsp;&nbsp;"
      + "<span style='color:" + accent + ";font-weight:700;'>" + scoreWord + "</span></div>"
    : "";

  return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
    + "<body style='margin:0;padding:0;background:#080808;'>"
    + "<div style='max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#080808;'>"
    + "<div style='height:4px;background:linear-gradient(to right," + accent + "," + accent + "44,transparent);border-radius:4px;margin-bottom:28px;'></div>"
    + "<p style='margin:0 0 6px;font-size:10px;letter-spacing:4px;color:" + accent + ";text-transform:uppercase;opacity:.85;'>"
    + (isMorning ? "GOOD MORNING RUTURAJ" : "EVENING CHECK-IN") + " &nbsp;·&nbsp; DAY " + dayNum + " OF 308</p>"
    + "<h1 style='margin:0 0 4px;font-size:28px;font-weight:900;color:#f0f0f0;'>"
    + (isMorning ? "🌅 Get Up. Get Moving." : "⚡ Dinner Done. Now Grind.") + "</h1>"
    + "<p style='margin:0 0 24px;font-size:12px;color:#555;'>" + dateStr + "</p>"

    + buildPushBlock(theme)

    + "<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:20px;border-collapse:separate;'>"
    + "<tr>" + statsRow + "</tr></table>"
    + scoreLine

    + "<div style='margin-bottom:20px;border-radius:14px;overflow:hidden;'>"
    + "<img src='" + svgDataUri + "' width='560' style='display:block;width:100%;max-width:560px;border-radius:14px;border:0;' alt='" + escXml(theme.quote) + "'>"
    + "</div>"

    + "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>"
    + (isMorning ? "TODAY'S BATTLE PLAN" : "EVENING PLAN — 5:30 PM → 2:00 AM") + "</p>"
    + "<table cellpadding='0' cellspacing='0' width='100%'>" + planRows + "</table>"
    + "</div>"

    + "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>NON-NEGOTIABLES</p>"
    + "<table cellpadding='0' cellspacing='0' width='100%'>" + nonNegRows + "</table>"
    + "</div>"

    + "<div style='text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;'>"
    + "<p style='margin:0 0 4px;font-size:13px;color:#888;font-weight:700;'>You are 23. " + Math.max(0, 308 - dayNum) + " days till the new you.</p>"
    + "<p style='margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;'>RUTURAJ BLUEPRINT &nbsp;·&nbsp; 7 MONTH PLAN &nbsp;·&nbsp; 2026</p>"
    + "</div>"
    + "</div></body></html>";
}

// ─── main handler ─────────────────────────────────────────────────────────────
export default async function handler(req) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const url     = new URL(req.url);
    const type    = url.searchParams.get("type") || "evening";
    const body    = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const lastIdx = parseInt(body.lastMotivIdx ?? "-1");

    const { theme, idx } = pickTheme(lastIdx);
    const dayNum  = getDayNumber();
    const dateStr = getDateStr();
    const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });
    const isMorning = type === "morning";

    const subject = isMorning
      ? "🌅 D" + dayNum + " · " + shortDate + " · " + theme.quote.slice(0, 38)
      : "⚡ D" + dayNum + " · " + shortDate + " · " + (body.pct||0) + "% · " + (body.pct>=90?"PERFECT 🏆":body.pct>=70?"GREAT ✅":body.pct>=50?"DECENT ⚡":"PUSH ⚠️");

    const svgCard = generateCardSvg(theme, dayNum);
    const svgDataUri = "data:image/svg+xml;base64," + Buffer.from(svgCard).toString("base64");

    const html      = buildHtml(type, body, theme, dayNum, dateStr, svgDataUri);
    const text      = buildPlainText(type, body, theme, dayNum, dateStr);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 587, secure: false,
      auth: { user: SENDER_EMAIL, pass: SENDER_PASS },
    });

    await transporter.sendMail({
      from: '"Ruturaj Blueprint" <' + SENDER_EMAIL + '>',
      to: MY_EMAIL,
      subject,
      text,
      html
    });

    console.log("Email sent — Day " + dayNum + " | " + type + " | theme:" + theme.emoji);
    return new Response(JSON.stringify({ success: true, motivIdx: idx }), { status: 200, headers: cors });
  } catch (err) {
    console.error("Email error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: cors });
  }
}
