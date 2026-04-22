// Scheduled — 5:00 PM IST = 11:30 UTC daily
import nodemailer from "nodemailer";
import { createCanvas } from "canvas";

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

async function generateCard(theme, dayNum) {
  const W = 600, H = 320;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, theme.g1); grad.addColorStop(1, theme.g2);
  ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(0, 0, W, H, 18); ctx.fill();
  const bg2 = ctx.createLinearGradient(0, 0, W, 0);
  bg2.addColorStop(0, theme.accent); bg2.addColorStop(0.6, theme.accent+"88"); bg2.addColorStop(1,"transparent");
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, 4);
  const glow = ctx.createRadialGradient(W-80,60,0,W-80,60,140);
  glow.addColorStop(0, theme.accent+"18"); glow.addColorStop(1,"transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = theme.accent+"22"; ctx.strokeStyle = theme.accent+"55"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(24,24,90,26,6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = theme.accent; ctx.font = "bold 11px monospace";
  ctx.fillText("DAY " + dayNum + " / 210", 32, 41);
  ctx.font = "44px serif"; ctx.fillText(theme.emoji, 24, 112);
  ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.75; ctx.font = "bold 10px monospace";
  ctx.fillText("TONIGHT'S IGNITION", 24, 140); ctx.globalAlpha = 1;
  ctx.fillStyle = theme.accent; ctx.font = "bold 26px sans-serif";
  const words = theme.quote.split(" "); let line = "", y = 175;
  for (const w of words) {
    const test = line + (line ? " " : "") + w;
    if (ctx.measureText(test).width > W-48) { ctx.fillText(line,24,y); line=w; y+=34; } else { line=test; }
  }
  if (line) ctx.fillText(line,24,y); y+=20;
  ctx.fillStyle = "#aaaaaa"; ctx.font = "14px sans-serif";
  const subWords = theme.sub.split(" "); let subLine = "";
  for (const w of subWords) {
    const test = subLine + (subLine?" ":"") + w;
    if (ctx.measureText(test).width > W-48) { ctx.fillText(subLine,24,y); subLine=w; y+=20; } else { subLine=test; }
  }
  if (subLine) ctx.fillText(subLine,24,y); y+=28;
  ctx.fillStyle = theme.accent+"15"; ctx.strokeStyle = theme.accent+"40"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.roundRect(24,y-16,W-48,34,8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = theme.accent; ctx.font = "bold 12px sans-serif";
  ctx.fillText("⚡ " + theme.mission, 34, y+9);
  return canvas.toBuffer("image/png");
}

function planRow(ico,time,task,color) {
  return "<tr><td style='padding:5px 10px 5px 0;font-size:17px;'>"+ico+"</td>"
    +"<td style='padding:5px 10px 5px 0;color:"+color+";font-family:monospace;font-size:12px;white-space:nowrap;'>"+time+"</td>"
    +"<td style='padding:5px 0;color:#ccc;font-size:13px;'>"+task+"</td></tr>";
}

export default async function handler() {
  const dayNum  = getDayNumber();
  const dateStr = getDateStr();
  const shortDate = new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"});
  const theme   = THEMES[dayNum % THEMES.length];
  const { accent } = theme;
  const subject = "⚡ Day " + dayNum + " Evening — " + shortDate + " — Study Block starts NOW, Ruturaj!";
  const cardBuf = await generateCard(theme, dayNum);

  const planRows = planRow("💡","5:30 PM","STUDY BLOCK 1 — 2 LeetCode, phone away",accent)
    + planRow("🍽️","7:30 PM","Dinner — protein-rich, no sugar",accent)
    + planRow("📖","8:30 PM","STUDY BLOCK 2 — AI project + GitHub push",accent)
    + planRow("🌿","11:00 PM","PM skincare + Minoxidil on temples",accent)
    + planRow("😴","1:00 AM","SCREENS OFF. SLEEP.",accent);

  const html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
    +"<body style='margin:0;padding:0;background:#080808;'>"
    +"<div style='max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif;background:#080808;'>"
    +"<div style='height:4px;background:linear-gradient(to right,"+accent+","+accent+"44,transparent);border-radius:4px;margin-bottom:28px;'></div>"
    +"<p style='margin:0 0 6px;font-size:10px;letter-spacing:4px;color:"+accent+";text-transform:uppercase;'>EVENING CHECK-IN · DAY "+dayNum+" OF 210</p>"
    +"<h1 style='margin:0 0 4px;font-size:26px;font-weight:800;color:#f0f0f0;'>⚡ Evening Report</h1>"
    +"<p style='margin:0 0 24px;font-size:12px;color:#555;'>"+dateStr+"</p>"
    +"<div style='margin-bottom:20px;border-radius:14px;overflow:hidden;'>"
    +"<img src='cid:motivcard' width='560' style='display:block;width:100%;border-radius:14px;border:0;' alt='"+theme.quote+"'>"
    +"</div>"
    +"<div style='background:#111;border:1px solid #222;border-radius:10px;padding:16px 18px;margin-bottom:20px;'>"
    +"<p style='margin:0 0 12px;font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;'>EVENING PLAN</p>"
    +"<table cellpadding='0' cellspacing='0' width='100%'>"+planRows+"</table>"
    +"</div>"
    +"<div style='text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;'>"
    +"<p style='margin:0 0 4px;font-size:12px;color:#444;'>₹1 crore CTC = the output of daily input. Stay the course.</p>"
    +"<p style='margin:0;font-size:10px;color:#2a2a2a;letter-spacing:2px;'>RUTURAJ BLUEPRINT · 7 MONTH PLAN · 2026</p>"
    +"</div></div></body></html>";

  const text = "EVENING CHECK-IN ⚡\nDay "+dayNum+" of 210 · "+dateStr
    +"\n\n"+theme.emoji+" "+theme.quote+"\n"+theme.sub
    +"\n\nMISSION: "+theme.mission+"\n\nRUTURAJ BLUEPRINT · 2026";

  const transporter = nodemailer.createTransport({host:"smtp.gmail.com",port:587,secure:false,auth:{user:SENDER_EMAIL,pass:SENDER_PASS}});
  await transporter.sendMail({
    from:'"Ruturaj Blueprint" <'+SENDER_EMAIL+'>',to:MY_EMAIL,subject,text,html,
    attachments:[{filename:"motivation-day-"+dayNum+".png",content:cardBuf,cid:"motivcard",contentType:"image/png"}],
  });
  console.log("Evening email sent — Day "+dayNum);
  return new Response(JSON.stringify({success:true}),{status:200});
}
export const config = { schedule: "30 11 * * *" };
