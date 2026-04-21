// Netlify Function — triggered by "Email Me" button OR scheduled functions
// URL: /.netlify/functions/send-email?type=morning  OR  ?type=evening

import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

// Each motivation has its own colour theme — every email looks different
const MOTIVATIONS = [
  { emoji:"🔥", accent:"#e8ff47", bg:"#0f1a00", border:"#3a5200",
    quote:"YOU ARE 23. THE TIME IS NOW.",
    sub:"Every hour you sleep past 7:30 AM is an hour someone else used to get ahead. Your 23-year-old body is a machine built for this grind.",
    mission:"Wake at 7:30 · Gym by 7:50 · 2 LeetCode today" },
  { emoji:"⚡", accent:"#47c8ff", bg:"#001a2e", border:"#004e7a",
    quote:"MAANG IS NOT LUCK. IT IS DAILY REPS.",
    sub:"The engineers at Google did not get lucky. They solved 300+ problems. They showed up every single day. You can too — starting today.",
    mission:"Solve 2 LeetCode + read 1 chapter DDIA" },
  { emoji:"💎", accent:"#b47fff", bg:"#150030", border:"#4a0080",
    quote:"YOUR TELECOM BACKGROUND IS A MOAT.",
    sub:"You know 4G/5G internals, DevOps, and production systems. AI on top of this = a profile that 99% of freshers cannot replicate. Build that edge.",
    mission:"Push 1 GitHub commit + 1 AI project task" },
  { emoji:"🏆", accent:"#ffd700", bg:"#1a1200", border:"#5a3e00",
    quote:"SIX MONTHS FROM NOW, EVERYTHING CHANGES.",
    sub:"You will look back at this exact moment as the day you decided. Not someday. Not next week. Today. The plan is built. Now execute.",
    mission:"Complete all checklist tasks today — 100% score" },
  { emoji:"🚀", accent:"#ff6b35", bg:"#1a0a00", border:"#7a2e00",
    quote:"REVISE FIRST. THEN CONQUER.",
    sub:"Month 0 is not wasted time — it is compound interest on what you already know. PPA + Logic + Python = the foundation everything else is built on.",
    mission:"Revise 1 PPA chapter + 3 logic building problems" },
  { emoji:"💪", accent:"#4cff91", bg:"#001a0d", border:"#005a2a",
    quote:"GYM + BRAIN. BOTH. EVERY DAY.",
    sub:"You want to look sharp in the interview room AND think sharp. The gym is not optional — it keeps cortisol low and focus high for studying.",
    mission:"Hit gym by 7:50 AM — do not skip for any reason" },
  { emoji:"🌅", accent:"#ffb347", bg:"#1a0e00", border:"#7a4200",
    quote:"THE MORNING BELONGS TO YOU.",
    sub:"7:30 AM is your competitive advantage. While the city sleeps, you are squatting, lifting, and building the body that walks into Google with confidence.",
    mission:"Gym 7:50 AM · Skincare done · Office by 10:00" },
  { emoji:"📈", accent:"#00e5ff", bg:"#001520", border:"#004d6e",
    quote:"1 CRORE+ IS THE OUTPUT OF DAILY INPUT.",
    sub:"MAANG + AI Engineer salaries are real. They go to people who consistently put in the work. You have 7 months and the right plan. Honour it.",
    mission:"Log 2 study blocks + push to GitHub" },
  { emoji:"🎯", accent:"#ff4757", bg:"#1a0005", border:"#7a0018",
    quote:"FOCUS IS A SKILL. TRAIN IT DAILY.",
    sub:"Every time you resist the phone during study block, you are training focus. Every distracted session weakens it. Make each block count.",
    mission:"Phone in other room during both study blocks" },
  { emoji:"🧠", accent:"#a8ff78", bg:"#091a00", border:"#2e5a00",
    quote:"CONSISTENCY > INTENSITY EVERY SINGLE TIME.",
    sub:"One bad day does not define your journey. One skipped workout, one missed study block — it is fine. Just never miss two in a row. That is the rule.",
    mission:"Study Block 1 (5:30 PM): full 2 hours, no phone" },
];

function getDateStr() {
  return new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Kolkata"
  });
}

function getDayNumber() {
  const start = new Date("2026-04-22T00:00:00+05:30");
  return Math.max(1, Math.round((new Date() - start) / 86400000) + 1);
}

function pickMotivation(lastIdx = -1) {
  let idx;
  do { idx = Math.floor(Math.random() * MOTIVATIONS.length); } while (idx === lastIdx && MOTIVATIONS.length > 1);
  return { motiv: MOTIVATIONS[idx], idx };
}

