// Scheduled — 5:00 PM IST = 11:30 UTC daily
// BASE 30-DAY PROGRESS MAIL — fires only during the first 30 days of the plan
// Purpose: snapshot of the Month-1 BASE rebuild (foundation) + push for Office Extended block (5–7 PM)
import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

const BASE_TOTAL_DAYS = 30;

// Day-by-day BASE plan focus — 30 unique micro-themes for Month 1 foundation rebuild
const BASE_DAYS = [
  { phase:"WEEK 1 · IGNITION",      focus:"Wake at 7:30 · Gym at 7:50 · Office at 10",     drill:"Track wake time + gym time. No misses." },
  { phase:"WEEK 1 · IGNITION",      focus:"Gym + 1 LeetCode Easy + AM skincare",            drill:"Lock the morning: 7:30 → 9:30 routine." },
  { phase:"WEEK 1 · IGNITION",      focus:"Establish 8 PM Block 1 — phone in another room", drill:"Sit for 2.5 hrs no matter what." },
  { phase:"WEEK 1 · IGNITION",      focus:"Establish 10:30 PM Block 2 — open AI repo",      drill:"Even 30 min of AI reading counts." },
  { phase:"WEEK 1 · IGNITION",      focus:"Office Extended 5–7 PM lecture window",          drill:"Watch 1 PPA lecture or solve 3 logic problems." },
  { phase:"WEEK 1 · IGNITION",      focus:"Skincare AM + PM both sides locked",             drill:"Cleanser → Niacinamide → SPF (AM) · Retinol (PM)." },
  { phase:"WEEK 1 · IGNITION",      focus:"Sunday review — write what worked + what failed",drill:"30-min journaling. Reset for Week 2." },

  { phase:"WEEK 2 · BASE BUILD",    focus:"Add Medium LeetCode — 1 Easy + 1 Medium daily",  drill:"Medium under 25 min target." },
  { phase:"WEEK 2 · BASE BUILD",    focus:"Push 1 GitHub commit daily — chain unbroken",    drill:"Even README edits count. Don't break the green." },
  { phase:"WEEK 2 · BASE BUILD",    focus:"Hit 150g protein for 7 straight days",           drill:"Whey + 4 eggs + paneer + chicken — non-negotiable." },
  { phase:"WEEK 2 · BASE BUILD",    focus:"Minoxidil 2x/day — temple coverage perfect",     drill:"Set 2 phone alarms: 9 AM + 11 PM." },
  { phase:"WEEK 2 · BASE BUILD",    focus:"Set up GCP free tier + 1 k8s cluster",           drill:"Document setup in a public Gist for proof." },
  { phase:"WEEK 2 · BASE BUILD",    focus:"Block 2 AI: install fast.ai + Anthropic SDK",    drill:"Run hello-world Claude API call from local Python." },
  { phase:"WEEK 2 · BASE BUILD",    focus:"Sunday review #2 — measure streak length",       drill:"If any habit < 5/7, double-down next week." },

  { phase:"WEEK 3 · MOMENTUM",      focus:"30 LeetCode total milestone",                    drill:"Re-solve weak Easy problems. Rebuild patterns." },
  { phase:"WEEK 3 · MOMENTUM",      focus:"First public LinkedIn post — telecom + AI take", drill:"200 words. Share what you're building." },
  { phase:"WEEK 3 · MOMENTUM",      focus:"Block 1 — start Trees / BFS / DFS",              drill:"5 problems on tree traversal pattern." },
  { phase:"WEEK 3 · MOMENTUM",      focus:"Block 2 AI — RAG hello-world over 4G PDFs",      drill:"Ingest 1 PDF → embed → query. Public GitHub." },
  { phase:"WEEK 3 · MOMENTUM",      focus:"Cardio hits 5x/week — 20 min each",              drill:"VO2 max climbing means brain stamina too." },
  { phase:"WEEK 3 · MOMENTUM",      focus:"Track sleep window — bed by 1:30 AM, no later",  drill:"6 hrs solid > 8 hrs interrupted." },
  { phase:"WEEK 3 · MOMENTUM",      focus:"Sunday review #3 — calculate weekly LC count",   drill:"Aim: 14+ problems / week from now on." },

  { phase:"WEEK 4 · LOCK-IN",       focus:"50 LeetCode total milestone",                    drill:"Heavy week: 3 problems/day target." },
  { phase:"WEEK 4 · LOCK-IN",       focus:"AI Project #1 scoping doc on GitHub",            drill:"README.md + architecture diagram + open issues." },
  { phase:"WEEK 4 · LOCK-IN",       focus:"Mock interview attempt #1 (Pramp/friend)",       drill:"Record yourself. Watch back. Note 3 fixes." },
  { phase:"WEEK 4 · LOCK-IN",       focus:"Networking post #2 on LinkedIn",                 drill:"Tag 3 telecom-AI engineers you respect." },
  { phase:"WEEK 4 · LOCK-IN",       focus:"Read 1 chapter DDIA — note 5 takeaways",         drill:"Foundation for Month-3 system design grind." },
  { phase:"WEEK 4 · LOCK-IN",       focus:"Skin shows visible glow check — photo log",      drill:"30-day before/after — proof for yourself." },
  { phase:"WEEK 4 · LOCK-IN",       focus:"Body measurements + weight log",                 drill:"Strength up? Waist down? Track it." },

  { phase:"WEEK 5 · GRADUATION",    focus:"Month-1 BASE retrospective",                     drill:"Write 1-page review: streak %, weak habits, fixes." },
  { phase:"WEEK 5 · GRADUATION",    focus:"BASE GRADUATION → Month 2 plan locked",          drill:"Tomorrow you transition to Advanced DSA + DL phase." },
];

