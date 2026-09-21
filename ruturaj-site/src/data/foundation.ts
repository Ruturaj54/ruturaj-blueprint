import type { FoundationSubject } from '@/engine/types';

/**
 * Phase 1 — the Foundation Gate. Six weeks, days 1–42.
 *
 * Built from the two real syllabi rather than a generic list:
 *   - Apna College "Prime: AI/ML Batch" (62 modules + AI Projects module)
 *   - Five Minute Engineering "Ultimate AI Mastery" bootcamp (40 modules)
 *
 * The two overlap heavily on Python, NumPy/Pandas, ML and DL. Doing both in
 * full would burn most of the runway twice, so Apna Prime is the spine — it is
 * structured, project-led, and already started — and 5ME is used only for the
 * AI-engineering depth Apna does not reach (LangChain, VectorDB, Transformers,
 * Agentic AI). Module numbers below map to Apna Prime so progress is easy to
 * find in the course player.
 *
 * Everything from the 5ME syllabus that serves a data-analyst rather than an
 * AI engineer — Power BI, Tableau, Looker, Excel, Streamlit, Snowflake,
 * Airflow, Kafka, dbt, Spark, Cassandra — is deliberately excluded. It is real
 * material, it is just not what a Feb-2027 AI Engineer loop asks about.
 */
