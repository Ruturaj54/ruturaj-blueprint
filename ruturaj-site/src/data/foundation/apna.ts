import type { FoundationSubject } from '@/engine/types';

/**
 * Tier 1 — Apna College "Prime: AI/ML Batch", plus its AI Projects Module.
 *
 * One milestone per course module, numbered exactly as in the course player, so
 * ticking progress here is the same act as finishing a video there. Each part
 * runs 60–120 minutes; budgets use 90 for a standard part.
 *
 * Deliberately excluded because the course itself marks them optional and they
 * are not AI-engineer material: the HTML tutorial (18), CSS parts 1–6, and the
 * certificate (62). Reinforcement Learning (45–47), CI/CD and Kubernetes are
 * listed but optional — they do not hold the gate shut.
 *
 * The planner walks this tier in course order, so the day's missions are the
 * next modules in sequence rather than one module from each of three topics.
 */

const part = (n: number, title: string, minutes = 90) => ({
  id: `ap-${String(n).padStart(2, '0')}`,
  title: `${title} (${n})`,
  mandatory: true,
  estMinutes: minutes,
});

export const APNA_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'ap-python',
    tier: 1,
    name: 'Python',
    source: 'Apna Prime · modules 3–9',
    track: 'backend',
    blurb: 'You write Python professionally — run these fast and spend the saved time on the gaps.',
    milestones: [
      { ...part(3, 'Course Introduction', 30), proof: 'watch' },
      { ...part(4, 'Python Fundamentals Part 1'), proof: 'watch' },
      { ...part(5, 'Python Fundamentals Part 2'), proof: 'watch' },
      { ...part(6, 'Python Fundamentals Part 3'), proof: 'watch' },
      { ...part(7, 'Python Fundamentals Part 4'), proof: 'watch' },
      { ...part(8, 'Python Fundamentals Part 5'), proof: 'watch' },
      { ...part(9, 'Installation', 30), proof: 'watch' },
    ],
  },
  {
    id: 'ap-data',
    tier: 1,
    name: 'Data — NumPy, Pandas, SQL, Visualisation',
    source: 'Apna Prime · modules 10–21',
    track: 'ai',
    blurb: 'The layer every model sits on. SQL here is separately interview-critical.',
    milestones: [
      { ...part(10, 'Phase 2: Data', 30), proof: 'watch' },
      { ...part(11, 'NumPy (Numerical Python)'), proof: 'implement' },
      { ...part(12, 'Pandas Part 1'), proof: 'implement' },
      { ...part(13, 'Pandas Part 2'), proof: 'implement' },
      { ...part(14, 'Data Collection'), proof: 'implement' },
      { ...part(15, 'SQL Part 1'), proof: 'exercise' },
      { ...part(16, 'SQL Part 2'), proof: 'exercise' },
      { ...part(17, 'Data Collection (continuation)', 60), proof: 'implement' },
      { ...part(19, 'Web Scraping (Activity)'), proof: 'implement' },
      { ...part(20, 'Data Visualization Part 1'), proof: 'implement' },
      { ...part(21, 'Data Visualization Part 2'), proof: 'implement' },
    ],
  },
  {
    id: 'ap-math',
    tier: 1,
    name: 'Math for AI',
    source: 'Apna Prime · modules 22–24',
    track: 'ai',
    blurb: 'Enough probability, linear algebra and calculus that backprop and attention read as mechanics.',
    milestones: [
      { ...part(22, 'Math for AI — Probability'), proof: 'notes' },
      { ...part(23, 'Math for AI — Linear Algebra'), proof: 'notes' },
      { ...part(24, 'Math for AI — Calculus'), proof: 'notes' },
    ],
  },
  {
    id: 'ap-ml',
    tier: 1,
    name: 'Machine Learning',
    source: 'Apna Prime · modules 25–36',
    track: 'ai',
    blurb: 'Supervised and unsupervised, including both minor projects — those are your first portfolio pieces.',
    milestones: [
      { ...part(25, 'Starting with Machine Learning', 60), proof: 'watch' },
      { ...part(26, 'Supervised ML Part 1'), proof: 'implement' },
      { ...part(27, 'Supervised ML Part 2'), proof: 'implement' },
      { ...part(28, 'Supervised ML Part 3'), proof: 'implement' },
      { ...part(29, 'Scratch Implementations', 120), proof: 'implement' },
      { ...part(30, 'CreditWise Loan System — minor project', 180), proof: 'project' },
      { ...part(31, 'Supervised ML Part 4'), proof: 'implement' },
      { ...part(32, 'Supervised ML Part 5'), proof: 'implement' },
      { ...part(33, 'Supervised ML Part 6'), proof: 'implement' },
      { ...part(34, 'Unsupervised ML Part 1'), proof: 'implement' },
      { ...part(35, 'Unsupervised ML Part 2'), proof: 'implement' },
      { ...part(36, 'SmartCart Clustering System — minor project', 180), proof: 'project' },
    ],
  },
  {
    id: 'ap-tools',
    tier: 1,
    name: 'Terminal & Git',
    source: 'Apna Prime · modules 37–38',
    track: 'devops',
    blurb: 'Mostly familiar ground. Quick to clear.',
    milestones: [
      { ...part(37, 'Terminal', 60), proof: 'watch' },
      { ...part(38, 'Git & GitHub'), proof: 'implement' },
    ],
  },
  {
    id: 'ap-dl',
    tier: 1,
    name: 'Deep Learning',
    source: 'Apna Prime · modules 39–55, 60',
    track: 'ai',
    blurb: 'The largest block in the course. Reinforcement learning is optional — low relevance for LLM roles.',
    milestones: [
      { ...part(39, 'Deep Learning Part 1'), proof: 'watch' },
      { ...part(40, 'Deep Learning Part 2'), proof: 'watch' },
      { ...part(41, 'Deep Learning Part 3'), proof: 'implement' },
      { ...part(42, 'Deep Learning Part 4'), proof: 'implement' },
      { ...part(43, 'Deep Learning Part 5'), proof: 'implement' },
      { ...part(44, 'Deep Learning Part 6'), proof: 'implement' },
      { ...part(45, 'Reinforcement Learning Part 1'), proof: 'watch', mandatory: false },
      { ...part(46, 'Reinforcement Learning Part 2'), proof: 'watch', mandatory: false },
      { ...part(47, 'Reinforcement Learning Part 3'), proof: 'watch', mandatory: false },
      { ...part(49, 'Deep Learning Part 7'), proof: 'implement' },
      { ...part(50, 'Deep Learning Part 8'), proof: 'implement' },
      { ...part(51, 'Text Summarizer — minor project', 180), proof: 'project' },
      { ...part(54, 'Deep Learning Part 9'), proof: 'implement' },
      { ...part(55, 'Deep Learning Part 10'), proof: 'implement' },
      { ...part(60, 'Deep Learning Part 11'), proof: 'implement' },
    ],
  },
  {
    id: 'ap-apps',
    tier: 1,
    name: 'OpenAI APIs, Flask & Agentic AI',
    source: 'Apna Prime · modules 56, 59, 61',
    track: 'ai',
    blurb: 'Where a model stops being a notebook and gets a URL. Reuses your Flask background directly.',
    milestones: [
      { ...part(56, 'OpenAI APIs', 120), proof: 'implement' },
      { ...part(59, 'Working with Flask', 120), proof: 'implement' },
      { ...part(61, 'Agentic AI', 150), proof: 'implement' },
    ],
  },
  {
    id: 'ap-projects',
    tier: 1,
    name: 'AI Projects Module',
    source: 'Apna Prime · AI Projects Module',
    track: 'project',
    blurb: 'Four two-phase builds. These are the most portfolio-ready work in the whole course — finish them properly.',
    milestones: [
      { id: 'ap-p1a', title: 'Intelligent AI Attendance — Face & Voice (Phase 1)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p1b', title: 'Intelligent AI Attendance (Phase 2)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p2a', title: 'Neural Style Transfer with AdaIN (Phase 1)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p2b', title: 'Neural Style Transfer with AdaIN (Phase 2)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p3a', title: 'Real-time AI Gym Trainer (Phase 1)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p3b', title: 'Real-time AI Gym Trainer (Phase 2)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p4a', title: 'AI Resume ATS System (Phase 1)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-p4b', title: 'AI Resume ATS System (Phase 2)', proof: 'project', mandatory: true, estMinutes: 150 },
      { id: 'ap-cicd', title: 'CI/CD — Complete Tutorial', proof: 'watch', mandatory: false, estMinutes: 120 },
      { id: 'ap-k8s', title: 'Kubernetes', proof: 'watch', mandatory: false, estMinutes: 120 },
    ],
  },
] as const;
