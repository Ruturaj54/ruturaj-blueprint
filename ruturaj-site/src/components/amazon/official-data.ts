/**
 * Official Amazon guidance, with the page each line comes from. Labelled as
 * official so it is never mixed with candidate reports or our inference.
 */

export interface OfficialLink {
  label: string;
  url: string;
}

export const OFFICIAL = {
  topics: {
    label: 'amazon.jobs: software development topics',
    url: 'https://www.amazon.jobs/content/en/how-we-hire/interview-prep/software-development-topics',
  },
  tips: {
    label: 'About Amazon: recruiters’ tips for software development engineer interviews',
    url: 'https://www.aboutamazon.com/news/workplace/amazon-job-interview-software-development-engineer-recruiter-tips',
  },
  principles: {
    label: 'amazon.jobs: Leadership Principles',
    url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
  },
  loop: {
    label: 'amazon.jobs: the interview loop',
    url: 'https://www.amazon.jobs/content/en/how-we-hire/interview-loop',
  },
  oa: {
    label: 'amazon.jobs: online assessment prep for SDE roles',
    url: 'https://amazon.jobs/content/en/how-we-hire/university/sde-oa',
  },
} as const satisfies Record<string, OfficialLink>;

/** Listed verbatim on the software development topics page. */
export const OFFICIAL_TOPICS: readonly string[] = [
  'Programming language',
  'Data structures',
  'Algorithms',
  'Coding',
  'Object-oriented design',
  'Databases',
  'Distributed computing',
  'Operating systems',
  'Internet topics',
  'General machine learning and artificial intelligence',
];

export const OFFICIAL_TOPICS_NOTE =
  'The same page says most technical interviews require coding and system design whiteboarding exercises, recommends practising coding outside an IDE, and says interviewers look for how you apply what you know rather than what you have memorised.';

/** The six tips, summarised from the recruiters’ article. */
export const RECRUITER_TIPS: readonly string[] = [
  'Study the job description.',
  'Prepare with Amazon’s own resources.',
  'Brush up on coding: write scalable, robust, well-tested code and check the edge cases.',
  'Ask clarifying questions.',
  'Prepare a “Why Amazon?” answer.',
  'Be yourself, not robotic.',
];

export const LEADERSHIP_PRINCIPLES: readonly string[] = [
  'Customer Obsession',
  'Ownership',
  'Invent and Simplify',
  'Are Right, A Lot',
  'Learn and Be Curious',
  'Hire and Develop the Best',
  'Insist on the Highest Standards',
  'Think Big',
  'Bias for Action',
  'Frugality',
  'Earn Trust',
  'Dive Deep',
  'Have Backbone; Disagree and Commit',
  'Deliver Results',
  'Strive to be Earth’s Best Employer',
  'Success and Scale Bring Broad Responsibility',
];

export const LOOP_NOTE =
  'You meet individually with current employees in what Amazon calls the interview loop; each person assesses different aspects of your skills and experience. The page lists the STAR method as preparation.';

/** Quoted from the SDE online-assessment prep page. */
export const OA_NOTE =
  'As you complete each section you’ll receive an email that informs you whether or not you will move to the next step. If you are moved forward in the process for an interview, Amazon will reach out directly.';

export const OA_NO_DAYS = 'That page gives no number of days; any waiting-time figure is an assumption, not Amazon’s.';