export const FOUNDATION_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'f-python',
    name: 'Python',
    source: 'Apna Prime 4–9 · 5ME Python',
    track: 'backend',
    blurb:
      'You write Python professionally, so this is a speed-run for gaps, not a course. Both syllabi cover it — do it once, here.',
    milestones: [
      { id: 'f-python-1', title: 'Fundamentals Parts 1–3 — syntax, types, collections at speed', proof: 'watch', mandatory: true },
      { id: 'f-python-2', title: 'Fundamentals Parts 4–5 — OOP, modules, error handling', proof: 'watch', mandatory: true },
      { id: 'f-python-3', title: 'Comprehensions, generators, decorators, context managers from memory', proof: 'implement', mandatory: true },
      { id: 'f-python-4', title: 'Environment set up — venv, pip, project layout, pytest basics', proof: 'implement', mandatory: true },
      { id: 'f-python-5', title: 'Checkpoint: 10 idiomatic-Python questions answered cold', proof: 'checkpoint', mandatory: true },
      { id: 'f-python-6', title: 'asyncio — event loop, await, gather (needed for FastAPI later)', proof: 'notes', mandatory: false },
    ],
  },
  {
    id: 'f-data',
    name: 'Data Stack',
    source: 'Apna Prime 10–21',
    track: 'ai',
    blurb:
      'NumPy, Pandas, SQL and visualisation. The layer everything in ML sits on, and SQL is separately interview-critical.',
    milestones: [
      { id: 'f-data-1', title: 'NumPy (11) — arrays, broadcasting, vectorised thinking', proof: 'implement', mandatory: true },
      { id: 'f-data-2', title: 'Pandas Parts 1–2 (12–13) — real manipulation, not toy frames', proof: 'implement', mandatory: true },
      { id: 'f-data-3', title: 'SQL Parts 1–2 (15–16) — joins, aggregates, subqueries', proof: 'exercise', mandatory: true },
      { id: 'f-data-4', title: 'Data collection + web scraping (14, 17, 19)', proof: 'implement', mandatory: true },
      { id: 'f-data-5', title: 'Data visualisation Parts 1–2 (20–21)', proof: 'implement', mandatory: true },
      { id: 'f-data-6', title: 'Checkpoint: load a messy dataset, clean it, and defend every choice', proof: 'checkpoint', mandatory: true },
    ],
  },
  {
    id: 'f-math',
    name: 'Math for AI',
    source: 'Apna Prime 22–24 · 5ME Stats/LinAlg',
    track: 'ai',
    blurb:
      'Probability, linear algebra and calculus at the depth that makes transformers and backprop legible rather than magic.',
    milestones: [
      { id: 'f-math-1', title: 'Probability (22) — distributions, Bayes, expectation', proof: 'notes', mandatory: true },
      { id: 'f-math-2', title: 'Linear algebra (23) — vectors, matrices, dot products, eigen intuition', proof: 'notes', mandatory: true },
      { id: 'f-math-3', title: 'Calculus (24) — derivatives, chain rule, gradients', proof: 'notes', mandatory: true },
      { id: 'f-math-4', title: 'Checkpoint: explain a gradient descent step in your own words', proof: 'checkpoint', mandatory: true },
    ],
  },
  {
    id: 'f-ml',
    name: 'Machine Learning',
    source: 'Apna Prime 25–36',
    track: 'ai',
    blurb:
      'Supervised through unsupervised, including the two minor projects. Evaluation matters more than algorithm count.',
    milestones: [
      { id: 'f-ml-1', title: 'Starting with ML (25) + Supervised Parts 1–3 (26–28)', proof: 'watch', mandatory: true },
      { id: 'f-ml-2', title: 'Scratch implementations (29) — write the algorithms yourself', proof: 'implement', mandatory: true },
      { id: 'f-ml-3', title: 'CreditWise Loan System (30) — minor project shipped', proof: 'project', mandatory: true },
      { id: 'f-ml-4', title: 'Supervised Parts 4–6 (31–33)', proof: 'watch', mandatory: true },
      { id: 'f-ml-5', title: 'Evaluation — precision/recall/F1, ROC-AUC, and when each misleads', proof: 'notes', mandatory: true },
      { id: 'f-ml-6', title: 'Bias/variance, overfitting, regularisation, cross-validation', proof: 'notes', mandatory: true },
      { id: 'f-ml-7', title: 'Unsupervised Parts 1–2 (34–35) + SmartCart Clustering (36)', proof: 'project', mandatory: true },
    ],
  },
  {
    id: 'f-dl',
    name: 'Deep Learning',
    source: 'Apna Prime 39–55',
    track: 'ai',
    blurb:
      'Eleven parts in the course. The bar is a network written from scratch — importing Keras is not understanding.',
    milestones: [
      { id: 'f-dl-1', title: 'Parts 1–3 (39–41) — perceptron, activation, forward pass', proof: 'watch', mandatory: true },
      { id: 'f-dl-2', title: 'Backpropagation derived and implemented in NumPy', proof: 'implement', mandatory: true },
      { id: 'f-dl-3', title: 'Parts 4–6 (42–44) — optimisers, regularisation, tuning', proof: 'watch', mandatory: true },
      { id: 'f-dl-4', title: 'Parts 7–8 (49–50) — CNN architecture', proof: 'notes', mandatory: true },
      { id: 'f-dl-5', title: 'Text Summarizer (51) — minor project shipped', proof: 'project', mandatory: true },
      { id: 'f-dl-6', title: 'Parts 9–11 (54–55, 60) — sequence models and TensorFlow', proof: 'implement', mandatory: true },
      { id: 'f-dl-7', title: 'Reinforcement learning Parts 1–3 (45–47)', proof: 'watch', mandatory: false },
    ],
  },
  {
    id: 'f-genai',
    name: 'LLMs, RAG & Agents',
    source: 'Apna Prime 56, 59, 61 · 5ME LangChain/VectorDB/Transformers',
    track: 'ai',
    blurb:
      'The part that actually maps to the job title. You already have RAG exposure — the gate here is measuring retrieval quality, not building another demo.',
    milestones: [
      { id: 'f-genai-1', title: 'Transformer architecture — attention explained in your own words', proof: 'notes', mandatory: true },
      { id: 'f-genai-2', title: 'Tokens, embeddings, context windows, inference cost', proof: 'notes', mandatory: true },
      { id: 'f-genai-3', title: 'OpenAI APIs (56) — structured outputs and tool calling working', proof: 'implement', mandatory: true },
      { id: 'f-genai-4', title: 'Vector DB + retrieval pipeline running locally', proof: 'implement', mandatory: true },
      { id: 'f-genai-5', title: 'Retrieval evaluation — measured hit-rate on a real question set', proof: 'exercise', mandatory: true },
      { id: 'f-genai-6', title: 'Working with Flask (59) — serve the model behind an API', proof: 'implement', mandatory: true },
      { id: 'f-genai-7', title: 'Agentic AI (61) — an agent loop you wrote, not a framework demo', proof: 'project', mandatory: true },
      { id: 'f-genai-8', title: 'LangChain — enough to read it, not to depend on it', proof: 'notes', mandatory: false },
    ],
  },
  {
    id: 'f-ppa',
    name: 'PPA · C · C++',
    source: 'PPA notes + revision',
    track: 'systems',
    blurb:
      'Revision pace, not learning pace. You use C professionally; C++ is your fastest DSA language. Target interview-grade recall.',
    milestones: [
      { id: 'f-ppa-1', title: 'PPA — problem-solving patterns and logic drills revised', proof: 'exercise', mandatory: true },
      { id: 'f-ppa-2', title: 'C — pointers, memory, structs, function pointers recalled cold', proof: 'exercise', mandatory: true },
      { id: 'f-ppa-3', title: 'C — five classic programs from scratch, no reference', proof: 'exercise', mandatory: true },
      { id: 'f-ppa-4', title: 'C++ — OOP, virtual functions, vtables', proof: 'notes', mandatory: true },
      { id: 'f-ppa-5', title: 'C++ — STL fluency: vector, map, set, priority_queue', proof: 'exercise', mandatory: true },
      { id: 'f-ppa-6', title: 'C++ — smart pointers, RAII, move semantics', proof: 'notes', mandatory: false },
    ],
  },
  {
    id: 'f-lsp',
    name: 'Linux System Programming',
    source: 'LSP notes',
    track: 'systems',
    blurb:
      'Direct leverage on your telecom work and the differentiator most AI candidates simply do not have.',
    milestones: [
      { id: 'f-lsp-1', title: 'Processes — fork/exec/wait, lifecycle', proof: 'implement', mandatory: true },
      { id: 'f-lsp-2', title: 'File descriptors, I/O, pipes, redirection', proof: 'implement', mandatory: true },
      { id: 'f-lsp-3', title: 'Threads and synchronisation — mutex, condition variables, races', proof: 'implement', mandatory: true },
      { id: 'f-lsp-4', title: 'IPC — shared memory, message queues, semaphores', proof: 'notes', mandatory: true },
      { id: 'f-lsp-5', title: 'Sockets — a working TCP client and server', proof: 'project', mandatory: true },
    ],
  },
  {
    id: 'f-dsa',
    name: 'DSA Basics',
    source: 'LB notes · NeetCode',
    track: 'dsa',
    blurb:
      'The single highest-weight item for Amazon, Google and Microsoft. Starts on day 1 and never pauses for the whole 161 days.',
    milestones: [
      { id: 'f-dsa-1', title: 'LB — logic-building drills cleared', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-2', title: 'Big-O and space complexity fluent, including recursion stacks', proof: 'notes', mandatory: true },
      { id: 'f-dsa-3', title: 'Arrays, strings, hashing — pattern recognised, not memorised', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-4', title: 'Two pointers and sliding window', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-5', title: 'Binary search, including binary-search-on-the-answer', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-6', title: 'Stack, queue, linked list implemented from scratch', proof: 'implement', mandatory: true },
      { id: 'f-dsa-7', title: 'Recursion and backtracking basics', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-8', title: '75 problems logged with pattern tags and solve times', proof: 'checkpoint', mandatory: true },
    ],
  },
  {
    id: 'f-tools',
    name: 'Terminal & Git',
    source: 'Apna Prime 37–38',
    track: 'devops',
    blurb:
      'Quick wins you mostly have already. Close them early so the daily commit habit is running from week one.',
    milestones: [
      { id: 'f-tools-1', title: 'Terminal (37) — confirm nothing is missing', proof: 'watch', mandatory: true },
      { id: 'f-tools-2', title: 'Git & GitHub (38) — branches, rebase vs merge, clean history', proof: 'implement', mandatory: true },
      { id: 'f-tools-3', title: 'GitHub profile and READMEs presentable to a recruiter', proof: 'project', mandatory: true },
    ],
  },
] as const;

export const MANDATORY_MILESTONE_COUNT = FOUNDATION_SUBJECTS.reduce(
  (sum, s) => sum + s.milestones.filter((m) => m.mandatory).length,
  0,
);

export const TOTAL_MILESTONE_COUNT = FOUNDATION_SUBJECTS.reduce(
  (sum, s) => sum + s.milestones.length,
  0,
);

export function subjectById(id: string): FoundationSubject | undefined {
  return FOUNDATION_SUBJECTS.find((s) => s.id === id);
}
