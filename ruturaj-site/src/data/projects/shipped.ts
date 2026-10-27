import type { PortfolioProject } from './types';

/**
 * Client work that already shipped. Stack claims stay inside what the resume
 * deep-dive prompts in src/data/amazon/resume.json state, and the `explain`
 * field is that prompt verbatim. Numbers read "Metric needed" until the
 * write-up supplies a measured one.
 */
export const SHIPPED_PROJECTS: readonly PortfolioProject[] = [
  {
    id: 'proj-voice',
    name: 'AI Voice Caller',
    tagline: 'A voice receptionist that serves more than one business from one deployment.',
    status: 'shipped',
    why: 'Shipped client work that covers the three things AI-engineer interviewers press on: isolation between tenants, a real-time latency budget, and retrieval grounded in the documents each customer supplies.',
    stack: ['Multi-tenant', 'STT → LLM → TTS streaming', 'RAG knowledge base'],
    headline: 'A streaming speech-to-text, LLM and text-to-speech pipeline with a per-stage latency budget, isolated per tenant.',
    taskIds: ['proj-writeup'],
    problem: 'Each business wants a receptionist that knows its own documents and answers in real time, with no data or load leaking between tenants.',
    architecture: 'Tenant isolation at the data and configuration level; a streaming pipeline from speech-to-text into the LLM and out through text-to-speech, budgeted stage by stage; tenant documents indexed into a RAG knowledge base the LLM answers from.',
    milestones: [
      'Write down the latency budget per stage (STT, LLM, TTS) as measured on a real call, not estimated (Metric needed)',
      'Document the tenant isolation model: what is separated, where, and how a cross-tenant read is prevented',
      'Describe the ingestion path from tenant documents into the RAG knowledge base, and how a changed document is refreshed',
      'Record a short demo call and link it from the README',
      'Write the two-minute interview answer and say it out loud once',
    ],
    testing: 'To write up: how isolation was checked across two tenants, and how end-to-end latency was measured on a real call. If the check was manual, write the manual plan down and say so.',
    deployment: 'To write up: where it runs, how a new tenant is onboarded, and what a deploy touches.',
    success: 'The write-up answers the three deep-dive prompts with evidence: isolation shown, the latency budget stated per stage (Metric needed), and the document-to-answer path drawn.',
    explain: 'Multi-tenant isolation; the streaming STT → LLM → TTS latency budget; how tenant documents feed the RAG knowledge base.',
  },
  {
    id: 'proj-realestate',
    name: 'Real Estate Listing Portal',
    tagline: 'A listing portal with role-scoped access, background workers and WhatsApp lead capture.',
    status: 'shipped',
    why: 'Shipped client work that shows backend depth: a large relational schema, authorisation that is scoped rather than flat, and an asynchronous path from a WhatsApp message to a tracked lead.',
    stack: ['PostgreSQL, 48 tables', 'Scoped RBAC', 'Redis workers', 'WhatsApp to leads'],
    headline: 'A 48-table PostgreSQL schema with scoped RBAC, Redis workers, and WhatsApp messages that become leads.',
    taskIds: ['proj-writeup'],
    problem: 'Different roles need different views of the same listings, and inbound WhatsApp messages have to become tracked leads without anyone copying them across by hand.',
    architecture: 'A 48-table PostgreSQL schema; role-based access scoped to what each role may see and change; Redis-backed workers for background jobs; WhatsApp messages received and turned into lead records.',
    milestones: [
      'Draw the schema at the level of its main entities and explain why it needed 48 tables',
      'Document the RBAC model with one example per role of something it can and cannot do',
      'List what the Redis workers do and what happens when one fails mid-job',
      'Trace one WhatsApp message to a lead record, step by step',
      'Write the two-minute interview answer and say it out loud once',
    ],
    testing: 'To write up: how the RBAC rules were tested across roles, and how the WhatsApp-to-lead path was verified end to end.',
    deployment: 'To write up: where it runs, how migrations for a schema this size were applied safely, and how a worker is restarted.',
    success: 'The write-up answers the deep-dive prompt with a drawn schema, a worked RBAC example, a worker failure story and one traced lead. Lead volume: Metric needed.',
    explain: 'The 48-table PostgreSQL schema, scoped RBAC, Redis workers, and how WhatsApp messages become leads.',
  },
  {
    id: 'proj-vision',
    name: 'Real Vision AI',
    tagline: 'Object detection over many camera feeds on edge hardware, with LLM search over what was recorded.',
    status: 'shipped',
    why: 'Shipped client work that pairs a vision model with real deployment constraints: edge latency, many concurrent feeds, and a plain-language interface over recorded events.',
    stack: ['YOLOv8', 'Edge NPU / GPU', 'Many camera feeds', 'LLM search over events'],
    headline: 'YOLOv8 on edge NPU and GPU across many camera feeds, with an LLM that searches the recorded events.',
    taskIds: ['proj-writeup'],
    problem: 'Many cameras produce more footage than anyone watches. Detection has to run on edge hardware inside a latency budget, and the events it records have to be searchable in plain language afterwards.',
    architecture: 'YOLOv8 for detection, run on edge NPU or GPU; a feed layer that handles many camera streams at once; detected events recorded and made searchable through an LLM that queries the event log.',
    milestones: [
      'Write the reason YOLOv8 was chosen over the alternatives you considered',
      'Record measured latency per frame on the edge NPU and on the GPU (Metric needed)',
      'Document how many feeds one box handles and what degrades first (Metric needed)',
      'Describe how an LLM query maps to recorded events, with one worked example',
      'Write the two-minute interview answer and say it out loud once',
    ],
    testing: 'To write up: how detection quality was checked on real footage, and how latency was measured on each device.',
    deployment: 'To write up: what runs on the edge device, what runs elsewhere, and how a new camera is added.',
    success: 'The write-up answers the four deep-dive prompts with evidence; latency and feed counts are measured numbers, not estimates (Metric needed until they are).',
    explain: 'Why YOLOv8; latency on edge NPU/GPU; handling many camera feeds; how the LLM search over recorded events works.',
  },
];
