/**
 * One line a day, shared by the app and the mails.
 *
 * Attributed lines are verifiable (source given). Everything else is original
 * and unattributed; nothing here is a famous name stapled to a sentence they
 * never said. Picked by day number so a refresh never reshuffles it.
 */

export interface Quote {
  line: string;
  by?: string;
  source?: string;
}

export const QUOTES: readonly Quote[] = [
  { line: 'Day 2 is stasis. Followed by irrelevance. Followed by excruciating, painful decline. Followed by death. And that is why it is always Day 1.', by: 'Jeff Bezos', source: '2016 letter to Amazon shareholders' },
  { line: 'Nobody is watching the 18:00 block. That is exactly why it counts.' },
  { line: 'At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work, as a human being.', by: 'Marcus Aurelius', source: 'Meditations, Book 5 (Hays translation)' },
  { line: 'A problem you solved with the solution open is a problem you have read. Close the tab and do it again.' },
  { line: 'The first principle is that you must not fool yourself, and you are the easiest person to fool.', by: 'Richard Feynman', source: 'Caltech commencement address, 1974' },
  { line: 'Three problems a night, five nights a week, is sixty problems a month. The interview is lost or won in that arithmetic.' },
  { line: 'You do not rise to the level of your goals. You fall to the level of your systems.', by: 'James Clear', source: 'Atomic Habits, 2018' },
  { line: 'Run before the day can argue with you.' },
  { line: 'No great thing is created suddenly, any more than a bunch of grapes or a fig.', by: 'Epictetus', source: 'Discourses, Book 1, ch. 15' },
  { line: 'The interviewer is not looking for the fastest typist. They are looking for someone they would want on call with them at 2 am.' },
  { line: 'Simple can be harder than complex: you have to work hard to get your thinking clean to make it simple.', by: 'Steve Jobs', source: 'BusinessWeek interview, 1998' },
  { line: 'Brute force first. Say it out loud. Then make it better. That order is the whole method.' },
  { line: 'It is not that we have a short time to live, but that we waste a lot of it.', by: 'Seneca', source: 'On the Shortness of Life, ch. 1' },
  { line: 'The night block is where the people who get the offer are, while everyone else is watching something.' },
  { line: 'Clarity about what matters provides clarity about what does not.', by: 'Cal Newport', source: 'Deep Work, 2016' },
  { line: 'You already passed the assessment once. The loop is the same work with someone watching. Practise with someone watching.' },
  { line: 'Tired is not the same as done. Done is a logged outcome.' },
  { line: 'Your STAR stories are already true. The work is saying them in two minutes without the word "we".' },
  { line: 'Every pattern you skip now is forty minutes of silence in a room with a stranger later.' },
  { line: 'The walk at 23:00 is part of the plan, not a break from it.' },
  { line: 'One honest line in the mistakes notebook is worth more than another video.' },
  { line: 'The Bar Raiser will ask how you knew it would work. Have the number ready.' },
  { line: 'Consistency is boring from the inside. That is what it looks like when it is working.' },
  { line: 'Sleep is study. Memory consolidates while you are out; the 01:00 cut-off is there for a reason.' },
  { line: 'The person who gets the offer is not smarter than you. They finished the boring middle part.' },
  { line: 'Explain it to the wall before you explain it to the interviewer.' },
  { line: 'A weak topic is just an unvisited one. Visit it today.' },
  { line: 'Two weeks of this and the asked problems stop looking like a list and start looking like a set of six ideas.' },
  { line: 'The call can come any day. The only preparation that counts is the kind that is already done.' },
  { line: 'Ten minutes of warm-up, then the run decides itself.' },
  { line: 'You are not behind. You are at Day N, and Day N has a plan.' },
  { line: 'Write the brute force even when you see the trick. Interviewers want to see the road, not just the destination.' },
  { line: 'Do the hard problem at 21:00, not at 00:30. Energy is a resource; spend it where it buys the most.' },
  { line: 'The best mock is the one that went badly on a Saturday instead of a Tuesday with an offer on the line.' },
];

export function quoteForDay(n: number): Quote {
  const i = ((n % QUOTES.length) + QUOTES.length) % QUOTES.length;
  return QUOTES[i] ?? (QUOTES[0] as Quote);
}

/** Evening lines, picked by how the day went. */
export const EVENING_LINES = {
  strong: [
    'That is a day that moves the needle. Same thing tomorrow, nothing clever.',
    'You did what you said you would do this morning. That sentence is rarer than it sounds.',
  ],
  partial: [
    'Not everything, but the direction was right. Carry the open item and start with it.',
    'Most days look like this one. The plan survives as long as two of these do not become five.',
  ],
  empty: [
    'Nothing logged yet. Start with the smallest item on the list, not the biggest.',
    'The office took the day. The evening is yours; take it back one block at a time.',
  ],
} as const;