function row(ico, time, task, accent) {
  return `<tr><td style="padding:4px 8px 4px 0;font-size:16px;vertical-align:top;">${ico}</td><td style="padding:4px 8px 4px 0;color:${accent};font-family:monospace;font-size:12px;white-space:nowrap;vertical-align:top;">${time}</td><td style="padding:4px 0;color:#ccc;font-size:13px;vertical-align:top;">${task}</td></tr>`;
}

function chip(ico, task, accent) {
  return `<tr><td style="padding:4px 10px 4px 0;color:${accent};font-size:16px;vertical-align:top;">${ico}</td><td style="padding:4px 0;color:#ccc;font-size:13px;vertical-align:top;">${task}</td></tr>`;
}

function buildHtmlEmail(type, body, motiv) {
  const { accent, bg, border, emoji, quote, sub, mission } = motiv;
  const dateStr   = getDateStr();
  const dayNum    = getDayNumber();
  const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });

  const streak  = body?.streak  || 0;
  const done    = body?.done    || 0;
  const total   = body?.total   || 20;
  const pct     = body?.pct     || 0;
  const lcTotal = body?.lcTotal || 0;
  const aiProj  = body?.aiProj  || 0;
  const filled  = Math.round(pct / 10);
  const scoreBar = "█".repeat(filled) + "░".repeat(10 - filled);
  const scoreGrade = pct >= 90 ? "🏆 PERFECT DAY" : pct >= 70 ? "✅ GREAT DAY" : pct >= 50 ? "⚡ DECENT DAY" : "⚠️ NEEDS PUSH";
  const isMorning = type === "morning";

  const subject = isMorning
    ? `🌅 Good Morning Ruturaj — Day ${dayNum} · ${shortDate}`
    : `📊 Evening Check-In — Day ${dayNum} · ${shortDate} — ${pct}% — ${scoreGrade}`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;">
