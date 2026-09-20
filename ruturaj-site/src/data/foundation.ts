import type { FoundationSubject } from '@/engine/types';

/**
 * Month 1 — the Foundation Gate.
 *
 * These are courses already in flight, not a beginner syllabus. Ruturaj has
 * ~2 years of professional Python/Django/C/C++/Jenkins/telecom work, so the
 * milestones are weighted toward implementation and recall rather than
 * watching. A subject only reaches `verified` when something was built or
 * recalled cold — never because a video progress bar moved.
 *
 * `mandatory: false` milestones are real work but do not block the gate; they
 * are the first thing dropped in a bad week.
 */
export const FOUNDATION_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'f-python',
    name: 'Python',
    source: 'Apna College',
    track: 'backend',
    blurb:
      'You write Python professionally. This closes the gaps that show up in interviews: internals, idioms and the standard library you never had to reach for at work.',
    milestones: [
      { id: 'f-python-1', title: 'Core syntax and data structures reviewed at speed', proof: 'watch', mandatory: true },
      { id: 'f-python-2', title: 'Comprehensions, generators, decorators, context managers — written from memory', proof: 'implement', mandatory: true },
      { id: 'f-python-3', title: 'OOP: dunder methods, properties, dataclasses, MRO', proof: 'notes', mandatory: true },
      { id: 'f-python-4', title: 'Typing, virtualenv/poetry, project layout, pytest basics', proof: 'implement', mandatory: true },
      { id: 'f-python-5', title: 'Closing checkpoint: 10 idiomatic-Python questions answered cold', proof: 'checkpoint', mandatory: true },
      { id: 'f-python-6', title: 'asyncio and concurrency model — event loop, await, gather', proof: 'notes', mandatory: false },
    ],
  },
  {
    id: 'f-mldl',
    name: 'ML / Deep Learning',
    source: 'Apna College',
    track: 'ai',
    blurb:
      'The mathematical and practical base under everything in the AI track. Without this, LLM work stays shallow and an interviewer finds the floor in two questions.',
    milestones: [
      { id: 'f-mldl-1', title: 'NumPy and Pandas — real data manipulation, not toy examples', proof: 'implement', mandatory: true },
      { id: 'f-mldl-2', title: 'Supervised learning: regression, classification, train/test discipline', proof: 'watch', mandatory: true },
      { id: 'f-mldl-3', title: 'Model evaluation: precision/recall/F1, ROC-AUC — and when each misleads', proof: 'notes', mandatory: true },
      { id: 'f-mldl-4', title: 'Overfitting, regularisation, cross-validation, feature engineering', proof: 'notes', mandatory: true },
      { id: 'f-mldl-5', title: 'Neural network from scratch — forward and backward pass in NumPy', proof: 'implement', mandatory: true },
      { id: 'f-mldl-6', title: 'End-to-end mini project: data to model to evaluation to written conclusion', proof: 'project', mandatory: true },
      { id: 'f-mldl-7', title: 'Unsupervised: clustering and dimensionality reduction', proof: 'watch', mandatory: false },
    ],
  },
  {
    id: 'f-5me',
    name: 'AI / ML Engineering',
    source: 'Five Minute Engineering',
    track: 'ai',
    blurb:
      'The applied-AI layer: how LLM systems are actually assembled in production, which is the job being targeted.',
    milestones: [
      { id: 'f-5me-1', title: 'LLM fundamentals: tokens, embeddings, context windows, inference cost', proof: 'notes', mandatory: true },
      { id: 'f-5me-2', title: 'Transformer architecture — attention explained in your own words', proof: 'notes', mandatory: true },
      { id: 'f-5me-3', title: 'Prompt engineering and structured outputs', proof: 'implement', mandatory: true },
      { id: 'f-5me-4', title: 'Function and tool calling — working implementation', proof: 'implement', mandatory: true },
      { id: 'f-5me-5', title: 'Checkpoint: explain an LLM request end to end, token in to token out', proof: 'checkpoint', mandatory: true },
    ],
  },
  {
    id: 'f-rag',
    name: 'RAG',
    source: 'Five Minute Engineering + own build',
    track: 'ai',
    blurb:
      'You already have RAG exposure. The gate is not building a RAG demo — it is measuring retrieval quality, which is what separates an AI engineer from a tutorial follower.',
    milestones: [
      { id: 'f-rag-1', title: 'Ingestion and chunking strategies — and why chunk size changes answers', proof: 'notes', mandatory: true },
      { id: 'f-rag-2', title: 'Embeddings and a vector store working locally', proof: 'implement', mandatory: true },
      { id: 'f-rag-3', title: 'Retrieval pipeline with a reranking step', proof: 'implement', mandatory: true },
      { id: 'f-rag-4', title: 'Retrieval evaluation — measured hit-rate and MRR on a real question set', proof: 'exercise', mandatory: true },
      { id: 'f-rag-5', title: 'Working RAG service behind a FastAPI endpoint', proof: 'project', mandatory: true },
      { id: 'f-rag-6', title: 'Hallucination reduction: grounding, citations, refusal behaviour', proof: 'notes', mandatory: false },
    ],
  },
  {
    id: 'f-lsp',
    name: 'Linux System Programming',
    source: 'LSP course',
    track: 'systems',
    blurb:
      'Direct leverage on your telecom systems work and on any systems-flavoured interview. This is the differentiator most AI candidates do not have.',
    milestones: [
      { id: 'f-lsp-1', title: 'Processes, fork/exec/wait, process lifecycle', proof: 'implement', mandatory: true },
      { id: 'f-lsp-2', title: 'File descriptors, I/O, pipes, redirection', proof: 'implement', mandatory: true },
      { id: 'f-lsp-3', title: 'Threads and synchronisation: mutex, condition variables, race conditions', proof: 'implement', mandatory: true },
      { id: 'f-lsp-4', title: 'IPC: shared memory, message queues, semaphores', proof: 'notes', mandatory: true },
      { id: 'f-lsp-5', title: 'Sockets — a working TCP client and server', proof: 'project', mandatory: true },
      { id: 'f-lsp-6', title: 'Signals and the memory layout of a running process', proof: 'notes', mandatory: false },
    ],
  },
  {
    id: 'f-c',
    name: 'C',
    source: 'Revision',
    track: 'systems',
    blurb:
      'Revision pace, not learning pace. You use C professionally — this is about interview-grade recall of pointers and memory.',
    milestones: [
      { id: 'f-c-1', title: 'Pointers, pointer arithmetic, arrays vs pointers — recalled cold', proof: 'exercise', mandatory: true },
      { id: 'f-c-2', title: 'Memory: stack vs heap, malloc and free, leaks and dangling pointers', proof: 'notes', mandatory: true },
      { id: 'f-c-3', title: 'Structs, unions, function pointers', proof: 'implement', mandatory: true },
      { id: 'f-c-4', title: 'Five classic C programs written from scratch, no reference', proof: 'exercise', mandatory: true },
    ],
  },
  {
    id: 'f-cpp',
    name: 'C++',
    source: 'Revision',
    track: 'systems',
    blurb:
      'Your fastest DSA language and a credible systems signal. Revision pace — target STL fluency and modern idioms.',
    milestones: [
      { id: 'f-cpp-1', title: 'OOP: inheritance, virtual functions, vtables', proof: 'notes', mandatory: true },
      { id: 'f-cpp-2', title: 'STL fluency: vector, map, set, queue, priority_queue', proof: 'exercise', mandatory: true },
      { id: 'f-cpp-3', title: 'Smart pointers, RAII, move semantics', proof: 'notes', mandatory: true },
      { id: 'f-cpp-4', title: 'Ten LeetCode problems solved in C++ using the STL', proof: 'exercise', mandatory: true },
    ],
  },
  {
    id: 'f-dsa',
    name: 'DSA Basics',
    source: 'NeetCode / Striver',
    track: 'dsa',
    blurb:
      'The single highest-weight item for Amazon, Google and Microsoft. Month 1 establishes the daily habit and the base patterns; Months 2 to 4 build depth on top.',
    milestones: [
      { id: 'f-dsa-1', title: 'Big-O and space complexity — fluent, including recursion stacks', proof: 'notes', mandatory: true },
      { id: 'f-dsa-2', title: 'Arrays, strings, hashing — pattern recognised, not memorised', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-3', title: 'Two pointers and sliding window', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-4', title: 'Binary search, including binary-search-on-the-answer', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-5', title: 'Stack, queue, linked list — implemented from scratch', proof: 'implement', mandatory: true },
      { id: 'f-dsa-6', title: 'Recursion and backtracking basics', proof: 'exercise', mandatory: true },
      { id: 'f-dsa-7', title: '50 problems logged with pattern tags and solve times', proof: 'checkpoint', mandatory: true },
      { id: 'f-dsa-8', title: 'Daily solve streak unbroken for 14 days', proof: 'checkpoint', mandatory: false },
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
