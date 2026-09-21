import type { FoundationSubject } from '@/engine/types';

/**
 * The non-course half of the foundation: PPA/C/C++, LSP, DSA and tooling.
 *
 * All of this is revision, not first exposure — Ruturaj writes C professionally
 * and works on 4G/5G systems daily. Budgets reflect recall speed rather than
 * learning speed.
 *
 * NOTE: the PPA, LSP and LB source PDFs have not been supplied yet, so these
 * milestones are built from the standard scope of each. Once the real notes
 * arrive, align the titles and minute budgets to them.
 */
export const CORE_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'f-ppa',
    tier: 3,
    name: 'PPA · C · C++',
    source: 'PPA notes + revision',
    track: 'systems',
    blurb:
      'Revision pace. C is your working language and C++ is your fastest DSA language — target interview-grade recall, not coverage.',
    milestones: [
      { id: 'f-ppa-1', title: 'PPA — problem-solving patterns and logic drills revised', proof: 'exercise', mandatory: true, estMinutes: 180 },
      { id: 'f-ppa-2', title: 'C — pointers, memory, arrays vs pointers recalled cold', proof: 'exercise', mandatory: true, estMinutes: 120 },
      { id: 'f-ppa-3', title: 'C — structs, unions, function pointers, file I/O', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'f-ppa-4', title: 'C — five classic programs from scratch, no reference', proof: 'exercise', mandatory: true, estMinutes: 150 },
      { id: 'f-ppa-5', title: 'C++ — OOP, virtual functions, vtables', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-ppa-6', title: 'C++ — STL fluency: vector, map, set, priority_queue', proof: 'exercise', mandatory: true, estMinutes: 150 },
      { id: 'f-ppa-7', title: 'C++ — smart pointers, RAII, move semantics', proof: 'notes', mandatory: false, estMinutes: 120 },
    ],
  },
  {
    id: 'f-lsp',
    tier: 3,
    name: 'Linux System Programming',
    source: 'LSP notes',
    track: 'systems',
    blurb:
      'Direct leverage on your telecom work, and the differentiator almost no AI candidate has. Overlaps the OS topics in phase 2 — do them close together.',
    milestones: [
      { id: 'f-lsp-1', title: 'Processes — fork/exec/wait, process lifecycle', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'f-lsp-2', title: 'File descriptors, I/O, pipes, redirection', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'f-lsp-3', title: 'Threads and synchronisation — mutex, condition variables, races', proof: 'implement', mandatory: true, estMinutes: 180 },
      { id: 'f-lsp-4', title: 'IPC — shared memory, message queues, semaphores', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-lsp-5', title: 'Sockets — a working TCP client and server', proof: 'project', mandatory: true, estMinutes: 180 },
      { id: 'f-lsp-6', title: 'Signals and the memory layout of a running process', proof: 'notes', mandatory: false, estMinutes: 90 },
    ],
  },
  {
    id: 'f-dsa',
    tier: 3,
    name: 'DSA Basics',
    source: 'LB notes · NeetCode',
    track: 'dsa',
    blurb:
      'The highest-weight item for Amazon, Google and Microsoft. Starts on day 1 and never pauses — this runs alongside everything else for all 161 days.',
    milestones: [
      { id: 'f-dsa-1', title: 'LB — logic-building drills cleared', proof: 'exercise', mandatory: true, estMinutes: 240 },
      { id: 'f-dsa-2', title: 'Big-O and space complexity fluent, including recursion stacks', proof: 'notes', mandatory: true, estMinutes: 90 },
      { id: 'f-dsa-3', title: 'Arrays, strings, hashing — pattern recognised, not memorised', proof: 'exercise', mandatory: true, estMinutes: 300 },
      { id: 'f-dsa-4', title: 'Two pointers and sliding window', proof: 'exercise', mandatory: true, estMinutes: 240 },
      { id: 'f-dsa-5', title: 'Binary search, including binary-search-on-the-answer', proof: 'exercise', mandatory: true, estMinutes: 240 },
      { id: 'f-dsa-6', title: 'Stack, queue, linked list implemented from scratch', proof: 'implement', mandatory: true, estMinutes: 240 },
      { id: 'f-dsa-7', title: 'Recursion and backtracking basics', proof: 'exercise', mandatory: true, estMinutes: 240 },
      { id: 'f-dsa-8', title: '75 problems logged with pattern tags and solve times', proof: 'checkpoint', mandatory: true, estMinutes: 120 },
    ],
  },
  {
    id: 'f-tools',
    tier: 1,
    name: 'Terminal & Git',
    source: 'Apna Prime 37–38',
    track: 'devops',
    blurb:
      'Two short parts you mostly have already. Clear them in week one so the daily commit habit is running from the start.',
    milestones: [
      { id: 'f-tools-1', title: 'Terminal (37) — confirm nothing is missing', proof: 'watch', mandatory: true, estMinutes: 60 },
      { id: 'f-tools-2', title: 'Git & GitHub (38) — branches, rebase vs merge, clean history', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'f-tools-3', title: 'GitHub profile and READMEs presentable to a recruiter', proof: 'project', mandatory: true, estMinutes: 120 },
    ],
  },
] as const;
