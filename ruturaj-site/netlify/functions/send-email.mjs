// Netlify Function — send-email
// Called by "Email Me" button: /.netlify/functions/send-email?type=morning|evening

import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

// 10 unique colour themes — rotates so every email looks different
const THEMES = [
  { emoji:"🔥", accent:"#e8ff47", bgCard:"#1a2200", bgPage:"#0a0f00", quote:"YOU ARE 23. THE TIME IS NOW.", sub:"Every hour you sleep past 7:30 AM is an hour someone else used to get ahead. Your 23-year-old body is a machine built for this grind.", mission:"Wake at 7:30 · Gym by 7:50 · 2 LeetCode today" },
  { emoji:"⚡", accent:"#47c8ff", bgCard:"#001828", bgPage:"#000d18", quote:"MAANG IS NOT LUCK. IT IS DAILY REPS.", sub:"The engineers at Google did not get lucky. They solved 300+ problems. They showed up every single day. You can too — starting today.", mission:"Solve 2 LeetCode + read 1 chapter DDIA" },
  { emoji:"💎", accent:"#c084fc", bgCard:"#1a0030", bgPage:"#0d0018", quote:"YOUR TELECOM BACKGROUND IS A MOAT.", sub:"You know 4G/5G internals, DevOps, and production systems. AI on top of this = a profile that 99% of freshers cannot replicate. Build that edge.", mission:"Push 1 GitHub commit + 1 AI project task" },
  { emoji:"🏆", accent:"#fbbf24", bgCard:"#1c1400", bgPage:"#0f0b00", quote:"SIX MONTHS FROM NOW, EVERYTHING CHANGES.", sub:"You will look back at this exact moment as the day you decided. Not someday. Not next week. Today. The plan is built. Now execute.", mission:"Complete all checklist tasks today — 100% score" },
  { emoji:"🚀", accent:"#fb923c", bgCard:"#1c0800", bgPage:"#0f0400", quote:"REVISE FIRST. THEN CONQUER.", sub:"Month 0 is not wasted time — it is compound interest on what you already know. PPA + Logic + Python = the foundation everything else is built on.", mission:"Revise 1 PPA chapter + 3 logic building problems" },
  { emoji:"💪", accent:"#4ade80", bgCard:"#001c0d", bgPage:"#000f06", quote:"GYM + BRAIN. BOTH. EVERY DAY.", sub:"You want to look sharp in the interview room AND think sharp. The gym is not optional — it keeps cortisol low and focus high for studying.", mission:"Hit gym by 7:50 AM — do not skip for any reason" },
  { emoji:"🌅", accent:"#ffa94d", bgCard:"#1c1000", bgPage:"#0f0800", quote:"THE MORNING BELONGS TO YOU.", sub:"7:30 AM is your competitive advantage. While the city sleeps, you are squatting, lifting, and building the body that walks into Google with confidence.", mission:"Gym 7:50 AM · Skincare done · Office by 10:00" },
  { emoji:"🎯", accent:"#f87171", bgCard:"#1c0008", bgPage:"#0f0004", quote:"FOCUS IS A SKILL. TRAIN IT DAILY.", sub:"Every time you resist the phone during study block, you are training focus. Every distracted session weakens it. Make each block count.", mission:"Phone in other room during both study blocks" },
  { emoji:"🧠", accent:"#86efac", bgCard:"#001c0a", bgPage:"#000f05", quote:"CONSISTENCY BEATS INTENSITY. EVERY TIME.", sub:"One bad day does not define your journey. One skipped workout, one missed study block — it is fine. Just never miss two in a row. That is the rule.", mission:"Study Block 1 (5:30 PM): full 2 hours, no phone" },
  { emoji:"📈", accent:"#22d3ee", bgCard:"#001820", bgPage:"#000d14", quote:"1 CRORE+ IS THE OUTPUT OF DAILY INPUT.", sub:"MAANG + AI Engineer salaries are real. They go to people who consistently put in the work. You have 7 months and the right plan. Honour it.", mission:"Log 2 study blocks + push to GitHub" },
];