function getDayNumber() {
  return Math.max(1, Math.floor((new Date() - new Date("2026-05-04T00:00:00+05:30")) / 86400000) + 1);
}
function getDateStr() {
  return new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Kolkata" });
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

function generateBaseCardSvg(dayInBase, plan) {
  const W = 600;
  const accent = "#22d3ee";
  const g1 = "#001824";
  const g2 = "#000c12";
  const focusLines = wrapText(plan.focus, 30);
  const drillLines = wrapText(plan.drill, 60);

  let focusY = 168;
  const focusSvg = focusLines.map(l => {
    const y = focusY; focusY += 32;
    return `<text x="24" y="${y}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="22" fill="${accent}">${escXml(l)}</text>`;
  }).join("\n  ");

  const phaseY = focusY + 12;
  const drillTitleY = phaseY + 24;
  const drillBoxY = drillTitleY + 6;
  const drillTextY = drillBoxY + 22;
  const drillHeight = drillLines.length * 17 + 22;
  const drillSvg = drillLines.map((l, i) =>
    `<text x="38" y="${drillTextY + i * 17}" font-family="Georgia,serif" font-style="italic" font-size="13" fill="#e8e8e8">${escXml(l)}</text>`
  ).join("\n  ");

  const svgH = drillBoxY + drillHeight + 30;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${g1}"/><stop offset="100%" stop-color="${g2}"/></linearGradient>
  <linearGradient id="bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${accent}"/><stop offset="60%" stop-color="${accent}88"/><stop offset="100%" stop-color="transparent"/></linearGradient>
</defs>
<rect width="${W}" height="${svgH}" rx="18" ry="18" fill="url(#bg)"/>
<rect y="0" width="${W}" height="4" fill="url(#bd)"/>
<rect x="24" y="24" width="120" height="26" rx="6" fill="${accent}22" stroke="${accent}55" stroke-width="1"/>
<text x="32" y="41" font-family="Courier New,monospace" font-weight="700" font-size="11" fill="${accent}">BASE ${dayInBase} / ${BASE_TOTAL_DAYS}</text>
<text x="24" y="112" font-size="42">🏗️</text>
<text x="24" y="138" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${accent}" opacity="0.75">MONTH 1 BASE · TODAY'S BUILD</text>
${focusSvg}
<text x="24" y="${phaseY}" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="#888888">${escXml(plan.phase)}</text>
<text x="24" y="${drillTitleY}" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${accent}" opacity="0.75">⚡ TONIGHT'S DRILL</text>
<rect x="24" y="${drillBoxY}" width="${W-48}" height="${drillHeight}" rx="8" fill="#000000" fill-opacity="0.35" stroke="${accent}33" stroke-width="1"/>
${drillSvg}
</svg>`;
}

function buildBigProgressBar(dayInBase, accent) {
  const pct = Math.round(dayInBase / BASE_TOTAL_DAYS * 100);
  const filled = Math.min(30, Math.round(pct / 100 * 30));
  const bar = '█'.repeat(filled) + '░'.repeat(30 - filled);
  const daysLeft = Math.max(0, BASE_TOTAL_DAYS - dayInBase);
  return "<div style='background:#0d1418;border:1px solid #1a2a32;border-radius:12px;padding:18px 20px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 14px;font-size:10px;letter-spacing:3px;color:" + accent + ";text-transform:uppercase;font-weight:700;'>📊 BASE PROGRESS · 30-DAY FOUNDATION</p>"
    + "<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:14px;'>"
    + "<tr>"
    + "<td style='padding:10px;text-align:center;background:#0a0f12;border-radius:8px;border:1px solid #1a2a32;'>"
    + "<div style='font-size:26px;font-weight:800;color:" + accent + ";font-family:monospace;'>" + dayInBase + "</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:4px;'>DAY OF 30</div>"
    + "</td><td width='8'></td>"
    + "<td style='padding:10px;text-align:center;background:#0a0f12;border-radius:8px;border:1px solid #1a2a32;'>"
    + "<div style='font-size:26px;font-weight:800;color:#4ade80;font-family:monospace;'>" + pct + "%</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:4px;'>BASE DONE</div>"
    + "</td><td width='8'></td>"
    + "<td style='padding:10px;text-align:center;background:#0a0f12;border-radius:8px;border:1px solid #1a2a32;'>"
    + "<div style='font-size:26px;font-weight:800;color:#fb923c;font-family:monospace;'>" + daysLeft + "</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:4px;'>DAYS LEFT</div>"
    + "</td></tr></table>"
    + "<div style='font-family:monospace;font-size:13px;color:#444;background:#06080a;border-radius:6px;padding:10px 14px;'>"
    + "[<span style='color:" + accent + ";'>" + bar + "</span>] " + pct + "%"
    + "</div></div>";
}

function buildOfficeExtendedBlock(accent) {
  return "<div style='background:linear-gradient(135deg," + accent + "18," + accent + "08);border:2px solid " + accent + "55;border-radius:12px;padding:18px 20px;margin-bottom:20px;text-align:center;'>"
    + "<p style='margin:0 0 8px;font-size:9px;letter-spacing:3px;color:" + accent + ";text-transform:uppercase;'>⚡ OFFICE EXTENDED · 5–7 PM · DO NOW</p>"
    + "<p style='margin:0 0 6px;font-size:18px;font-weight:900;color:#fff;letter-spacing:1px;'>2 HRS LEFT IN OFFICE.</p>"
    + "<p style='margin:0;font-size:13px;color:#ccc;'>Watch 1 PPA / DSA / fast.ai lecture · or solve 3 logic problems. <strong style='color:" + accent + ";'>This block alone = +8 hrs/week.</strong></p>"
    + "</div>";
}

function buildBaseChecklist(accent) {
  return "<div style='background:#0d0d0d;border:1px dashed #333;border-radius:10px;padding:14px 16px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 10px;font-size:10px;letter-spacing:3px;color:#666;text-transform:uppercase;'>🏗️ BASE NON-NEGOTIABLES — TICK BY 9 PM</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ Gym 7:50 AM done</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ AM + PM skincare both</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ Minoxidil 2x applied</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ 150g+ protein hit</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ 1 LeetCode + 1 GitHub commit</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ Office Extended (5–7 PM) used</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ Block 1 (8 PM) + Block 2 (10:30 PM) done</p>"
    + "<p style='margin:0;font-size:11px;color:" + accent + ";font-style:italic;margin-top:8px;'>Every box = one brick in the BASE. 30 days of bricks = the foundation.</p>"
    + "</div>";
}

function buildPhaseRoadmap(dayInBase, accent) {
  const phases = [
    { name:"WEEK 1 · IGNITION",   range:"D1-7",   icon:"🔥" },
    { name:"WEEK 2 · BASE BUILD", range:"D8-14",  icon:"🧱" },
    { name:"WEEK 3 · MOMENTUM",   range:"D15-21", icon:"📈" },
    { name:"WEEK 4 · LOCK-IN",    range:"D22-28", icon:"🔒" },
    { name:"WEEK 5 · GRADUATION", range:"D29-30", icon:"🎓" },
  ];
  let rows = "";
  phases.forEach((p, i) => {
    const start = [1,8,15,22,29][i];
    const end   = [7,14,21,28,30][i];
    const isCurrent = dayInBase >= start && dayInBase <= end;
    const isDone    = dayInBase > end;
    const color = isDone ? "#4ade80" : isCurrent ? accent : "#444";
    const status = isDone ? "✔ DONE" : isCurrent ? "▶ NOW" : "○ NEXT";
    rows += "<tr>"
      + "<td style='padding:6px 10px 6px 0;font-size:18px;'>" + p.icon + "</td>"
      + "<td style='padding:6px 10px 6px 0;font-size:12px;color:" + color + ";font-weight:700;font-family:monospace;letter-spacing:1px;'>" + p.range + "</td>"
      + "<td style='padding:6px 0;font-size:13px;color:" + (isDone || isCurrent ? "#ddd" : "#666") + ";'>" + p.name + "</td>"
      + "<td style='padding:6px 0;font-size:10px;color:" + color + ";text-align:right;font-family:monospace;letter-spacing:1px;'>" + status + "</td>"
      + "</tr>";
  });
  return "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>🗺️ 30-DAY BASE ROADMAP</p>"
    + "<table width='100%' cellpadding='0' cellspacing='0'>" + rows + "</table>"
    + "</div>";
}

export default async function handler() {
  const dayNum = getDayNumber();

  // Only run during the first 30 days of the BASE plan
  if (dayNum > BASE_TOTAL_DAYS) {
    console.log("BASE progress mail skipped — Day " + dayNum + " is past Month 1 (>" + BASE_TOTAL_DAYS + ")");
    return new Response(JSON.stringify({ success:true, skipped:true, reason:"past-base-window" }), { status: 200 });
  }

  const dayInBase = Math.min(dayNum, BASE_TOTAL_DAYS);
  const plan = BASE_DAYS[dayInBase - 1] || BASE_DAYS[BASE_DAYS.length - 1];
  const accent = "#22d3ee";
  const dateStr = getDateStr();
  const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });
  const pct = Math.round(dayInBase / BASE_TOTAL_DAYS * 100);
  const subject = "🏗️ BASE D" + dayInBase + "/30 · " + shortDate + " · " + pct + "% · " + plan.focus.slice(0, 36);

  const svgCard = generateBaseCardSvg(dayInBase, plan);
  const svgDataUri = "data:image/svg+xml;base64," + Buffer.from(svgCard).toString("base64");

  const html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
    + "<body style='margin:0;padding:0;background:#06080a;'>"
    + "<div style='max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#06080a;'>"
    + "<div style='height:4px;background:linear-gradient(to right," + accent + "," + accent + "44,transparent);border-radius:4px;margin-bottom:28px;'></div>"
    + "<p style='margin:0 0 6px;font-size:10px;letter-spacing:4px;color:" + accent + ";text-transform:uppercase;'>5 PM CHECK-IN · BASE DAY " + dayInBase + " OF 30</p>"
    + "<h1 style='margin:0 0 4px;font-size:28px;font-weight:900;color:#f0f0f0;'>🏗️ Foundation Check.</h1>"
    + "<p style='margin:0 0 24px;font-size:12px;color:#555;'>" + dateStr + "</p>"
    + buildOfficeExtendedBlock(accent)
    + buildBigProgressBar(dayInBase, accent)
    + "<div style='margin-bottom:20px;border-radius:14px;overflow:hidden;'>"
    + "<img src='" + svgDataUri + "' width='560' style='display:block;width:100%;border-radius:14px;border:0;' alt='" + escXml(plan.focus) + "'>"
    + "</div>"
    + buildPhaseRoadmap(dayInBase, accent)
    + buildBaseChecklist(accent)
    + "<div style='text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;'>"
    + "<p style='margin:0 0 4px;font-size:13px;color:#888;font-weight:700;'>" + (BASE_TOTAL_DAYS - dayInBase) + " days till BASE graduates → Advanced DSA + DL begins.</p>"
    + "<p style='margin:0 0 4px;font-size:11px;color:#555;'>BASE = the foundation that makes Months 2-7 possible. Skip a brick = crack the wall.</p>"
    + "<p style='margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;'>RUTURAJ BLUEPRINT · MONTH 1 BASE · 2026</p>"
    + "</div></div></body></html>";

  const text = "🏗️ BASE PROGRESS · 5 PM CHECK-IN\n"
    + "Day " + dayInBase + " of 30 · " + dateStr + " · " + pct + "% done\n"
    + "\n" + plan.phase + "\n"
    + "FOCUS: " + plan.focus + "\n"
    + "DRILL: " + plan.drill + "\n"
    + "\n>>> OFFICE EXTENDED 5-7 PM · USE IT NOW <<<\n"
    + "Watch 1 lecture or solve 3 logic problems. +8 hrs/week.\n"
    + "\nNON-NEGOTIABLES BY 9 PM:\n"
    + "  [ ] Gym + skincare + Minoxidil\n"
    + "  [ ] 150g+ protein\n"
    + "  [ ] 1 LeetCode + 1 GitHub commit\n"
    + "  [ ] Office Extended (5-7 PM) used\n"
    + "  [ ] Block 1 + Block 2 done\n"
    + "\n" + (BASE_TOTAL_DAYS - dayInBase) + " days till BASE graduates.\n"
    + "RUTURAJ BLUEPRINT · MONTH 1 BASE · 2026";

  const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com", port:587, secure:false,
    auth:{ user:SENDER_EMAIL, pass:SENDER_PASS }
  });
  await transporter.sendMail({
    from:'"Ruturaj BASE" <'+SENDER_EMAIL+'>', to:MY_EMAIL, subject, text, html
  });
  console.log("BASE 5 PM email sent — Day " + dayInBase + "/30");
  return new Response(JSON.stringify({ success:true, day:dayInBase }), { status: 200 });
}

export const config = { schedule: "30 11 * * *" };
