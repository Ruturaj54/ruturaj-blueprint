// Netlify Function — triggered by "Email Me" button click
// URL: /.netlify/functions/send-email?type=morning  OR  ?type=evening

import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

const QUOTES = [
  "Every rep in the gym, every problem solved — it compounds. Keep going.",
  "You are building the version of yourself that walks into MAANG with confidence.",
  "Consistency is the bridge between your current salary and ₹1 crore CTC.",
  "The algorithm doesn't care about your past. Just your next move.",
  "Your telecom expertise + AI skills = a profile MNCs are desperate for.",
  "SDE-2 at 23, 1-year timeline. You already move faster than the pack. Don't stop.",
  "One bad day doesn't define the journey. Never miss two in a row. That is the rule.",
  "Focus is a skill. Train it daily. Phone in other room during study blocks.",
  "6 months from now everything changes. The plan is built. Execute.",
  "MAANG is not luck. It is daily reps. Show up every single day.",
];

function getDateStr() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function getDayNumber() {
  const start = new Date("2026-04-22T00:00:00+05:30");
  return Math.max(1, Math.round((new Date() - start) / 86400000) + 1);
}

function buildContent(type, body) {
  const quote   = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const dateStr = getDateStr();
  const dayNum  = getDayNumber();
  const shortDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

  // Pull stats from request body (sent from browser)
  const streak  = body?.streak  || 0;
  const done    = body?.done    || 0;
  const total   = body?.total   || 20;
  const pct     = body?.pct     || 0;
  const lcTotal = body?.lcTotal || 0;
  const aiProj  = body?.aiProj  || 0;

  if (type === "morning") {
    return {
      subject: `🌅 Good Morning Ruturaj — Day ${dayNum} · ${shortDate}`,
      text: `
╔══════════════════════════════════════╗
  GOOD MORNING RUTURAJ 🌅
  ${dateStr}
  Journey: Day ${dayNum} of 210
╚══════════════════════════════════════╝

🔥 STREAK     : ${streak} days
📊 LC SOLVED  : ${lcTotal} total
🤖 AI PROJECTS: ${aiProj} built

─────────────────────────────────────
TODAY'S BATTLE PLAN
─────────────────────────────────────
⏰  7:30 AM  → Wake up + hydrate + AM skincare
🏋️  7:50 AM  → GYM (cardio + PPL weights)
💼  10:00 AM → Office — deliver fast, learn in gaps
💡  5:30 PM  → STUDY BLOCK 1 (2 hrs) — 2 LeetCode + DSA
📖  8:30 PM  → STUDY BLOCK 2 (2.5 hrs) — AI/ML project
🌿  11:00 PM → PM skincare + Minoxidil
😴  1:00 AM  → SLEEP

─────────────────────────────────────
TODAY'S NON-NEGOTIABLES
─────────────────────────────────────
  ✦ Gym 7:50 AM — no excuses
  ✦ Solve 2 LeetCode problems
  ✦ Push 1 commit to GitHub
  ✦ AM skincare: Cleanser → Niacinamide → SPF 50+
  ✦ Hit 150g+ protein + 3-4L water

─────────────────────────────────────
TODAY'S IGNITION 🔥
─────────────────────────────────────
"${quote}"

─────────────────────────────────────
You are 23. Every hour = compound interest on ₹1 CR+ CTC.
DO NOT WASTE TODAY.
─────────────────────────────────────
Ruturaj Blueprint · 7 Month Plan · 2026
`
    };
  } else {
    const scoreBar  = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
    const scoreGrade = pct >= 90 ? "🏆 PERFECT DAY" : pct >= 70 ? "✅ GREAT DAY" : pct >= 50 ? "⚡ DECENT DAY" : "⚠️ NEEDS PUSH";
    return {
      subject: `📊 Evening Report — Day ${dayNum} · ${shortDate} — ${pct}% — ${scoreGrade}`,
      text: `
╔══════════════════════════════════════╗
  EVENING CHECK-IN ⚡
  ${dateStr}
  Journey: Day ${dayNum} of 210
╚══════════════════════════════════════╝

📊 TODAY'S SCORE
  Tasks: ${done} / ${total}
  Score: [${scoreBar}] ${pct}%
  Grade: ${scoreGrade}
  Streak: ${streak} days 🔥

─────────────────────────────────────
EVENING BATTLE PLAN
─────────────────────────────────────
  5:30 PM → STUDY BLOCK 1 (2 hrs) — 2 LeetCode
  8:30 PM → STUDY BLOCK 2 (2.5 hrs) — AI project + GitHub push
  11:00 PM → PM skincare + Minoxidil
  1:00 AM → SCREENS OFF. SLEEP.

─────────────────────────────────────
TONIGHT'S FUEL 💎
─────────────────────────────────────
"${quote}"

─────────────────────────────────────
TOMORROW: Wake 7:30 AM · Gym 7:50 AM · SPF before leaving.
─────────────────────────────────────
You are 23. This is YOUR time.
₹1 crore CTC = the output of daily input.
─────────────────────────────────────
Ruturaj Blueprint · 7 Month Plan · 2026
`
    };
  }
}

export default async function handler(req) {
  // Allow CORS so the browser can call this function
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const url  = new URL(req.url);
    const type = url.searchParams.get("type") || "evening";
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    const { subject, text } = buildContent(type, body);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: SENDER_EMAIL, pass: SENDER_PASS },
    });

    await transporter.sendMail({
      from: `"Ruturaj Blueprint" <${SENDER_EMAIL}>`,
      to: MY_EMAIL,
      subject,
      text,
      html: `<div style="font-family:monospace;background:#0f0f0f;color:#e2e8f0;padding:24px;border-radius:8px;max-width:600px;white-space:pre-wrap;">${text.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error("Email error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
  }
}
