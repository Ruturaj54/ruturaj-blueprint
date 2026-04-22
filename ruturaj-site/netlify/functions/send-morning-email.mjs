// Scheduled — 7:30 AM IST = 02:00 UTC daily
import nodemailer from "nodemailer";

const SENDER_EMAIL = "shivjiforyou@gmail.com";
const SENDER_PASS  = "tyrm usfv bvgd wgob";
const MY_EMAIL     = "ruturajdharne54945@gmail.com";

const THEMES = [
  { emoji:"🔥", accent:"#e8ff47", g1:"#1a2200", g2:"#0a0f00", quote:"YOU ARE 23. THE TIME IS NOW.",          sub:"Every hour past 7:30 AM is an hour someone else used to get ahead.",                         mission:"Wake 7:30 · Gym 7:50 · 2 LeetCode today"   },
  { emoji:"⚡", accent:"#47c8ff", g1:"#001828", g2:"#000d18", quote:"MAANG IS NOT LUCK. IT IS DAILY REPS.",  sub:"Google engineers showed up every day. 300+ problems. You can too.",                          mission:"Solve 2 LeetCode + read 1 chapter DDIA"      },
  { emoji:"💎", accent:"#c084fc", g1:"#1a0030", g2:"#0d0018", quote:"YOUR TELECOM BACKGROUND IS A MOAT.",    sub:"4G/5G + AI = a profile 99% of freshers cannot replicate.",                                  mission:"Push 1 GitHub commit + 1 AI project task"    },
  { emoji:"🏆", accent:"#fbbf24", g1:"#1c1400", g2:"#0f0b00", quote:"SIX MONTHS. EVERYTHING CHANGES.",      sub:"You will look back at this as the day you decided. Execute.",                                mission:"Complete all checklist tasks — 100% score"   },
  { emoji:"🚀", accent:"#fb923c", g1:"#1c0800", g2:"#0f0400", quote:"REVISE FIRST. THEN CONQUER.",           sub:"PPA + Logic + Python = the foundation everything else is built on.",                        mission:"1 PPA chapter + 3 logic building problems"   },
  { emoji:"💪", accent:"#4ade80", g1:"#001c0d", g2:"#000f06", quote:"GYM + BRAIN. BOTH. EVERY DAY.",         sub:"Look sharp AND think sharp. Gym keeps cortisol low and focus high.",                        mission:"Hit gym by 7:50 AM — no exceptions"          },
  { emoji:"🌅", accent:"#ffa94d", g1:"#1c1000", g2:"#0f0800", quote:"THE MORNING BELONGS TO YOU.",           sub:"7:30 AM is your edge. Building the body that walks into Google.",                           mission:"Gym 7:50 · Skincare done · Office 10:00"     },
  { emoji:"🎯", accent:"#f87171", g1:"#1c0008", g2:"#0f0004", quote:"FOCUS IS A SKILL. TRAIN IT.",           sub:"Every phone resist = focus training. Every distraction weakens it.",                        mission:"Phone away during both study blocks"          },
  { emoji:"🧠", accent:"#86efac", g1:"#001c0a", g2:"#000f05", quote:"CONSISTENCY BEATS INTENSITY.",          sub:"Never miss two in a row. One bad day is fine. Two is a pattern.",                           mission:"Study Block 1 (5:30 PM): 2 hours, no phone"  },
  { emoji:"📈", accent:"#22d3ee", g1:"#001820", g2:"#000d14", quote:"₹1 CRORE = DAILY INPUT.",               sub:"MAANG salaries go to those who put in the work every single day.",                          mission:"Log 2 study blocks + push to GitHub"         },
];

function getDayNumber() {
  return Math.max(1, Math.round((new Date() - new Date("2026-04-22T00:00:00+05:30")) / 86400000) + 1);
}
function getDateStr() {
  return new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Kolkata" });
}

