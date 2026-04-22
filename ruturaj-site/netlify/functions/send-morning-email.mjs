// Scheduled function — fires at 7:30 AM IST (02:00 UTC) daily
import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

// Import shared logic by inlining — Netlify bundles each function independently
const THEMES = [
  { emoji:"🔥", accent:"#e8ff47", bgCard:"#1a2200", quote:"YOU ARE 23. THE TIME IS NOW.", sub:"Every hour you sleep past 7:30 AM is an hour someone else used to get ahead. Your 23-year-old body is a machine built for this grind.", mission:"Wake at 7:30 · Gym by 7:50 · 2 LeetCode today" },
  { emoji:"⚡", accent:"#47c8ff", bgCard:"#001828", quote:"MAANG IS NOT LUCK. IT IS DAILY REPS.", sub:"The engineers at Google did not get lucky. They solved 300+ problems. They showed up every single day. You can too — starting today.", mission:"Solve 2 LeetCode + read 1 chapter DDIA" },
  { emoji:"💎", accent:"#c084fc", bgCard:"#1a0030", quote:"YOUR TELECOM BACKGROUND IS A MOAT.", sub:"You know 4G/5G internals, DevOps, and production systems. AI on top of this = a profile that 99% of freshers cannot replicate. Build that edge.", mission:"Push 1 GitHub commit + 1 AI project task" },
  { emoji:"🏆", accent:"#fbbf24", bgCard:"#1c1400", quote:"SIX MONTHS FROM NOW, EVERYTHING CHANGES.", sub:"You will look back at this exact moment as the day you decided. Not someday. Not next week. Today. The plan is built. Now execute.", mission:"Complete all checklist tasks today — 100% score" },
  { emoji:"🚀", accent:"#fb923c", bgCard:"#1c0800", quote:"REVISE FIRST. THEN CONQUER.", sub:"Month 0 is not wasted time — it is compound interest on what you already know. PPA + Logic + Python = the foundation everything else is built on.", mission:"Revise 1 PPA chapter + 3 logic building problems" },
  { emoji:"💪", accent:"#4ade80", bgCard:"#001c0d", quote:"GYM + BRAIN. BOTH. EVERY DAY.", sub:"You want to look sharp in the interview room AND think sharp. The gym is not optional — it keeps cortisol low and focus high for studying.", mission:"Hit gym by 7:50 AM — do not skip for any reason" },
  { emoji:"🌅", accent:"#ffa94d", bgCard:"#1c1000", quote:"THE MORNING BELONGS TO YOU.", sub:"7:30 AM is your competitive advantage. While the city sleeps, you are squatting, lifting, and building the body that walks into Google with confidence.", mission:"Gym 7:50 AM · Skincare done · Office by 10:00" },
  { emoji:"🎯", accent:"#f87171", bgCard:"#1c0008", quote:"FOCUS IS A SKILL. TRAIN IT DAILY.", sub:"Every time you resist the phone during study block, you are training focus. Every distracted session weakens it. Make each block count.", mission:"Phone in other room during both study blocks" },
  { emoji:"🧠", accent:"#86efac", bgCard:"#001c0a", quote:"CONSISTENCY BEATS INTENSITY. EVERY TIME.", sub:"One bad day does not define your journey. One skipped workout, one missed study block — fine. Just never miss two in a row. That is the rule.", mission:"Study Block 1 (5:30 PM): full 2 hours, no phone" },
  { emoji:"📈", accent:"#22d3ee", bgCard:"#001820", quote:"1 CRORE+ IS THE OUTPUT OF DAILY INPUT.", sub:"MAANG + AI Engineer salaries are real. They go to people who consistently put in the work. You have 7 months and the right plan. Honour it.", mission:"Log 2 study blocks + push to GitHub" },
];

function getDayNumber() {
  const start = new Date("2026-04-22T00:00:00+05:30");
  return Math.max(1, Math.round((new Date() - start) / 86400000) + 1);
}
function getDateStr() {
  return new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Kolkata" });
}
function planRow(ico, time, task, color) {
  return '<tr><td style="padding:5px 10px 5px 0;font-size:18px;">' + ico + '</td>'
    + '<td style="padding:5px 10px 5px 0;color:' + color + ';font-family:monospace;font-size:12px;white-space:nowrap;">' + time + '</td>'
    + '<td style="padding:5px 0;color:#cccccc;font-size:13px;">' + task + '</td></tr>';
}

