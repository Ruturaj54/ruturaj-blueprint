import type { FoundationSubject } from '@/engine/types';

/**
 * Tier 2 — Five Minute Engineering "Ultimate AI Mastery" bootcamp.
 *
 * Only the six modules Apna Prime does not already cover and that an AI
 * Engineer loop actually asks about. Milestone titles are the bootcamp's own
 * section headings, grouped into sittings of two to three hours.
 *
 * Of the bootcamp's 40 modules, the rest fall into three groups:
 *   - covered once already by Apna (Python, NumPy/Pandas, statistics, linear
 *     algebra, ML, DL, reinforcement learning, Git)
 *   - after the gate, in the AI track (MLOps, LLMOps, fine-tuning, Docker,
 *     cloud, System Design for AI)
 *   - analyst and data-engineering material that is not the target role
 *     (Excel, Power BI, Tableau, Looker, Streamlit, Snowflake, Airflow, Kafka,
 *     dbt, Spark, Cassandra, MongoDB, time series, computer vision, no-code)
 */
export const FIVEME_SUBJECTS: readonly FoundationSubject[] = [
  {
    id: 'fm-nlp',
    tier: 2,
    name: 'Natural Language Processing',
    source: '5ME · NLP',
    track: 'ai',
    blurb: 'The groundwork under every LLM: how text becomes tokens and vectors.',
    milestones: [
      { id: 'fm-nlp-1', title: 'NLP intro, NLTK/spaCy, core concepts, regex, text preprocessing', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'fm-nlp-2', title: 'Tokenization (BPE, WordPiece), stemming vs lemmatization, POS, NER', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'fm-nlp-3', title: 'Bag of Words, TF-IDF, Word2Vec, similarity metrics', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-nlp-4', title: 'Topic modelling, classical text classifiers, BLEU/ROUGE, deployment', proof: 'watch', mandatory: false, estMinutes: 150 },
    ],
  },
  {
    id: 'fm-transformers',
    tier: 2,
    name: 'Transformers',
    source: '5ME · Transformers',
    track: 'ai',
    blurb: 'Goes much deeper than Apna — through the actual paper, ending with a Nano LLM you build yourself.',
    milestones: [
      { id: 'fm-tf-1', title: 'History — RNN/LSTM, Seq2Seq, BERT, GPT, instruction tuning', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'fm-tf-2', title: '"Attention Is All You Need" — encoder/decoder, BERT vs GPT vs T5', proof: 'notes', mandatory: true, estMinutes: 150 },
      { id: 'fm-tf-3', title: 'Attention mechanism — Q/K/V, self-attention, multi-head, masked', proof: 'notes', mandatory: true, estMinutes: 150 },
      { id: 'fm-tf-4', title: 'Build a Nano LLM — tokenizer, transformer blocks in PyTorch, training loop', proof: 'project', mandatory: true, estMinutes: 240 },
    ],
  },
  {
    id: 'fm-prompt',
    tier: 2,
    name: 'Prompt Engineering',
    source: '5ME · Prompt Engineering',
    track: 'ai',
    blurb: 'Treated as an engineering discipline — versioned, evaluated — rather than a bag of tricks.',
    milestones: [
      { id: 'fm-pe-1', title: 'Prompt anatomy, system/user/assistant roles, core principles', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'fm-pe-2', title: 'Zero/one/few-shot, role and persona, task and constraint prompting, output control', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-pe-3', title: 'CoT, self-consistency, ToT, ReAct, prompt chaining, templates, evaluating prompts', proof: 'implement', mandatory: true, estMinutes: 150 },
    ],
  },
  {
    id: 'fm-rag',
    tier: 2,
    name: 'RAG — VectorDB & LlamaIndex',
    source: '5ME · VectorDB',
    track: 'ai',
    blurb: 'You have RAG exposure already. The bar here is measured retrieval quality, not another demo.',
    milestones: [
      { id: 'fm-vdb-1', title: 'Vectors, embedding models, similarity metrics, RDBMS vs VectorDB', proof: 'notes', mandatory: true, estMinutes: 120 },
      { id: 'fm-vdb-2', title: 'ChromaDB and FAISS hands-on — index, persist, query your own PDFs', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-vdb-3', title: 'Pinecone and LlamaIndex — indexes, query engines, chunk size and overlap', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-vdb-4', title: 'RAG — chunking, advanced RAG, reranking, faithfulness and context recall', proof: 'project', mandatory: true, estMinutes: 180 },
    ],
  },
  {
    id: 'fm-langchain',
    tier: 2,
    name: 'LangChain',
    source: '5ME · LangChain',
    track: 'ai',
    blurb: 'Enough to read and use it confidently — and to know when a direct API call is the better choice.',
    milestones: [
      { id: 'fm-lc-1', title: 'Setup, architecture, LLM vs chat models, output parsers', proof: 'implement', mandatory: true, estMinutes: 120 },
      { id: 'fm-lc-2', title: 'Chains and memory types', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-lc-3', title: 'Loaders, splitters, embeddings, vector stores, retrievers, a basic RAG pipeline', proof: 'project', mandatory: true, estMinutes: 180 },
      { id: 'fm-lc-4', title: 'Agents, tools and LCEL', proof: 'implement', mandatory: true, estMinutes: 150 },
    ],
  },
  {
    id: 'fm-agents',
    tier: 2,
    name: 'Agentic AI',
    source: '5ME · Agentic AI',
    track: 'ai',
    blurb: 'The most job-relevant module in the bootcamp. Ends at multi-agent systems and MCP.',
    milestones: [
      { id: 'fm-ag-1', title: 'Landscape, agent types, perception, reasoning, ReAct, planning', proof: 'notes', mandatory: true, estMinutes: 150 },
      { id: 'fm-ag-2', title: 'Tool use, prompting for agents, memory, RAG for agents', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-ag-3', title: 'File, code-execution and data-analysis agents', proof: 'implement', mandatory: true, estMinutes: 150 },
      { id: 'fm-ag-4', title: 'Multi-agent systems — CrewAI, LangGraph, AutoGen, MCP', proof: 'project', mandatory: true, estMinutes: 180 },
    ],
  },
] as const;