function generateCardSvg(theme, dayNum) {
  const W = 600;
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
  const quoteLines = wrapText(theme.quote, 28);
  const subLines   = wrapText(theme.sub, 68);
  let quoteY = 168;
  const quoteSvg = quoteLines.map(l => {
    const y = quoteY; quoteY += 36;
    return `<text x="24" y="${y}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="24" fill="${theme.accent}">${l}</text>`;
  }).join("\n  ");
  let subY = quoteY + 8;
  const subSvg = subLines.map(l => {
    const y = subY; subY += 18;
    return `<text x="24" y="${y}" font-family="Arial,sans-serif" font-size="12" fill="#aaaaaa">${l}</text>`;
  }).join("\n  ");
  const missionY = subY + 14;
  const missionLines = wrapText(theme.mission, 70);
  const missionSvg = missionLines.map((l, i) =>
    `<text x="38" y="${missionY + 16 + i * 16}" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${theme.accent}">⚡ ${l}</text>`
  ).join("\n  ");
  const pillH = Math.max(32, missionLines.length * 16 + 20);
  const svgH = Math.max(320, missionY + pillH + 16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.g1}"/>
      <stop offset="100%" stop-color="${theme.g2}"/>
    </linearGradient>
    <linearGradient id="border" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="60%" stop-color="${theme.accent}88"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <clipPath id="rr"><rect width="${W}" height="${svgH}" rx="18" ry="18"/></clipPath>
  </defs>
  <rect width="${W}" height="${svgH}" rx="18" ry="18" fill="url(#bg)"/>
  <rect y="0" width="${W}" height="4" fill="url(#border)" clip-path="url(#rr)"/>
  <rect x="24" y="24" width="96" height="26" rx="6" fill="${theme.accent}22" stroke="${theme.accent}55" stroke-width="1"/>
  <text x="32" y="41" font-family="Courier New,monospace" font-weight="700" font-size="11" fill="${theme.accent}">DAY ${dayNum} / 210</text>
  <text x="24" y="112" font-family="Segoe UI Emoji,sans-serif" font-size="42">${theme.emoji}</text>
  <text x="24" y="138" font-family="Courier New,monospace" font-weight="700" font-size="10" fill="${theme.accent}" opacity="0.75">TODAY\'S IGNITION</text>
  ${quoteSvg}
  ${subSvg}
  <rect x="24" y="${missionY}" width="${W - 48}" height="${pillH}" rx="8" fill="${theme.accent}15" stroke="${theme.accent}40" stroke-width="1"/>
  ${missionSvg}
</svg>`;
}

function planRow(ico, time, task, color) {
  return "<tr><td style='padding:5px 10px 5px 0;font-size:17px;'>" + ico + "</td>"
    + "<td style='padding:5px 10px 5px 0;color:" + color + ";font-family:monospace;font-size:12px;white-space:nowrap;'>" + time + "</td>"
    + "<td style='padding:5px 0;color:#ccc;font-size:13px;'>" + task + "</td></tr>";
}

export default async function handler() {
  const dayNum  = getDayNumber();
  const dateStr = getDateStr();
  const shortDate = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", timeZone:"Asia/Kolkata" });
  const theme   = THEMES[dayNum % THEMES.length];
  const { accent } = theme;
  const subject = "🌅 Day " + dayNum + " Morning — " + shortDate + " — Rise & Conquer, Ruturaj!";
  const svgCard = generateCardSvg(theme, dayNum);
  const svgDataUri = "data:image/svg+xml;base64," + Buffer.from(svgCard).toString("base64");

  const planRows = planRow("⏰","7:30 AM","Wake up + hydrate + AM skincare",accent)
    + planRow("🏋️","7:50 AM","GYM — cardio + PPL weights",accent)
    + planRow("💼","10:00 AM","Office — deliver fast, learn in gaps",accent)
    + planRow("💡","5:30 PM","STUDY BLOCK 1 (2 hrs) — 2 LeetCode + DSA",accent)
    + planRow("📖","8:30 PM","STUDY BLOCK 2 (2.5 hrs) — AI/ML project",accent)
    + planRow("🌿","11:00 PM","PM skincare + Minoxidil",accent)
    + planRow("😴","1:00 AM","SLEEP",accent);

  const html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
    + "<body style='margin:0;padding:0;background:#080808;'>"
    + "<div style='max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#080808;'>"
    + "<div style='height:4px;background:linear-gradient(to right," + accent + "," + accent + "44,transparent);border-radius:4px;margin-bottom:28px;'></div>"
    + "<p style='margin:0 0 6px;font-size:10px;letter-spacing:4px;color:" + accent + ";text-transform:uppercase;'>GOOD MORNING · DAY " + dayNum + " OF 210</p>"
    + "<h1 style='margin:0 0 4px;font-size:26px;font-weight:800;color:#f0f0f0;'>🌅 Rise &amp; Conquer</h1>"
    + "<p style='margin:0 0 24px;font-size:12px;color:#555;'>" + dateStr + "</p>"
    + "<div style='margin-bottom:20px;border-radius:14px;overflow:hidden;'>"
    + "<img src='" + svgDataUri + "'" width='560' style='display:block;width:100%;border-radius:14px;border:0;' alt='" + theme.quote + "'>"
    + "</div>"
    + "<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    + "<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>TODAY'S BATTLE PLAN</p>"
    + "<table cellpadding='0' cellspacing='0' width='100%'>" + planRows + "</table>"
    + "</div>"
    + "<div style='text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;'>"
    + "<p style='margin:0 0 4px;font-size:12px;color:#444;'>You are 23. Every hour = compound interest on ₹1 CR+ CTC.</p>"
    + "<p style='margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;'>RUTURAJ BLUEPRINT · 7 MONTH PLAN · 2026</p>"
    + "</div></div></body></html>";

  const text = "GOOD MORNING RUTURAJ 🌅\nDay " + dayNum + " of 210 · " + dateStr
    + "\n\n" + theme.emoji + " " + theme.quote + "\n" + theme.sub
    + "\n\nMISSION: " + theme.mission
    + "\n\nRUTURAJ BLUEPRINT · 2026";

  const transporter = nodemailer.createTransport({ host:"smtp.gmail.com", port:587, secure:false, auth:{ user:SENDER_EMAIL, pass:SENDER_PASS } });
  await transporter.sendMail({
    from: '"Ruturaj Blueprint" <' + SENDER_EMAIL + '>', to: MY_EMAIL, subject, text, html,
  });
  console.log("Morning email sent — Day " + dayNum);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
export const config = { schedule: "0 2 * * *" };
