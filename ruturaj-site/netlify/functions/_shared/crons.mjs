// The two cron windows, in UTC, as Netlify runs them. The literal strings in
// send-morning-email.mjs and send-evening-email.mjs must match these (Netlify
// reads `config.schedule` statically, so they cannot import it); test-mail
// checks that they do. Ticks every 15 minutes inside each window.

export const CRONS = {
  /** 00:00–03:45 UTC = 05:30–09:15 IST. */
  morning: { cron: '0,15,30,45 0-3 * * *', windowIst: '05:30–09:15' },
  /** 10:00–13:45 UTC = 15:30–19:15 IST. */
  evening: { cron: '0,15,30,45 10-13 * * *', windowIst: '15:30–19:15' },
};
