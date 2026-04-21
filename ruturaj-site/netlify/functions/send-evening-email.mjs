// Netlify Scheduled Function — Evening Report Email
// Fires at 5:00 PM IST = 11:30 AM UTC every day

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
    timeZone: "Asia/Kolkata",
  });
}

function getDayNumber() {
  const start = new Date("2026-04-22T00:00:00+05:30");
  const now   = new Date();
  return Math.max(1, Math.round((now - start) / 86400000) + 1);
}

function buildEveningEmail() {
  const quote   = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const dateStr = getDateStr();
  const dayNum  = getDayNumber();
  const shortDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

  const subject = `⚡ Evening Check-In — Day ${dayNum} · ${shortDate} — Time to Study!`;

  const text = `
╔══════════════════════════════════════╗
  EVENING CHECK-IN ⚡
  ${dateStr}
  Journey: Day ${dayNum} of 210
╚══════════════════════════════════════╝

It's 5:00 PM. Office hours are over.
NOW the real work begins.

─────────────────────────────────────
EVENING BATTLE PLAN
─────────────────────────────────────
  5:30 PM  → STUDY BLOCK 1 (2 hrs)
              ├─ Solve 2 LeetCode problems
              ├─ Focus: DSA topic of the week
              └─ Phone in another room
  
  7:30 PM  → Dinner (protein-rich, no sugar)
  
  8:30 PM  → STUDY BLOCK 2 (2.5 hrs)
              ├─ AI/ML project work
              ├─ Push 1 commit to GitHub
              └─ Read 1 chapter (DDIA or system design)
  
  11:00 PM → PM Skincare routine
              ├─ Double cleanse
              ├─ AHA/BHA or Retinol
              └─ Minoxidil on temples
  
  1:00 AM  → SCREENS OFF. SLEEP.

─────────────────────────────────────
TONIGHT'S NON-NEGOTIABLES
─────────────────────────────────────
  ✦ 2 LeetCode problems solved
  ✦ GitHub commit pushed
  ✦ AI project progress made
  ✦ PM skincare + Minoxidil done
  ✦ In bed by 1:00 AM

─────────────────────────────────────
TONIGHT'S FUEL 💎
─────────────────────────────────────
"${quote}"

─────────────────────────────────────
TOMORROW MORNING
─────────────────────────────────────
  Wake: 7:30 AM sharp
  Gym:  7:50 AM — no negotiation
  SPF before leaving home — non-negotiable

─────────────────────────────────────
You are 23. This is YOUR time.
₹1 crore CTC = the output of daily input.
Stay the course. The offer is coming.
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
  try {
    const { subject, text, html } = buildEveningEmail();

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
      from: `"Ruturaj Blueprint ⚡" <${SENDER_EMAIL}>`,
      to: MY_EMAIL,
      subject,
      text,
      html,
    });

    console.log("✅ Evening email sent to", MY_EMAIL);
    return new Response(JSON.stringify({ success: true, message: "Evening email sent!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Evening email failed:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  schedule: "30 11 * * *",  // 5:00 PM IST = 11:30 AM UTC
};
