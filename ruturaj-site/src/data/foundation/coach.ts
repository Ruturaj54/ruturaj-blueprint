import type { Coach } from '@/engine/types';

/**
 * "Ruturaj, do this — it will help you." One coaching card per subject.
 *
 * Each card keeps the recommendation (doThis, harder) apart from the evidence
 * (why), per the content rules in CLAUDE.md, and says what counts as proof —
 * the artefact he keeps, so "done" means something a recruiter can see.
 *
 * Course order is the frame: Course 1 is Apna College, Course 2 is Five Minute
 * Engineering, and the practice tier runs after both.
 */
export const COACH: Record<string, Coach> = {
  /* ---- Course 1 — Apna College Prime AI/ML ---- */
  'ap-python': {
    doThis: 'Run these parts at 1.5x and type every example into one notebook per part. Push it to a public apna-ai-ml repo the same night.',
    why: 'You already write Python at work, so the lectures alone add little. What they can add is speed — and a public commit trail is proof a recruiter can actually open.',
    harder: 'After each part, solve two small problems in Python from memory: comprehensions, generators, *args/**kwargs, a decorator.',
    proof: 'Notebook committed · two problems solved without looking anything up',
  },
  'ap-data': {
    doThis: 'Pick one public dataset (Kaggle is fine — never company data) and use it in every module instead of the toy examples.',
    why: 'SQL and Pandas come up in most AI-engineer screens, and GROUP BY, joins and window functions are where candidates stall.',
    harder: 'For every Pandas operation, write the SQL that does the same thing. Close SQL Part 2 with ten LeetCode SQL 50 problems.',
    proof: 'One notebook analysing one dataset end to end · ten SQL problems logged',
  },
  'ap-math': {
    doThis: 'One page of notes per module: the formula, and one line on where it shows up in ML. Nothing more.',
    why: 'Interviews ask you to explain gradient descent, softmax and dot-product attention in words, not to derive proofs. Intuition is the bar.',
    harder: 'Implement gradient descent for linear regression in plain NumPy — no sklearn — and plot the loss going down.',
    proof: 'Three one-page sheets · a NumPy gradient-descent notebook',
  },
  'ap-ml': {
    doThis: 'For every algorithm, fit it with sklearn, then write the short version yourself — module 29 shows how. Treat CreditWise and SmartCart as portfolio projects, not exercises.',
    why: 'Bias–variance, overfitting and precision-versus-recall are standard ML-round questions, and the two minor projects are your first AI lines on a resume.',
    harder: 'Give each minor project a README: problem, data, metric, result, what you would do next. Serve one behind a FastAPI endpoint.',
    proof: 'Two project repos with READMEs · one model behind an endpoint',
  },
  'ap-tools': {
    doThis: 'Clear this in one sitting — you use Git every day. Put the saved time into the next ML module.',
    why: 'This is review for you. The only gaps worth closing are rebase, cherry-pick and resolving conflicts without fear.',
    harder: 'Write a GitHub profile README that links your course repos. It is the first thing a recruiter clicks.',
    proof: 'Profile README live',
  },
  'ap-dl': {
    doThis: 'Write the training loop yourself every time — forward, loss, backward, step. Never run the course cell as-is.',
    why: 'This is the largest block of Course 1 and the base for transformers in Course 2. Interview depth here is backprop, overfitting and choosing an architecture.',
    harder: 'For the Text Summarizer, compare two approaches and report ROUGE for both. A number you measured beats an adjective.',
    proof: 'Your own training-loop notebook · Text Summarizer repo with a metric',
  },
  'ap-apps': {
    doThis: 'Build every example as an API, not a notebook. Start from your Flask background, then rewrite one in FastAPI.',
    why: 'AI-engineer roles hire for shipping LLM features behind an API — structured output, retries, cost and latency. This is the most job-shaped module in Course 1.',
    harder: 'Log token count and latency for every call, and add a retry with backoff. Mention both in the README.',
    proof: 'One deployed LLM endpoint with a README',
  },
  'ap-projects': {
    doThis: 'Finish all four, then polish one — the AI Resume ATS — into your flagship: deployed, README with screenshots, a two-minute demo video.',
    why: 'One shipped project you can explain carries more weight in an interview than a list of courses, and the ATS project is the closest to AI-engineer work.',
    harder: 'Write a five-minute explanation for each: problem, design, tradeoffs, what broke, what you would change. Say it out loud once.',
    proof: 'Four repos · one deployed flagship · a written walkthrough for each',
  },

  /* ---- Course 2 — Five Minute Engineering ---- */
  'fm-nlp': {
    doThis: 'Implement tokenisation, TF-IDF and cosine similarity by hand once, then switch to the libraries.',
    why: 'Similarity search is the base of every RAG system later in this course. Doing it by hand once makes the libraries legible.',
    harder: 'Build a tiny search over your own notes with TF-IDF, then swap in embeddings and compare results on the same ten queries.',
    proof: 'A notebook comparing TF-IDF and embedding search side by side',
  },
  'fm-transformers': {
    doThis: 'Read the actual paper alongside the videos, and build the Nano LLM yourself — every line typed.',
    why: '"Explain self-attention" and "why multi-head" are among the most common AI-engineer theory questions. Having built it is what makes the answer fluent.',
    harder: 'Draw Q/K/V attention on paper from memory, then explain it out loud in two minutes.',
    proof: 'A Nano LLM repo that trains and generates · a one-page attention sheet',
  },
  'fm-prompt': {
    doThis: 'Keep every prompt in a versioned file next to the input and the output it produced.',
    why: 'Prompting is judged as engineering now — reproducible, evaluated, versioned. That is the gap between a demo and a product.',
    harder: 'Write a ten-case evaluation set for one prompt and score two versions of it.',
    proof: 'A prompts folder with versions · an eval score comparing two of them',
  },
  'fm-rag': {
    doThis: 'Build RAG over a real document set — the public 3GPP specs from your own domain are ideal — and measure retrieval, not just answers.',
    why: 'RAG is a staple of AI system-design rounds, and interviewers push on chunking, retrieval quality and hallucination — exactly where demos stay vague.',
    harder: 'Try three chunk sizes and report recall@5 for each. Add a reranker and show the difference.',
    proof: 'A RAG repo with a results table · faithfulness checked on 20 questions',
  },
  'fm-langchain': {
    doThis: 'Build one small pipeline twice — once with LangChain, once with direct API calls — and note what each costs you.',
    why: 'Teams want someone who can use a framework and also knows when not to. Having done both is the honest answer.',
    harder: 'Write LCEL chains with structured output and a fallback when parsing fails.',
    proof: 'Two implementations of one pipeline · a short comparison in the README',
  },
  'fm-agents': {
    doThis: 'Build one agent that does real work: read a log file, find the errors, write a summary. Tools first, then memory, then multiple agents.',
    why: 'Agents and MCP are where AI-engineer work is moving. A working agent with clear tool boundaries is a strong portfolio piece — and log triage is your daily job.',
    harder: 'Add guardrails — a step limit, tool-input validation, a cost cap — and log every tool call.',
    proof: 'An agent repo with a demo run and its tool-call log',
  },

  /* ---- Practice — after both courses ---- */
  'cs-c': {
    doThis: 'Write every program from a blank file, compile with -Wall -Wextra, and run it under valgrind.',
    why: 'C is your working language at Parallel Wireless, and pointer and memory questions are where systems interviews start.',
    harder: 'Implement your own strlen, memcpy and a dynamic array that grows.',
    proof: 'Programs in a repo · valgrind clean',
  },
  'cs-cpp': {
    doThis: 'Move your DSA solutions to C++ and the STL now — that is where fluency comes from.',
    why: 'STL fluency saves minutes in every timed round, and the rule of three/five and virtual dispatch are standard C++ questions.',
    harder: 'Implement a minimal unique_ptr and a vector with move semantics.',
    proof: 'An STL cheat sheet written from memory · both implementations',
  },
  'cs-lb': {
    doThis: 'Three to five problems a day, smallest first. Write the approach in one line before you write code.',
    why: 'Logic building is the reflex DSA rounds test: turning a problem into steps, fast.',
    harder: 'Time every problem. Anything over 20 minutes goes on the Sunday re-solve list.',
    proof: 'Problems logged with time and pattern',
  },
  'cs-dsa': {
    doThis: 'Log every problem in the DSA tab with its pattern, and re-solve one older problem cold each week.',
    why: 'DSA is the highest-weight item in SDE loops at Amazon, Google and Microsoft, and recognising the pattern transfers further than raw problem count.',
    harder: 'Explain each solution out loud as if to an interviewer: brute force, then optimised, then complexity.',
    proof: 'Every pattern with at least three clean solves',
  },
  'cs-lsp': {
    doThis: 'Write each system-call program yourself and trace it with strace.',
    why: 'You work on telecom systems. Processes, threads, IPC and sockets set you apart from AI candidates who only know Python.',
    harder: 'Build a multi-threaded TCP server that handles concurrent clients and shuts down cleanly.',
    proof: 'A TCP server repo · strace notes',
  },
};

export function coachFor(subjectId: string): Coach | undefined {
  return COACH[subjectId];
}
