// Netlify Function — send-email
// Called by "Email Me" button: /.netlify/functions/send-email?type=morning|evening
// Generates a unique motivation image card daily using SVG→base64 (no extra packages)

import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

// 10 unique themes — accent colour, bg gradient, emoji, quote, sub, mission
const THEMES = [
  { emoji:"🔥", accent:"#e8ff47", g1:"#1a2200", g2:"#0a0f00", quote:"YOU ARE 23. THE TIME IS NOW.",           sub:"Every hour past 7:30 AM is an hour someone else used to get ahead.",                          mission:"Wake 7:30 · Gym 7:50 · 2 LeetCode today"              },
  { emoji:"⚡", accent:"#47c8ff", g1:"#001828", g2:"#000d18", quote:"MAANG IS NOT LUCK. IT IS DAILY REPS.",   sub:"Google engineers showed up every single day. 300+ problems. You can too.",                    mission:"Solve 2 LeetCode + read 1 chapter DDIA"               },
  { emoji:"💎", accent:"#c084fc", g1:"#1a0030", g2:"#0d0018", quote:"YOUR TELECOM BACKGROUND IS A MOAT.",     sub:"4G/5G + AI = a profile 99% of freshers cannot replicate. Build that edge.",                  mission:"Push 1 GitHub commit + 1 AI project task"             },
  { emoji:"🏆", accent:"#fbbf24", g1:"#1c1400", g2:"#0f0b00", quote:"SIX MONTHS. EVERYTHING CHANGES.",       sub:"You will look back at this as the day you decided. The plan is built. Execute.",              mission:"Complete all checklist tasks — 100% score"            },
  { emoji:"🚀", accent:"#fb923c", g1:"#1c0800", g2:"#0f0400", quote:"REVISE FIRST. THEN CONQUER.",            sub:"PPA + Logic + Python = the foundation everything else is built on.",                         mission:"1 PPA chapter + 3 logic building problems"            },
  { emoji:"💪", accent:"#4ade80", g1:"#001c0d", g2:"#000f06", quote:"GYM + BRAIN. BOTH. EVERY DAY.",          sub:"Look sharp in the room AND think sharp. Gym keeps cortisol low and focus high.",              mission:"Hit gym by 7:50 AM — no exceptions"                   },
  { emoji:"🌅", accent:"#ffa94d", g1:"#1c1000", g2:"#0f0800", quote:"THE MORNING BELONGS TO YOU.",            sub:"7:30 AM is your edge. While the city sleeps you are building the body that walks into Google.",mission:"Gym 7:50 · Skincare done · Office 10:00"              },
  { emoji:"🎯", accent:"#f87171", g1:"#1c0008", g2:"#0f0004", quote:"FOCUS IS A SKILL. TRAIN IT.",            sub:"Every phone resist during study = focus training. Every distraction weakens it.",             mission:"Phone away during both study blocks"                  },
  { emoji:"🧠", accent:"#86efac", g1:"#001c0a", g2:"#000f05", quote:"CONSISTENCY BEATS INTENSITY.",           sub:"Never miss two in a row. One bad day is fine. Two is a pattern. That is the rule.",           mission:"Study Block 1 (5:30 PM): 2 hours, no phone"           },
  { emoji:"📈", accent:"#22d3ee", g1:"#001820", g2:"#000d14", quote:"₹1 CRORE = DAILY INPUT.",                sub:"MAANG salaries go to people who put in the work every single day. You have the plan.",        mission:"Log 2 study blocks + push to GitHub"                  },
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


function generateCardSvg(theme, dayNum) {
  function wrapText(text, maxChars) {
    const words = text.split(" ");
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
  const W = 600;
  const quoteLines = wrapText(theme.quote, 26);
  const subLines   = wrapText(theme.sub, 70);
  let quoteY = 168;
  const quoteSvg = quoteLines.map(l => {
    const y = quoteY; quoteY += 36;
    return `<text x="24" y="${y}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="24" fill="${theme.accent}">${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>`;
  }).join("\n  ");
  let subY = quoteY + 8;
  const subSvg = subLines.map(l => {
    const y = subY; subY += 18;
    return `<text x="24" y="${y}" font-family="Arial,sans-serif" font-size="12" fill="#aaaaaa">${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>`;
  }).join("\n  ");
  const missionY = subY + 14;
  const mLines = wrapText(theme.mission, 70);
  const missionSvg = mLines.map((l, i) =>
    `<text x="38" y="${missionY + 16 + i * 16}" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${theme.accent}">⚡ ${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>`
  ).join("\n  ");
  const pillH = Math.max(32, mLines.length * 16 + 20);
  const svgH = Math.max(320, missionY + pillH + 16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${theme.g1}"/><stop offset="100%" stop-color="${theme.g2}"/></linearGradient><linearGradient id="bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${theme.accent}"/><stop offset="60%" stop-color="${theme.accent}88"/><stop offset="100%" stop-color="transparent"/></linearGradient><clipPath id="rr"><rect width="${W}" height="${svgH}" rx="18" ry="18"/></clipPath></defs><rect width="${W}" height="${svgH}" rx="18" ry="18" fill="url(#bg)"/><rect y="0" width="${W}" height="4" fill="url(#bd)" clip-path="url(#rr)"/><rect x="24" y="24" width="96" height="26" rx="6" fill="${theme.accent}22" stroke="${theme.accent}55" stroke-width="1"/><text x="32" y="41" font-family="Courier New,monospace" font-weight="700" font-size="11" fill="${theme.accent}">DAY ${dayNum} / 210</text><text x="24" y="112" font-size="42">${theme.emoji}</text><text x="24" y="138" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${theme.accent}" opacity="0.75">TODAY'S IGNITION</text>${quoteSvg}${subSvg}<rect x="24" y="${missionY}" width="${W-48}" height="${pillH}" rx="8" fill="${theme.accent}15" stroke="${theme.accent}40" stroke-width="1"/>${missionSvg}</svg>`;
}


// ─── plain-text fallback ─────────────────────────────────────────────────────
function buildPlainText(type, body, theme, dayNum, dateStr) {
  const isMorning = type === "morning";
  const pct = body.pct || 0;
  const scoreWord = pct >= 90 ? "PERFECT DAY 🏆" : pct >= 70 ? "GREAT DAY ✅" : pct >= 50 ? "DECENT DAY ⚡" : "NEEDS PUSH ⚠️";
  return [
    isMorning ? "GOOD MORNING RUTURAJ 🌅" : "EVENING CHECK-IN ⚡",
    "Day " + dayNum + " of 210 · " + dateStr,
    "",
    theme.emoji + " " + theme.quote,
    theme.sub,
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

// ─── HTML email ───────────────────────────────────────────────────────────────
function buildHtml(type, body, theme, dayNum, dateStr, svgDataUri) {
  const isMorning = type === "morning";
  const { accent, g1 } = theme;
  const streak  = body.streak  || 0;
  const done    = body.done    || 0;
  const total   = body.total   || 20;
  const pct     = body.pct     || 0;
  const lcTotal = body.lcTotal || 0;
  const aiProj  = body.aiProj  || 0;
  const filled  = Math.min(10, Math.round(pct / 10));
  const scoreBar  = "█".repeat(filled) + "░".repeat(10 - filled);
  const scoreWord = pct >= 90 ? "PERFECT DAY 🏆" : pct >= 70 ? "GREAT DAY ✅" : pct >= 50 ? "DECENT DAY ⚡" : "NEEDS PUSH ⚠️";
  const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });

  const statsRow = isMorning
    ? statCell(streak + "🔥", "STREAK", accent) + "<td width='8'></td>"
      + statCell(lcTotal, "LC SOLVED", "#47c8ff") + "<td width='8'></td>"
      + statCell(aiProj, "AI PROJECTS", "#4ade80")
    : statCell(pct + "%", "TODAY SCORE", accent) + "<td width='8'></td>"
      + statCell(done + "/" + total, "TASKS DONE", "#4ade80") + "<td width='8'></td>"
      + statCell(streak + "🔥", "STREAK", "#fb923c");

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
  const nonNegRows = nonNeg.map(([ico,task]) => chipRow(ico, task, accent)).join("");

  const scoreLine = !isMorning
    ? "<div style='background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-family:monospace;font-size:13px;color:#888;'>"
      + "[<span style='color:" + accent + ";'>" + scoreBar + "</span>]&nbsp;&nbsp;"
      + "<span style='color:" + accent + ";font-weight:700;'>" + scoreWord + "</span></div>"
    : "";

  return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
    + "<body style='margin:0;padding:0;background:#080808;'>"
    + "<div style='max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#080808;'>"

    // top bar
    + "<div style='height:4px;background:linear-gradient(to right," + accent + "," + accent + "44,transparent);border-radius:4px;margin-bottom:28px;'></div>"

    // header
    + "<p style='margin:0 0 6px;font-size:10px;letter-spacing:4px;color:" + accent + ";text-transform:uppercase;opacity:.8;'>"
    + (isMorning ? "GOOD MORNING" : "EVENING CHECK-IN") + " &nbsp;·&nbsp; DAY " + dayNum + " OF 210</p>"
    + "<h1 style='margin:0 0 4px;font-size:26px;font-weight:800;color:#f0f0f0;'>"
    + (isMorning ? "🌅 Rise &amp; Conquer" : "⚡ Evening Report") + "</h1>"
    + "<p style='margin:0 0 24px;font-size:12px;color:#555;'>" + dateStr + "</p>"

    // stats
    + "<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:20px;border-collapse:separate;'>"
    + "<tr>" + statsRow + "</tr></table>"
    + scoreLine

    // ★ motivation image (CID inline — shows without "display images" click)
    + "<div style='margin-bottom:20px;border-radius:14px;overflow:hidden;'>"
    + "<img src='" + svgDataUri + "' width='560' style='display:block;width:100%;max-width:560px;border-radius:14px;border:0;' alt='" + theme.quote + "'>"
    + "</div>"

    // plan
    + "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>"
    + (isMorning ? "TODAY'S BATTLE PLAN" : "EVENING PLAN") + "</p>"
    + "<table cellpadding='0' cellspacing='0' width='100%'>" + planRows + "</table>"
    + "</div>"

    // non-negotiables
    + "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>NON-NEGOTIABLES</p>"
    + "<table cellpadding='0' cellspacing='0' width='100%'>" + nonNegRows + "</table>"
    + "</div>"

    // footer
    + "<div style='text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;'>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#444;'>You are 23. This is YOUR time.</p>"
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
      ? "🌅 Day " + dayNum + " Morning — " + shortDate + " — Rise & Conquer, Ruturaj!"
      : "📊 Day " + dayNum + " Evening — " + shortDate + " — " + (body.pct||0) + "% — " + (body.pct>=90?"PERFECT 🏆":body.pct>=70?"GREAT ✅":body.pct>=50?"DECENT ⚡":"PUSH ⚠️");

    // Generate the motivation card PNG
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