<div style="max-width:560px;margin:0 auto;padding:20px;font-family:'Helvetica Neue',Arial,sans-serif;">

  <!-- top gradient bar -->
  <div style="height:3px;background:linear-gradient(90deg,${accent},${accent}66,transparent);border-radius:2px;margin-bottom:24px;"></div>

  <!-- header -->
  <div style="margin-bottom:22px;">
    <div style="font-size:10px;letter-spacing:4px;color:${accent};text-transform:uppercase;opacity:.8;margin-bottom:6px;">${isMorning ? "GOOD MORNING" : "EVENING CHECK-IN"} · DAY ${dayNum} OF 210</div>
    <div style="font-size:26px;font-weight:800;color:#f0f0f0;letter-spacing:-0.5px;">${isMorning ? "🌅 Rise &amp; Conquer" : "⚡ Evening Report"}</div>
    <div style="font-size:12px;color:#555;margin-top:4px;">${dateStr}</div>
  </div>

  <!-- stats row -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-collapse:collapse;">
    <tr>
      ${isMorning ? `
      <td style="padding:10px;text-align:center;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid #222;">
        <div style="font-size:20px;font-weight:800;color:${accent};font-family:monospace;">${streak}🔥</div>
        <div style="font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">STREAK</div>
      </td>
      <td width="8"></td>
      <td style="padding:10px;text-align:center;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid #222;">
        <div style="font-size:20px;font-weight:800;color:#47c8ff;font-family:monospace;">${lcTotal}</div>
        <div style="font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">LC SOLVED</div>
      </td>
      <td width="8"></td>
      <td style="padding:10px;text-align:center;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid #222;">
        <div style="font-size:20px;font-weight:800;color:#4cff91;font-family:monospace;">${aiProj}</div>
        <div style="font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">AI PROJECTS</div>
      </td>` : `
      <td style="padding:10px;text-align:center;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid #222;">
        <div style="font-size:20px;font-weight:800;color:${accent};font-family:monospace;">${pct}%</div>
        <div style="font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">TODAY'S SCORE</div>
      </td>
      <td width="8"></td>
      <td style="padding:10px;text-align:center;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid #222;">
        <div style="font-size:20px;font-weight:800;color:#4cff91;font-family:monospace;">${done}/${total}</div>
        <div style="font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">TASKS DONE</div>
      </td>
      <td width="8"></td>
      <td style="padding:10px;text-align:center;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid #222;">
        <div style="font-size:20px;font-weight:800;color:#ff6b35;font-family:monospace;">${streak}🔥</div>
        <div style="font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">STREAK</div>
      </td>`}
    </tr>
  </table>
  ${!isMorning ? `<div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-family:monospace;font-size:13px;color:#888;">[<span style="color:${accent};">${scoreBar}</span>] <span style="color:${accent};">${scoreGrade}</span></div>` : ""}

  <!-- plan -->
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
    <div style="font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;margin-bottom:12px;">${isMorning ? "TODAY'S BATTLE PLAN" : "EVENING PLAN"}</div>
    <table cellpadding="0" cellspacing="0">${isMorning
      ? row("⏰","7:30 AM","Wake up + hydrate + AM skincare",accent)
        + row("🏋️","7:50 AM","GYM — cardio + PPL weights",accent)
        + row("💼","10:00 AM","Office — deliver fast, learn in gaps",accent)
        + row("💡","5:30 PM","STUDY BLOCK 1 (2 hrs) — 2 LeetCode + DSA",accent)
        + row("📖","8:30 PM","STUDY BLOCK 2 (2.5 hrs) — AI/ML project",accent)
        + row("🌿","11:00 PM","PM skincare + Minoxidil",accent)
        + row("😴","1:00 AM","SLEEP",accent)
      : row("💡","5:30 PM","STUDY BLOCK 1 — 2 LeetCode, phone away",accent)
        + row("🍽️","7:30 PM","Dinner — protein-rich, no sugar",accent)
        + row("📖","8:30 PM","STUDY BLOCK 2 — AI project + GitHub push",accent)
        + row("🌿","11:00 PM","PM skincare + Minoxidil on temples",accent)
        + row("😴","1:00 AM","SCREENS OFF. SLEEP.",accent)
    }</table>
  </div>

  <!-- motivation card — unique colour every time -->
  <div style="background:${bg};border:1px solid ${border};border-radius:14px;padding:22px;margin-bottom:20px;">
    <div style="font-size:32px;margin-bottom:10px;">${emoji}</div>
    <div style="font-size:10px;letter-spacing:3px;color:${accent};opacity:.7;text-transform:uppercase;margin-bottom:8px;">TODAY'S IGNITION</div>
    <div style="font-size:20px;font-weight:800;color:${accent};line-height:1.2;margin-bottom:12px;">${quote}</div>
    <div style="font-size:13px;color:#999;line-height:1.7;margin-bottom:16px;">${sub}</div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid ${border};border-radius:8px;padding:11px 13px;">
      <div style="font-size:9px;color:${accent};letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">TODAY'S MISSION</div>
      <div style="font-size:13px;color:#e0e0e0;font-weight:700;">${mission}</div>
    </div>
  </div>

  <!-- non-negotiables -->
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
    <div style="font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;margin-bottom:12px;">NON-NEGOTIABLES</div>
    <table cellpadding="0" cellspacing="0">${isMorning
      ? chip("🏋️","Gym 7:50 AM — no excuses",accent)
        + chip("📚","Solve 2 LeetCode problems",accent)
        + chip("💻","Push 1 commit to GitHub",accent)
        + chip("☀️","AM skincare: Cleanser → Niacinamide → SPF 50+",accent)
        + chip("🥗","150g+ protein · 3–4L water",accent)
      : chip("📚","2 LeetCode problems solved",accent)
        + chip("💻","GitHub commit pushed tonight",accent)
        + chip("🤖","AI project progress made",accent)
        + chip("🌿","PM skincare + Minoxidil done",accent)
        + chip("😴","In bed by 1:00 AM",accent)
    }</table>
  </div>

  <!-- footer -->
  <div style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">
    <div style="font-size:12px;color:#444;margin-bottom:4px;">You are 23. This is YOUR time.</div>
    <div style="font-size:10px;color:#2a2a2a;letter-spacing:2px;">RUTURAJ BLUEPRINT · 7 MONTH PLAN · 2026</div>
  </div>

</div>
</body></html>`;

  return { subject, html };
}

export default async function handler(req) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    const url     = new URL(req.url);
    const type    = url.searchParams.get("type") || "evening";
    const body    = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const lastIdx = parseInt(body?.lastMotivIdx ?? "-1");

    const { motiv, idx } = pickMotivation(lastIdx);
    const { subject, html } = buildHtmlEmail(type, body, motiv);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 587, secure: false,
      auth: { user: SENDER_EMAIL, pass: SENDER_PASS },
    });

    await transporter.sendMail({
      from: `"Ruturaj Blueprint" <${SENDER_EMAIL}>`,
      to: MY_EMAIL, subject, html,
    });

    console.log(`✅ ${type} email sent — theme: ${motiv.emoji} ${motiv.accent}`);
    return new Response(JSON.stringify({ success: true, motivIdx: idx }), { status: 200, headers });
  } catch (err) {
    console.error("Email error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
  }
}
