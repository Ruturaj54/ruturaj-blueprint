// Netlify Scheduled Function — Morning Email
// Fires at 7:30 AM IST = 02:00 AM UTC every day
// Schedule is set via the Netlify dashboard (see README)

import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";   // Gmail App Password
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
    timeZone: "Asia/Kolkata"
  });
}

function getDayNumber() {
  const start = new Date("2026-04-22T00:00:00+05:30");
  const now   = new Date();
  return Math.max(1, Math.round((now - start) / 86400000) + 1);
}

function buildMorningEmail() {
  const quote   = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const dateStr = getDateStr();
  const dayNum  = getDayNumber();

  const subject = `🌅 Good Morning Ruturaj — Day ${dayNum} · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}`;

  const text = `
╔══════════════════════════════════════╗
  GOOD MORNING RUTURAJ 🌅
  ${dateStr}
  Journey: Day ${dayNum} of 210
╚══════════════════════════════════════╝

─────────────────────────────────────
TODAY'S BATTLE PLAN
─────────────────────────────────────
⏰  7:30 AM  → Wake up + hydrate + AM skincare
🏋️  7:50 AM  → GYM (cardio + PPL weights)
💼  10:00 AM → Office — deliver fast, learn in gaps
💡  5:30 PM  → STUDY BLOCK 1 (2 hrs) — 2 LeetCode + DSA
📖  8:30 PM  → STUDY BLOCK 2 (2.5 hrs) — AI/ML project
🌿  11:00 PM → PM skincare + Minoxidil
😴  1:00 AM  → SLEEP (6.5 hrs)

─────────────────────────────────────
TODAY'S NON-NEGOTIABLES
─────────────────────────────────────
  ✦ Gym 7:50 AM — no excuses
  ✦ Solve 2 LeetCode problems
  ✦ Push 1 commit to GitHub
  ✦ AM skincare: Cleanser → Niacinamide → SPF 50+
  ✦ Hit 150g+ protein
  ✦ Drink 3–4L water

─────────────────────────────────────
TODAY'S IGNITION 🔥
─────────────────────────────────────
"${quote}"

─────────────────────────────────────
You are 23 years old. SDE-2 in 1 year.
You already move faster than the pack.
Every single hour today is compound interest on ₹1 CR+ CTC.
DO NOT WASTE TODAY.
─────────────────────────────────────
Ruturaj Blueprint · 7 Month Plan · 2026
  `;

  const html = text
    .replace(/\n/g, "<br>")
    .replace(/╔|╗|╚|╝|═/g, match => `<span style="color:#e8ff47">${match}</span>`)
    .replace(/"([^"]+)"/g, `<em style="color:#e8ff47">"$1"</em>`);

  return { subject, text, html: `<div style="font-family:monospace;background:#0f0f0f;color:#e2e8f0;padding:24px;border-radius:8px;max-width:600px;">${html}</div>` };
}

export default async function handler(req) {
  // Netlify scheduled functions receive a POST with event type
  try {
    const { subject, text, html } = buildMorningEmail();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Ruturaj Blueprint 🔥" <${SENDER_EMAIL}>`,
      to: MY_EMAIL,
      subject,
      text,
      html,
    });

    console.log("✅ Morning email sent to", MY_EMAIL);
    return new Response(JSON.stringify({ success: true, message: "Morning email sent!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Morning email failed:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  schedule: "0 2 * * *",   // 7:30 AM IST = 02:00 UTC
};
