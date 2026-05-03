// Scheduled — 8:00 PM IST = 14:30 UTC daily (Study Block 1 starts NOW)
import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

// 14 evening themes — focused on the GRIND ahead (study blocks 7:30 PM → 12:30 AM)
const THEMES = [
  { emoji:"🌙", accent:"#a78bfa", g1:"#180030", g2:"#0c0018",
    quote:"DINNER DONE. NOW THE REAL WORK.",
    sub:"4.5 hours of study left. Use them or lose them.",
    mission:"Study Block 1 (8:00 PM): 2 LeetCode + 1 system design",
    push:"PLATE IN SINK. PHONE AWAY. SIT DOWN. CODE.",
    story:"Your office colleagues just sat down to Netflix. They'll wake at 8 AM tomorrow with 0 LeetCode solved. You ate early, sat at your desk, and DID THE WORK. In 6 months, you'll be the one with the offer letter. They'll still be at PW." },

  { emoji:"⚡", accent:"#47c8ff", g1:"#001828", g2:"#000d18",
    quote:"8:00 PM. TIMER STARTS. PHONE OFF.",
    sub:"Next 2.5 hours decide whether today was a win or a waste.",
    mission:"2 LeetCode mediums by 10:30 PM — phone in another room",
    push:"OPEN LEETCODE. PROBLEM 1. NOW.",
    story:"In Korea right now, a 23-year-old just sat down at his desk. Same time as you. Same dream. He doesn't have your job + 5G background — but he has the SEAT TIME. Don't lose to him. Out-sit him." },

  { emoji:"🔥", accent:"#e8ff47", g1:"#1a2200", g2:"#0a0f00",
    quote:"FATIGUE IS A LIAR. WORK ANYWAY.",
    sub:"Your brain says 'tired'. Your future says 'don't stop'. Listen to the future.",
    mission:"Push through Block 1 even at 60% energy",
    push:"COFFEE. STAND UP. SHAKE IT OFF. CODE.",
    story:"Kobe Bryant trained at 4 AM after 9 PM games. Why? Because greatness doesn't ask if you're tired. It asks if you're SHOWING UP. You're tired. Good. Show up anyway." },

  { emoji:"💼", accent:"#fbbf24", g1:"#1c1400", g2:"#0f0b00",
    quote:"OFFICE PAID FOR YOUR ROOF. STUDY PAYS FOR YOUR FUTURE.",
    sub:"PW pays today. MAANG pays in 6 months. Both deserve their hours.",
    mission:"Treat 7:30–12:30 like billable hours — your future self pays you",
    push:"OPEN VS CODE. WRITE THE FIRST LINE.",
    story:"Salary slip math: PW = ₹X lakhs. MAANG offer in 6 months = ₹80L+. Hourly difference = 6x. That's a 600% raise per hour invested NOW. No stock market, no startup, no shortcut beats this ROI." },

  { emoji:"🥷", accent:"#86efac", g1:"#001c0a", g2:"#000f05",
    quote:"NO ONE WILL APPLAUD THIS GRIND. DO IT ANYWAY.",
    sub:"7:30 PM grind is invisible. November offer letter isn't.",
    mission:"Code in silence · Push commit · Tell no one",
    push:"CLOSE INSTAGRAM. OPEN GITHUB.",
    story:"Mom-Papa think you're 'doing some studies'. Friends think you're 'busy'. Cousins think you 'haven't changed'. Six months from now, when the offer drops, EVERYONE will ask 'how did you do it?'. The answer: tonight." },

  { emoji:"📈", accent:"#22d3ee", g1:"#001820", g2:"#000d14",
    quote:"5 HOURS NOW = ₹47,619 BANKED.",
    sub:"₹1 cr in 6 months = ₹47,619/day. Tonight's session pays daily wage.",
    mission:"Earn today's installment — full 4 hrs deep work",
    push:"YOU'RE ON THE CLOCK. CLOCK IN.",
    story:"Imagine a recruiter offering you ₹47,619 cash to work 5 hours tonight. You'd say YES in a second. Same offer, deferred 6 months. Same value. Same effort. SAME YES." },

  { emoji:"⚔️", accent:"#fde047", g1:"#1c1800", g2:"#0e0c00",
    quote:"DON'T LET THE EVENING WIN.",
    sub:"Most plans die at 8 PM. Yours doesn't. Yours starts at 8:00 sharp.",
    mission:"Beat the post-dinner slump — no Netflix till midnight",
    push:"NETFLIX OFF. LEETCODE ON.",
    story:"8:01 PM is where MAANG candidates separate from MAANG aspirants. Aspirants check Insta. Candidates open VS Code. Pick a side. Now." },

  { emoji:"🧠", accent:"#4ade80", g1:"#001c0d", g2:"#000f06",
    quote:"DEEP WORK > SCROLLED WORK.",
    sub:"30 min of deep focus > 3 hours of distracted 'studying'.",
    mission:"Phone in another room · Wifi off if needed · Pure focus",
    push:"PUT PHONE OUT OF ARM'S REACH.",
    story:"Cal Newport's research: deep work compounds. Shallow work evaporates. The engineer who deep-works 4 hrs/day for 6 months OUTPERFORMS the one who 'studies' 8 hrs/day distracted. Be the first one." },

  { emoji:"🌋", accent:"#f472b6", g1:"#1c0014", g2:"#0e000a",
    quote:"FUTURE RUTURAJ IS WATCHING THIS HOUR.",
    sub:"He sees you choose now. Choose well.",
    mission:"Make the 8:00–10:30 block count — he's watching",
    push:"OPEN THE EDITOR. HE'S WATCHING.",
    story:"25-year-old you, ₹80L CTC, calm and confident, is sitting in his MAANG office right now (in your future). He whispers across time: 'Bhai, that 8:00 block I'm so proud of? It's right now. Don't waste it.' Honor him." },

  { emoji:"💯", accent:"#34d399", g1:"#001c14", g2:"#000d09",
    quote:"NEVER MISS THE EVENING BLOCK.",
    sub:"Skip the morning gym? Sad. Skip evening study? Career-killing.",
    mission:"Even at 50% — 1 LeetCode + 30 min reading. Don't ZERO.",
    push:"OPEN ANYTHING. JUST DON'T STOP.",
    story:"You're tired. Office sucked. Lectures drained you. FINE. Do ONE problem. Read 10 pages. Touch the keyboard for 20 min. Half a session > zero. The streak is the asset. Don't break it. Ever." },

  { emoji:"🎯", accent:"#f87171", g1:"#1c0008", g2:"#0f0004",
    quote:"OUTPUT > HOURS LOGGED.",
    sub:"Don't measure time at desk. Measure problems solved + lines pushed.",
    mission:"By 12:30 AM: 2 LeetCode solved + 1 GitHub commit + notes saved",
    push:"DEFINE 'DONE'. THEN GET TO IT.",
    story:"Anyone can sit at a desk for 5 hours. Few can SHIP. Tonight: 2 problems, 1 commit, 1 concept understood. That's the bar. Hit it. Mark it. Then sleep proud." },

  { emoji:"🚀", accent:"#fb923c", g1:"#1c0800", g2:"#0f0400",
    quote:"BUILD THE PROJECT. SHIP IT.",
    sub:"Block 2 (10:30 PM) = your AI/ML project hour. Move it forward, daily.",
    mission:"Write 50+ lines on your AI project tonight",
    push:"OPEN THE REPO. WRITE FUNCTION 1.",
    story:"In your interview, the panel will ask 'tell me about a project you built end-to-end'. The story you tell that day starts being WRITTEN tonight. One commit at a time. Make tonight's commit count." },

  { emoji:"💪", accent:"#fbbf24", g1:"#1c1400", g2:"#0f0b00",
    quote:"GYM WAS THE WARM-UP. STUDY IS THE FIGHT.",
    sub:"Body trained at 7:50 AM. Brain trains at 7:30 PM. Both are non-negotiable.",
    mission:"Bring gym energy to the desk — 4 hrs of focused effort",
    push:"SAME INTENSITY AS THE GYM. NOW.",
    story:"You wouldn't quit a set halfway. You wouldn't skip leg day twice. Treat LeetCode like the gym. 2 problems = 2 sets. Don't rack-pull. Don't skip reps. Show the same discipline." },

  { emoji:"🥇", accent:"#e8ff47", g1:"#1a2200", g2:"#0a0f00",
    quote:"WIN THE NIGHT. WIN THE WEEK. WIN THE OFFER.",
    sub:"Tonight = 1/210th of your MAANG plan. Make it count.",
    mission:"Today = won. Tomorrow = next won day. Stack them.",
    push:"END THE DAY ON A WIN. CLOSE IT 100%.",
    story:"Six months. 210 days. Each one a brick. Tonight is brick #" + new Date().getDate() + ". Lay it straight. Lay it strong. The wall you're building is the wall recruiters will admire when they hand you the offer." },
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
<text x="32" y="41" font-family="Courier New,monospace" font-weight="700" font-size="11" fill="${theme.accent}">DAY ${dayNum} / 210</text>
<text x="24" y="112" font-size="42">${theme.emoji}</text>
<text x="24" y="138" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${theme.accent}" opacity="0.75">EVENING IGNITION</text>
${quoteSvg}
${subSvg}
<text x="24" y="${storyTitleY}" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${theme.accent}" opacity="0.75">📖 STORY OF THE DAY</text>
<rect x="24" y="${storyBoxY}" width="${W-48}" height="${storyHeight}" rx="8" fill="#000000" fill-opacity="0.35" stroke="${theme.accent}33" stroke-width="1"/>
${storySvg}
<rect x="24" y="${missionY}" width="${W-48}" height="${pillH}" rx="8" fill="${theme.accent}15" stroke="${theme.accent}40" stroke-width="1"/>
${missionSvg}
</svg>`;
}


function planRow(ico,time,task,color) {
  return "<tr><td style='padding:5px 10px 5px 0;font-size:17px;'>"+ico+"</td>"
    +"<td style='padding:5px 10px 5px 0;color:"+color+";font-family:monospace;font-size:12px;white-space:nowrap;'>"+time+"</td>"
    +"<td style='padding:5px 0;color:#ccc;font-size:13px;'>"+task+"</td></tr>";
}


function buildMonthProgress(dayNum, accent) {
  const month1Days = 30;
  const dayInMonth = Math.min(dayNum, month1Days);
  const pct = Math.round(dayInMonth / month1Days * 100);
  const filled = Math.min(20, Math.round(pct / 5));
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  const daysLeft = Math.max(0, month1Days - dayNum);
  return "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 10px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>MONTH 1 BASE — DAY COUNTER</p>"
    + "<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:10px;'>"
    + "<tr>"
    + "<td style='padding:8px;text-align:center;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;'>"
    + "<div style='font-size:22px;font-weight:800;color:" + accent + ";font-family:monospace;'>DAY " + dayNum + "</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:3px;'>of 210</div>"
    + "</td><td width='10'></td>"
    + "<td style='padding:8px;text-align:center;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;'>"
    + "<div style='font-size:22px;font-weight:800;color:#4ade80;font-family:monospace;'>" + pct + "%</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:3px;'>MONTH 1 DONE</div>"
    + "</td><td width='10'></td>"
    + "<td style='padding:8px;text-align:center;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;'>"
    + "<div style='font-size:22px;font-weight:800;color:#fb923c;font-family:monospace;'>" + daysLeft + "</div>"
    + "<div style='font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-top:3px;'>DAYS LEFT M1</div>"
    + "</td></tr></table>"
    + "<div style='font-family:monospace;font-size:12px;color:#555;background:#0a0a0a;border-radius:6px;padding:8px 12px;'>"
    + "[<span style='color:" + accent + ";'>" + bar + "</span>] " + pct + "%"
    + "</div></div>";
}

function buildPushBlock(theme) {
  return "<div style='background:linear-gradient(135deg," + theme.accent + "18," + theme.accent + "08);border:2px solid " + theme.accent + "55;border-radius:12px;padding:18px 20px;margin-bottom:20px;text-align:center;'>"
    + "<p style='margin:0 0 6px;font-size:9px;letter-spacing:3px;color:" + theme.accent + ";text-transform:uppercase;'>⚡ DO THIS RIGHT NOW</p>"
    + "<p style='margin:0;font-size:18px;font-weight:900;color:#fff;letter-spacing:1px;'>" + theme.push + "</p>"
    + "</div>";
}

function buildEveningChecklist(accent) {
  return "<div style='background:#0d0d0d;border:1px dashed #333;border-radius:10px;padding:14px 16px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 8px;font-size:10px;letter-spacing:3px;color:#666;text-transform:uppercase;'>🎯 TONIGHT'S CLOSING CHECKLIST</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ 2 LeetCode solved (Block 1)</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ 50+ lines on AI project (Block 2)</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ 1 GitHub commit pushed</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ PM skincare + Minoxidil applied</p>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#aaa;'>☐ In bed by 1:30 AM (no later)</p>"
    + "<p style='margin:0;font-size:11px;color:" + accent + ";font-style:italic;margin-top:8px;'>Cross every box. Sleep proud. Repeat tomorrow.</p>"
    + "</div>";
}

export default async function handler() {
  const dayNum  = getDayNumber();
  const dateStr = getDateStr();
  const shortDate = new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"});
  const theme   = THEMES[dayNum % THEMES.length];
  const { accent } = theme;
  const subject = "⚡ D" + dayNum + " · " + shortDate + " · " + theme.quote.slice(0, 38);
  const svgCard = generateCardSvg(theme, dayNum);
  const svgDataUri = "data:image/svg+xml;base64," + Buffer.from(svgCard).toString("base64");

  const planRows = planRow("🍽️","7:15 PM","Early dinner with family (45 min) — eat first",accent)
    + planRow("💡","8:00 PM","STUDY BLOCK 1 (2.5 hrs) — 2 LeetCode, phone away",accent)
    + planRow("📖","10:30 PM","STUDY BLOCK 2 (2 hrs) — AI project + GitHub push",accent)
    + planRow("🌿","12:30 AM","PM skincare + Minoxidil + 15 min night walk",accent)
    + planRow("📝","1:00 AM","Review day · journal 3 lines · prep tomorrow",accent)
    + planRow("😴","1:30 AM","SCREENS OFF. SLEEP. WIN TOMORROW.",accent);

  const html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
    +"<body style='margin:0;padding:0;background:#080808;'>"
    +"<div style='max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#080808;'>"
    +"<div style='height:4px;background:linear-gradient(to right,"+accent+","+accent+"44,transparent);border-radius:4px;margin-bottom:28px;'></div>"
    +"<p style='margin:0 0 6px;font-size:10px;letter-spacing:4px;color:"+accent+";text-transform:uppercase;'>EVENING CHECK-IN · DAY "+dayNum+" OF 210</p>"
    +"<h1 style='margin:0 0 4px;font-size:28px;font-weight:900;color:#f0f0f0;'>⚡ Dinner Done. Now Grind.</h1>"
    +"<p style='margin:0 0 24px;font-size:12px;color:#555;'>"+dateStr+"</p>"
    + buildPushBlock(theme)
    +"<div style='margin-bottom:20px;border-radius:14px;overflow:hidden;'>"
    +"<img src='" + svgDataUri + "' width='560' style='display:block;width:100%;border-radius:14px;border:0;' alt='" + escXml(theme.quote) + "'>"
    +"</div>"
    +"<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    +"<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>EVENING PLAN — 7:15 PM → 1:30 AM</p>"
    +"<table cellpadding='0' cellspacing='0' width='100%'>"+planRows+"</table>"
    +"</div>"
    + buildEveningChecklist(accent)
    + buildMonthProgress(dayNum, accent)
    +"<div style='text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;'>"
    +"<p style='margin:0 0 4px;font-size:13px;color:#888;font-weight:700;'>4.5 hrs of study left tonight. Use them. " + (210 - dayNum) + " days till the offer.</p>"
    +"<p style='margin:0 0 4px;font-size:11px;color:#555;'>Eat early (7:15) → study deep (8 PM → 12:30 AM). No late dinner. No bloated brain.</p>"
    +"<p style='margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;'>RUTURAJ BLUEPRINT · 7 MONTH PLAN · 2026</p>"
    +"</div></div></body></html>";

  const text = "EVENING CHECK-IN ⚡\nDay "+dayNum+" of 210 · "+dateStr
    +"\n\n"+theme.emoji+" "+theme.quote+"\n"+theme.sub
    +"\n\n>>> "+theme.push+" <<<"
    +"\n\nSTORY OF THE DAY:\n"+theme.story
    +"\n\nMISSION: "+theme.mission
    +"\n\nTONIGHT'S CHECKLIST:"
    +"\n  [ ] 2 LeetCode (Block 1)"
    +"\n  [ ] 50+ lines AI project (Block 2)"
    +"\n  [ ] 1 GitHub commit"
    +"\n  [ ] Skincare + Minoxidil"
    +"\n  [ ] In bed by 1:30 AM"
    +"\n\nRUTURAJ BLUEPRINT · 2026";

  const transporter = nodemailer.createTransport({host:"smtp.gmail.com",port:587,secure:false,auth:{user:SENDER_EMAIL,pass:SENDER_PASS}});
  await transporter.sendMail({
    from:'"Ruturaj Blueprint" <'+SENDER_EMAIL+'>',to:MY_EMAIL,subject,text,html
  });
  console.log("Evening email sent — Day "+dayNum);
  return new Response(JSON.stringify({success:true}),{status:200});
}
export const config = { schedule: "30 14 * * *" };
