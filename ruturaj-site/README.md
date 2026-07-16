# Ruturaj Blueprint — Deployment Guide

## Folder Structure
```
ruturaj-site/
├── index.html                          ← Your main app
├── netlify.toml                        ← Netlify config
├── package.json                        ← nodemailer dependency
└── netlify/
    └── functions/
        ├── send-morning-email.mjs      ← 7:30 AM IST daily email
        └── send-evening-email.mjs      ← 5:00 PM IST daily email
```

---

## Step-by-Step Deployment

### Step 1 — Install Git (if not already)
Download from https://git-scm.com and install.

### Step 2 — Create a GitHub repo
1. Go to https://github.com/new
2. Name it `ruturaj-blueprint` (private is fine)
3. Click **Create repository**

### Step 3 — Push your files
Open a terminal/command prompt in your `ruturaj-site` folder and run:

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ruturaj-blueprint.git
git push -u origin main
```

### Step 4 — Connect to Netlify
1. Go to https://app.netlify.com
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and select `ruturaj-blueprint`
4. Leave all build settings as default (no build command needed)
5. Click **Deploy site**

### Step 5 — That's it! ✅
Netlify will automatically:
- Host your `index.html` at a free URL like `https://ruturaj-blueprint.netlify.app`
- Run `send-morning-email` every day at **7:30 AM IST**
- Run `send-base-progress` every day at **5:00 PM IST** (first 30 days)
- Run `send-evening-email` every day at **7:30 PM IST** (Study Block 1 kickoff)

---

## Email Schedule (IST → UTC conversion)
| Email         | IST Time  | UTC Time (cron) |
|---------------|-----------|-----------------|
| Morning email | 7:30 AM   | `0 2 * * *`     |
| Base progress | 5:00 PM   | `30 11 * * *`   |
| Evening email | 7:30 PM   | `0 14 * * *`    |

---

## Verify Emails Are Working
1. In Netlify dashboard → **Functions** tab
2. You'll see `send-morning-email` and `send-evening-email` listed
3. Click on either → **Logs** to see if they're firing
4. You can also trigger them manually by clicking **Invoke function**

---

## Troubleshooting
- **Emails not arriving?** Check your spam folder. Also verify the Gmail App Password is correct.
- **Function errors?** Check the Netlify Functions logs for the error message.
- **Wrong timezone?** The cron runs in UTC. IST = UTC + 5:30. The current config is correct.