function getDayNumber() {
  const start = new Date("2026-04-22T00:00:00+05:30");
  return Math.max(1, Math.round((new Date() - start) / 86400000) + 1);
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

// Build one plan row — plain string concat, no nested template literals
function planRow(ico, time, task, color) {
  return '<tr>'
    + '<td style="padding:5px 10px 5px 0;font-size:18px;vertical-align:middle;">' + ico + '</td>'
    + '<td style="padding:5px 10px 5px 0;color:' + color + ';font-family:monospace;font-size:12px;white-space:nowrap;vertical-align:middle;">' + time + '</td>'
    + '<td style="padding:5px 0;color:#cccccc;font-size:13px;line-height:1.4;vertical-align:middle;">' + task + '</td>'
    + '</tr>';
}

function statCell(value, label, color) {
  return '<td style="padding:12px 8px;text-align:center;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">'
    + '<div style="font-size:22px;font-weight:800;color:' + color + ';font-family:monospace;">' + value + '</div>'
    + '<div style="font-size:9px;color:#666666;letter-spacing:2px;text-transform:uppercase;margin-top:3px;">' + label + '</div>'
    + '</td>';
}

function buildEmail(type, body, theme) {
  const dayNum    = getDayNumber();
  const dateStr   = getDateStr();
  const isMorning = type === "morning";
  const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });

  const streak  = body.streak  || 0;
  const done    = body.done    || 0;
  const total   = body.total   || 20;
  const pct     = body.pct     || 0;
  const lcTotal = body.lcTotal || 0;
  const aiProj  = body.aiProj  || 0;

  const filled    = Math.min(10, Math.round(pct / 10));
  const scoreBar  = "█".repeat(filled) + "░".repeat(10 - filled);
  const scoreWord = pct >= 90 ? "PERFECT DAY 🏆" : pct >= 70 ? "GREAT DAY ✅" : pct >= 50 ? "DECENT DAY ⚡" : "NEEDS PUSH ⚠️";

  const { accent, bgCard, bgPage, emoji, quote, sub, mission } = theme;

  // --- unique subject with day number so each email is a separate thread ---
  const subject = isMorning
    ? "🌅 Day " + dayNum + " Morning — " + shortDate + " — Rise & Conquer, Ruturaj!"
    : "📊 Day " + dayNum + " Evening — " + shortDate + " — " + pct + "% — " + scoreWord;

  // --- plain text fallback ---
  const text = [
    (isMorning ? "GOOD MORNING RUTURAJ 🌅" : "EVENING CHECK-IN ⚡"),
    "Day " + dayNum + " of 210 · " + dateStr,
    "",
    isMorning
      ? "STREAK: " + streak + " days | LC SOLVED: " + lcTotal + " | AI PROJECTS: " + aiProj
      : "SCORE: " + pct + "% [" + scoreBar + "] " + scoreWord + "\nTASKS: " + done + "/" + total + " | STREAK: " + streak + " days",
    "",
    "TODAY'S IGNITION",
    emoji + " " + quote,
    sub,
    "",
    "MISSION: " + mission,
    "",
    isMorning ? "BATTLE PLAN\n7:30 AM  Wake + hydrate + AM skincare\n7:50 AM  GYM\n10:00 AM Office\n5:30 PM  Study Block 1 (2 hrs)\n8:30 PM  Study Block 2 (2.5 hrs)\n11:00 PM PM skincare + Minoxidil\n1:00 AM  SLEEP"
              : "EVENING PLAN\n5:30 PM  Study Block 1 — 2 LeetCode\n7:30 PM  Dinner (protein-rich)\n8:30 PM  Study Block 2 — AI + GitHub\n11:00 PM PM skincare + Minoxidil\n1:00 AM  SCREENS OFF. SLEEP.",
    "",
    "You are 23. This is YOUR time. ₹1 CR+ CTC = daily input.",
    "Ruturaj Blueprint · 7 Month Plan · 2026",
  ].join("\n");

  // --- HTML email built with string concat (no nested template literals) ---
  const statsRow = isMorning
    ? statCell(streak + " 🔥", "STREAK", accent)
      + '<td width="8"></td>'
      + statCell(lcTotal, "LC SOLVED", "#47c8ff")
      + '<td width="8"></td>'
      + statCell(aiProj, "AI PROJECTS", "#4ade80")
    : statCell(pct + "%", "TODAY SCORE", accent)
      + '<td width="8"></td>'
      + statCell(done + "/" + total, "TASKS DONE", "#4ade80")
      + '<td width="8"></td>'
      + statCell(streak + " 🔥", "STREAK", "#fb923c");

  const planRows = isMorning
    ? planRow("⏰","7:30 AM","Wake up + hydrate + AM skincare",accent)
      + planRow("🏋️","7:50 AM","GYM — cardio + PPL weights",accent)
      + planRow("💼","10:00 AM","Office — deliver fast, learn in gaps",accent)
      + planRow("💡","5:30 PM","STUDY BLOCK 1 (2 hrs) — 2 LeetCode + DSA",accent)
      + planRow("📖","8:30 PM","STUDY BLOCK 2 (2.5 hrs) — AI/ML project",accent)
      + planRow("🌿","11:00 PM","PM skincare + Minoxidil",accent)
      + planRow("😴","1:00 AM","SLEEP",accent)
    : planRow("💡","5:30 PM","STUDY BLOCK 1 — 2 LeetCode, phone away",accent)
      + planRow("🍽️","7:30 PM","Dinner — protein-rich, no sugar",accent)
      + planRow("📖","8:30 PM","STUDY BLOCK 2 — AI project + GitHub push",accent)
      + planRow("🌿","11:00 PM","PM skincare + Minoxidil on temples",accent)
      + planRow("😴","1:00 AM","SCREENS OFF. SLEEP.",accent);

  const nonNeg = isMorning
    ? [["🏋️","Gym 7:50 AM — no excuses"],["📚","Solve 2 LeetCode problems"],["💻","Push 1 commit to GitHub"],["☀️","AM skincare: Cleanser → Niacinamide → SPF 50+"],["🥗","150g+ protein · 3–4L water"]]
    : [["📚","2 LeetCode problems solved"],["💻","GitHub commit pushed tonight"],["🤖","AI project progress made"],["🌿","PM skincare + Minoxidil done"],["😴","In bed by 1:00 AM"]];

  const nonNegRows = nonNeg.map(function(item) {
    return '<tr>'
      + '<td style="padding:5px 12px 5px 0;font-size:18px;vertical-align:middle;">' + item[0] + '</td>'
      + '<td style="padding:5px 0;color:#cccccc;font-size:13px;vertical-align:middle;">' + item[1] + '</td>'
      + '</tr>';
  }).join("");

  const scoreLine = !isMorning
    ? '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-family:monospace;font-size:13px;color:#888888;">'
      + '[<span style="color:' + accent + ';">' + scoreBar + '</span>]&nbsp;&nbsp;'
      + '<span style="color:' + accent + ';font-weight:700;">' + scoreWord + '</span>'
      + '</div>'
    : "";

  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Ruturaj Blueprint</title></head>'
    + '<body style="margin:0;padding:0;background-color:#080808;">'
    + '<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;background-color:#080808;">'

    // gradient top bar
    + '<div style="height:4px;background:linear-gradient(to right,' + accent + ',' + accent + '44,transparent);border-radius:4px;margin-bottom:28px;"></div>'

    // header
    + '<div style="margin-bottom:24px;">'
    + '<p style="margin:0 0 6px 0;font-size:10px;letter-spacing:4px;color:' + accent + ';text-transform:uppercase;opacity:0.8;">'
    + (isMorning ? "GOOD MORNING" : "EVENING CHECK-IN") + ' &nbsp;·&nbsp; DAY ' + dayNum + ' OF 210</p>'
    + '<h1 style="margin:0 0 4px 0;font-size:26px;font-weight:800;color:#f0f0f0;letter-spacing:-0.5px;">'
    + (isMorning ? "🌅 Rise &amp; Conquer" : "⚡ Evening Report") + '</h1>'
    + '<p style="margin:0;font-size:12px;color:#555555;">' + dateStr + '</p>'
    + '</div>'

    // stats
    + '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-collapse:separate;border-spacing:0;">'
    + '<tr>' + statsRow + '</tr></table>'
    + scoreLine

    // plan
    + '<div style="background-color:#111111;border:1px solid #222222;border-radius:10px;padding:16px 18px;margin-bottom:20px;">'
    + '<p style="margin:0 0 12px 0;font-size:10px;letter-spacing:3px;color:#444444;text-transform:uppercase;">'
    + (isMorning ? "TODAY\'S BATTLE PLAN" : "EVENING PLAN") + '</p>'
    + '<table cellpadding="0" cellspacing="0" width="100%">' + planRows + '</table>'
    + '</div>'

    // motivation card
    + '<div style="background-color:' + bgCard + ';border:1px solid ' + accent + '33;border-radius:14px;padding:22px;margin-bottom:20px;">'
    + '<p style="margin:0 0 10px 0;font-size:32px;">' + emoji + '</p>'
    + '<p style="margin:0 0 8px 0;font-size:10px;letter-spacing:3px;color:' + accent + ';opacity:0.8;text-transform:uppercase;">TODAY\'S IGNITION</p>'
    + '<h2 style="margin:0 0 12px 0;font-size:20px;font-weight:800;color:' + accent + ';line-height:1.25;">' + quote + '</h2>'
    + '<p style="margin:0 0 16px 0;font-size:13px;color:#aaaaaa;line-height:1.7;">' + sub + '</p>'
    + '<div style="background-color:#ffffff0a;border:1px solid ' + accent + '33;border-radius:8px;padding:12px 14px;">'
    + '<p style="margin:0 0 4px 0;font-size:9px;color:' + accent + ';letter-spacing:2px;text-transform:uppercase;">TODAY\'S MISSION</p>'
    + '<p style="margin:0;font-size:13px;color:#e0e0e0;font-weight:700;">' + mission + '</p>'
    + '</div></div>'

    // non-negotiables
    + '<div style="background-color:#111111;border:1px solid #222222;border-radius:10px;padding:16px 18px;margin-bottom:20px;">'
    + '<p style="margin:0 0 12px 0;font-size:10px;letter-spacing:3px;color:#444444;text-transform:uppercase;">NON-NEGOTIABLES</p>'
    + '<table cellpadding="0" cellspacing="0" width="100%">' + nonNegRows + '</table>'
    + '</div>'

    // footer
    + '<div style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">'
    + '<p style="margin:0 0 4px 0;font-size:12px;color:#444444;">You are 23. This is YOUR time.</p>'
    + '<p style="margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;">RUTURAJ BLUEPRINT &nbsp;·&nbsp; 7 MONTH PLAN &nbsp;·&nbsp; 2026</p>'
    + '</div>'

    + '</div></body></html>';

  return { subject, text, html };
}

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
    const { subject, text, html } = buildEmail(type, body, theme);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: SENDER_EMAIL, pass: SENDER_PASS },
    });

    await transporter.sendMail({
      from: '"Ruturaj Blueprint" <' + SENDER_EMAIL + '>',
      to: MY_EMAIL,
      subject,
      text,   // plain text fallback
      html,   // rich HTML
    });

    console.log("Email sent — Day " + getDayNumber() + " | type:" + type + " | theme:" + theme.emoji);
    return new Response(JSON.stringify({ success: true, motivIdx: idx }), { status: 200, headers: cors });
  } catch (err) {
    console.error("Email error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: cors });
  }
}