export default async function handler() {
  const dayNum  = getDayNumber();
  const dateStr = getDateStr();
  const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });
  const theme   = THEMES[dayNum % THEMES.length]; // deterministic per day so morning/evening match
  const { accent, bgCard, emoji, quote, sub, mission } = theme;

  const subject = "🌅 Day " + dayNum + " Morning — " + shortDate + " — Rise & Conquer, Ruturaj!";

  const text = "GOOD MORNING RUTURAJ 🌅\nDay " + dayNum + " of 210 · " + dateStr
    + "\n\n" + emoji + " " + quote + "\n" + sub
    + "\n\nMISSION: " + mission
    + "\n\nBATTLE PLAN\n7:30 AM  Wake + hydrate + AM skincare\n7:50 AM  GYM\n10:00 AM Office\n5:30 PM  Study Block 1 (2 hrs)\n8:30 PM  Study Block 2 (2.5 hrs)\n11:00 PM PM skincare + Minoxidil\n1:00 AM  SLEEP"
    + "\n\nYou are 23. DO NOT WASTE TODAY.\nRuturaj Blueprint · 7 Month Plan · 2026";

  const planRows = planRow("⏰","7:30 AM","Wake up + hydrate + AM skincare",accent)
    + planRow("🏋️","7:50 AM","GYM — cardio + PPL weights",accent)
    + planRow("💼","10:00 AM","Office — deliver fast, learn in gaps",accent)
    + planRow("💡","5:30 PM","STUDY BLOCK 1 (2 hrs) — 2 LeetCode + DSA",accent)
    + planRow("📖","8:30 PM","STUDY BLOCK 2 (2.5 hrs) — AI/ML project",accent)
    + planRow("🌿","11:00 PM","PM skincare + Minoxidil",accent)
    + planRow("😴","1:00 AM","SLEEP",accent);

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#080808;">'
    + '<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#080808;">'
    + '<div style="height:4px;background:linear-gradient(to right,' + accent + ',' + accent + '44,transparent);border-radius:4px;margin-bottom:28px;"></div>'
    + '<p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;color:' + accent + ';text-transform:uppercase;">GOOD MORNING · DAY ' + dayNum + ' OF 210</p>'
    + '<h1 style="margin:0 0 4px;font-size:26px;font-weight:800;color:#f0f0f0;">🌅 Rise &amp; Conquer</h1>'
    + '<p style="margin:0 0 24px;font-size:12px;color:#555;">' + dateStr + '</p>'
    + '<div style="background:' + bgCard + ';border:1px solid ' + accent + '44;border-radius:14px;padding:22px;margin-bottom:20px;">'
    + '<p style="margin:0 0 8px;font-size:32px;">' + emoji + '</p>'
    + '<p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;color:' + accent + ';text-transform:uppercase;">TODAY\'S IGNITION</p>'
    + '<h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:' + accent + ';line-height:1.25;">' + quote + '</h2>'
    + '<p style="margin:0 0 16px;font-size:13px;color:#aaaaaa;line-height:1.7;">' + sub + '</p>'
    + '<div style="background:#ffffff0a;border:1px solid ' + accent + '33;border-radius:8px;padding:12px;">'
    + '<p style="margin:0 0 4px;font-size:9px;color:' + accent + ';letter-spacing:2px;text-transform:uppercase;">TODAY\'S MISSION</p>'
    + '<p style="margin:0;font-size:13px;color:#e0e0e0;font-weight:700;">' + mission + '</p>'
    + '</div></div>'
    + '<div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;">'
    + '<p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;">TODAY\'S BATTLE PLAN</p>'
    + '<table cellpadding="0" cellspacing="0" width="100%">' + planRows + '</table>'
    + '</div>'
    + '<div style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">'
    + '<p style="margin:0 0 4px;font-size:12px;color:#444;">You are 23. Every hour = compound interest on ₹1 CR+ CTC.</p>'
    + '<p style="margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;">RUTURAJ BLUEPRINT · 7 MONTH PLAN · 2026</p>'
    + '</div></div></body></html>';

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 587, secure: false,
    auth: { user: SENDER_EMAIL, pass: SENDER_PASS },
  });
  await transporter.sendMail({ from: '"Ruturaj Blueprint" <' + SENDER_EMAIL + '>', to: MY_EMAIL, subject, text, html });
  console.log("Morning email sent — Day " + dayNum);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export const config = { schedule: "0 2 * * *" };
