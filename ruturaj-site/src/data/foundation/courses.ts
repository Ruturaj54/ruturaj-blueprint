import type { FoundationSubject } from '@/engine/types';

/**
 * The two AI course syllabi.
 *
 * Time budgets assume each Apna Prime module part runs 60–120 minutes, so a
 * milestone covering three parts is budgeted at three parts. 5ME modules are
 * budgeted from their own sub-topic depth — LangChain and Agentic AI are large
 * modules, Prompt Engineering is not.
 *
 * Division of labour between the two courses:
 *   Apna Prime  — the spine. Python through Deep Learning, project-led.
 *   5ME bootcamp — the AI-engineering layer Apna never reaches: LangChain,
 *                  VectorDB, transformer internals, prompt engineering, agents.
 *
 * Both cover Python/NumPy/Pandas/ML/DL. That overlap is claimed once, by Apna.
 * 5ME's MLOps, LLMOps, fine-tuning and System-Design-for-AI modules are real
 * but belong after the gate — they live in the AI track for phases 2 and 3.
 */
export const COURSE_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'f-python',
    tier: 1,
    name: 'Python',
    source: 'Apna Prime 4–9',
    track: 'backend',
    blurb:
      'Six course parts. You write Python professionally, so run the videos fast and spend the time on the gaps instead.',
    milestones: [
      { id: 'f-python-1', title: 'Fundamentals Parts 1–2 (4–5) — syntax, types, operators', proof: 'watch', mandatory: true, estMinutes: 150 },
      { id: 'f-python-2', title: 'Fundamentals Parts 3–4 (6–7) — collections, functions, modules', proof: 'watch', mandatory: true, estMinutes: 150 },
      { id: 'f-python-3', title: 'Fundamentals Part 5 (8) + Installation (9)', proof: 'watch', mandatory: true, estMinutes: 90 },
      { id: 'f-python-4', title: 'Comprehensions, generators, decorators, context managers from memory', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'f-python-5', title: 'venv, pip, project layout, pytest basics', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'f-python-6', title: 'Checkpoint: 10 idiomatic-Python questions answered cold', proof: 'checkpoint', mandatory: true, estMinutes: 60 },
      { id: 'f-python-7', title: 'asyncio — event loop, await, gather (needed for FastAPI later)', proof: 'notes', mandatory: false, estMinutes: 90 },
    ],
  },
  {
    id: 'f-data',
    tier: 1,
    name: 'Data Stack',
    source: 'Apna Prime 10–21',
    track: 'ai',
    blurb:
      'Twelve course parts: NumPy, Pandas, SQL, scraping and visualisation. SQL here is separately interview-critical.',
    milestones: [
      { id: 'f-data-1', title: 'Phase 2 intro (10) + NumPy (11)', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'f-data-2', title: 'Pandas Parts 1–2 (12–13) — real manipulation, not toy frames', proof: 'implement', mandatory: true, estMinutes: 180 },
      { id: 'f-data-3', title: 'Data Collection (14) + continuation (17)', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'f-data-4', title: 'SQL Parts 1–2 (15–16) — joins, aggregates, subqueries', proof: 'exercise', mandatory: true, estMinutes: 180 },
      { id: 'f-data-5', title: 'Web scraping activity (19)', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'f-data-6', title: 'Data visualisation Parts 1–2 (20–21)', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'f-data-7', title: 'Checkpoint: clean a messy dataset and defend every choice', proof: 'checkpoint', mandatory: true, estMinutes: 60 },
    ],
  },
  {
    id: 'f-math',
    tier: 1,
    name: 'Math for AI',
    source: 'Apna Prime 22–24 · 5ME Stats & Linear Algebra',
    track: 'ai',
    blurb:
      'Three course parts. Enough probability, linear algebra and calculus that transformers and backprop read as mechanics rather than magic.',
    milestones: [
      { id: 'f-math-1', title: 'Probability (22) — distributions, Bayes, expectation', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-math-2', title: 'Linear Algebra (23) — vectors, matrices, dot products, eigen intuition', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-math-3', title: 'Calculus (24) — derivatives, chain rule, gradients', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-math-4', title: 'Checkpoint: explain one gradient-descent step in your own words', proof: 'checkpoint', mandatory: true, estMinutes: 45 },
    ],
  },
  {
    id: 'f-ml',
    tier: 1,
    name: 'Machine Learning',
    source: 'Apna Prime 25–36',
    track: 'ai',
    blurb:
      'Twelve course parts including both minor projects. Evaluation matters more here than algorithm count.',
    milestones: [
      { id: 'f-ml-1', title: 'Starting with ML (25) + Supervised Parts 1–2 (26–27)', proof: 'watch', mandatory: true, estMinutes: 210 },
      { id: 'f-ml-2', title: 'Supervised Part 3 (28) + Scratch Implementations (29)', proof: 'implement', mandatory: true, estMinutes: 180 },
      { id: 'f-ml-3', title: 'CreditWise Loan System (30) — minor project shipped', proof: 'project', mandatory: true, estMinutes: 240 },
      { id: 'f-ml-4', title: 'Supervised Parts 4–6 (31–33)', proof: 'watch', mandatory: true, estMinutes: 240 },
      { id: 'f-ml-5', title: 'Evaluation — precision/recall/F1, ROC-AUC, and when each misleads', proof: 'notes', mandatory: true, estMinutes: 90 },
      { id: 'f-ml-6', title: 'Bias/variance, overfitting, regularisation, cross-validation', proof: 'notes', mandatory: true, estMinutes: 90 },
      { id: 'f-ml-7', title: 'Unsupervised Parts 1–2 (34–35)', proof: 'watch', mandatory: true, estMinutes: 180 },
      { id: 'f-ml-8', title: 'SmartCart Clustering System (36) — minor project shipped', proof: 'project', mandatory: true, estMinutes: 210 },
    ],
  },
  {
    id: 'f-dl',
    tier: 1,
    name: 'Deep Learning',
    source: 'Apna Prime 39–55, 60',
    track: 'ai',
    blurb:
      'Eleven parts — the largest block in the course. The bar is a network written from scratch; importing Keras is not understanding.',
    milestones: [
      { id: 'f-dl-1', title: 'Parts 1–3 (39–41) — perceptron, activations, forward pass', proof: 'watch', mandatory: true, estMinutes: 270 },
      { id: 'f-dl-2', title: 'Backpropagation derived and implemented in NumPy', proof: 'implement', mandatory: true, estMinutes: 180 },
      { id: 'f-dl-3', title: 'Parts 4–6 (42–44) — optimisers, regularisation, tuning', proof: 'watch', mandatory: true, estMinutes: 270 },
      { id: 'f-dl-4', title: 'Parts 7–8 (49–50) — CNN architecture', proof: 'watch', mandatory: true, estMinutes: 180 },
      { id: 'f-dl-5', title: 'Text Summarizer (51) — minor project shipped', proof: 'project', mandatory: true, estMinutes: 210 },
      { id: 'f-dl-6', title: 'Parts 9–11 (54–55, 60) — sequence models and TensorFlow', proof: 'implement', mandatory: true, estMinutes: 270 },
      { id: 'f-dl-7', title: 'Reinforcement Learning Parts 1–3 (45–47)', proof: 'watch', mandatory: false, estMinutes: 240 },
    ],
  },
  {
    id: 'f-5me-core',
    tier: 2,
    name: 'LLM Internals',
    source: '5ME — Transformers · Prompt Engineering',
    track: 'ai',
    blurb:
      'The 5ME bootcamp goes far deeper here than Apna does. Transformer history through the actual paper, then prompt engineering as a discipline rather than a trick.',
    milestones: [
      { id: 'f-5me-1', title: 'Transformer evolution — RNN, LSTM, Seq2Seq, attention', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-5me-2', title: '"Attention Is All You Need" — read the paper, note what it solved', proof: 'notes', mandatory: true, estMinutes: 150 },
      { id: 'f-5me-3', title: 'Transformer architecture — self-attention, heads, positional encoding', proof: 'notes', mandatory: true, estMinutes: 150 },
      { id: 'f-5me-4', title: 'BERT vs GPT lineage, instruction tuning, the LLM era', proof: 'notes', mandatory: true, estMinutes: 90 },
      { id: 'f-5me-5', title: 'Prompt anatomy — instruction, context, input, output format', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'f-5me-6', title: 'System/user/assistant roles and structured outputs', proof: 'implement', mandatory: true, estMinutes: 90 },
      { id: 'f-5me-7', title: 'Prompting across models — GPT, Claude, Gemini, Llama/Mistral', proof: 'exercise', mandatory: false, estMinutes: 90 },
      { id: 'f-5me-8', title: 'Checkpoint: explain one LLM request end to end, token in to token out', proof: 'checkpoint', mandatory: true, estMinutes: 60 },
    ],
  },
  {
    id: 'f-5me-rag',
    tier: 2,
    name: 'VectorDB, LangChain & Agents',
    source: '5ME — VectorDB · LangChain · Agentic AI',
    track: 'ai',
    blurb:
      'The single most job-relevant block in either course. You already have RAG exposure, so the bar here is measured retrieval quality and an agent loop you wrote yourself.',
    milestones: [
      { id: 'f-rag-1', title: 'Vectors, dimensionality, embedding models (OpenAI, SentenceTransformers)', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-rag-2', title: 'VectorDB landscape — ChromaDB, FAISS, Pinecone, Weaviate', proof: 'notes', mandatory: true, estMinutes: 90 },
      { id: 'f-rag-3', title: 'ChromaDB or FAISS running locally with real documents', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'f-rag-4', title: 'Chunking strategies — and why chunk size changes the answer', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'f-rag-5', title: 'Retrieval evaluation — measured hit-rate on a real question set', proof: 'exercise', mandatory: true, estMinutes: 180 },
      { id: 'f-rag-6', title: 'LangChain core — models, prompts, chains, memory, retrievers', proof: 'implement', mandatory: true, estMinutes: 210 },
      { id: 'f-rag-7', title: 'LangChain vs direct API calls — know when not to use it', proof: 'notes', mandatory: true, estMinutes: 60 },
      { id: 'f-rag-8', title: 'Agent components — perception, reasoning, tools, memory', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'f-rag-9', title: 'Agent loop built from scratch, no framework', proof: 'implement', mandatory: true, estMinutes: 210 },
      { id: 'f-rag-10', title: 'LangGraph / CrewAI / AutoGen — enough to compare them', proof: 'notes', mandatory: false, estMinutes: 120 },
    ],
  },
  {
    id: 'f-apps',
    tier: 1,
    name: 'AI Apps & APIs',
    source: 'Apna Prime 56, 59, 61',
    track: 'ai',
    blurb:
      'Where the model stops being a notebook and becomes something with a URL. Directly reuses your Flask background.',
    milestones: [
      { id: 'f-apps-1', title: 'OpenAI APIs (56) — calls, streaming, tool calling', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'f-apps-2', title: 'Working with Flask (59) — serve a model behind an endpoint', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'f-apps-3', title: 'Agentic AI (61) — course module, compared against your own loop', proof: 'project', mandatory: true, estMinutes: 180 },
    ],
  },
] as const;
