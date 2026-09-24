import type { FoundationSubject } from '@/engine/types';

/**
 * Tier 3 — Ruturaj's own practice: PPA (C and C++), LB, DSA basics and LSP.
 *
 * PPA and LB come from his original Base tracker in the previous version of
 * this app — the five LB levels and their problem targets are his, not
 * invented here. DSA basics is his LB Level 5. Java was part of that PPA track
 * but now lives after the gate, capped at interview depth.
 *
 * The PPA, LB and LSP source PDFs have not been supplied yet; once they arrive,
 * align titles and budgets to them. Unlike tiers 1 and 2 this tier is not a
 * sequential course, so the planner mixes its subjects rather than finishing
 * one before starting the next.
 */
export const CORE_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'cs-c',
    tier: 3,
    name: 'PPA — C',
    source: 'PPA course revision',
    track: 'systems',
    blurb: 'Your working language. Revision pace — interview-grade recall of pointers and memory.',
    milestones: [
      { id: 'c-1', title: 'Pointers, memory (stack vs heap), malloc/free', proof: 'exercise', mandatory: true, estMinutes: 120 },
      { id: 'c-2', title: 'Arrays, strings, structs', proof: 'exercise', mandatory: true, estMinutes: 90 },
      { id: 'c-3', title: 'File I/O, function pointers, recursion', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'c-4', title: 'Five programs from scratch — reverse string, linked list, sort', proof: 'exercise', mandatory: true, estMinutes: 150 },
    ],
  },
  {
    id: 'cs-cpp',
    tier: 3,
    name: 'PPA — C++',
    source: 'PPA course revision',
    track: 'systems',
    blurb: 'Your fastest DSA language. Target STL fluency and modern idioms.',
    milestones: [
      { id: 'cpp-1', title: 'Classes, objects, constructors, destructors, copy semantics', proof: 'notes', mandatory: true, estMinutes: 90 },
      { id: 'cpp-2', title: 'Inheritance, polymorphism, virtual functions, abstract classes', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'cpp-3', title: 'STL — vector, map, set, queue, stack, priority_queue', proof: 'exercise', mandatory: true, estMinutes: 120 },
      { id: 'cpp-4', title: 'Smart pointers and move semantics (unique_ptr, shared_ptr)', proof: 'notes', mandatory: true, estMinutes: 90 },
    ],
  },
  {
    id: 'cs-lb',
    tier: 3,
    name: 'Logic Building (LB)',
    source: 'LB problem set',
    track: 'dsa',
    blurb: 'Smaller to bigger problems. Three to five a day builds the problem-solving reflex.',
    milestones: [
      { id: 'lb-1', title: 'Level 1 — patterns, factorial/Fibonacci/GCD, prime, palindrome, digits (15 problems)', proof: 'exercise', mandatory: true, estMinutes: 180 },
      { id: 'lb-2', title: 'Level 2 — arrays: rotate, sorting, two-pointer, sliding window (20 problems)', proof: 'exercise', mandatory: true, estMinutes: 240 },
      { id: 'lb-3', title: 'Level 3 — strings: anagram, palindrome, prefix, roman, parentheses (15 problems)', proof: 'exercise', mandatory: true, estMinutes: 180 },
      { id: 'lb-4', title: 'Level 4 — recursion: power, Hanoi, subsets, permutations, merge/quick sort (15 problems)', proof: 'exercise', mandatory: true, estMinutes: 240 },
    ],
  },
  {
    id: 'cs-dsa',
    tier: 3,
    name: 'DSA Basics',
    source: 'LB Level 5 — DS problems',
    track: 'dsa',
    blurb: 'The highest-weight item for Amazon, Google and Microsoft. The daily DSA block keeps running alongside all of this.',
    milestones: [
      { id: 'dsa-1', title: 'Linked list — reverse, detect cycle', proof: 'exercise', mandatory: true, estMinutes: 120 },
      { id: 'dsa-2', title: 'Stack using array, queue using stack', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'dsa-3', title: 'Binary tree — BFS, DFS, height', proof: 'exercise', mandatory: true, estMinutes: 120 },
      { id: 'dsa-4', title: 'HashMap problems — two-sum, anagram groups', proof: 'exercise', mandatory: true, estMinutes: 90 },
      { id: 'dsa-5', title: 'Basic DP — Fibonacci table, climbing stairs', proof: 'exercise', mandatory: true, estMinutes: 90 },
    ],
  },
  {
    id: 'cs-lsp',
    tier: 3,
    name: 'Linux System Programming',
    source: 'LSP course',
    track: 'systems',
    blurb: 'Direct leverage on your telecom work, and a differentiator almost no AI candidate has.',
    milestones: [
      { id: 'lsp-1', title: 'Processes — fork/exec/wait, process lifecycle', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'lsp-2', title: 'File descriptors, I/O, pipes, redirection', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'lsp-3', title: 'Threads and synchronisation — mutex, condition variables, races', proof: 'implement', mandatory: true, estMinutes: 180 },
      { id: 'lsp-4', title: 'IPC — shared memory, message queues, semaphores', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'lsp-5', title: 'Sockets — a working TCP client and server', proof: 'project', mandatory: true, estMinutes: 180 },
      { id: 'lsp-6', title: 'Signals and the memory layout of a running process', proof: 'notes', mandatory: false, estMinutes: 90 },
    ],
  },
] as const;
