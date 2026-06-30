# AI Customer Support Agent — Full Product Documentation

> **For Cursor:** This is the complete technical specification for building an AI-powered customer support SaaS. Read this entire document before writing any code. Follow the architecture, schema, and folder structure exactly.

---

## 1. What Are We Building?

A **multi-tenant SaaS platform** where any business can:
1. Sign up and upload their knowledge base documents (FAQs, policies, product docs)
2. Get an embeddable chat widget (like Intercom) to paste on their website
3. Have an AI agent automatically answer customer questions using their documents
4. Escalate to a human support agent in real-time when AI is not confident

---

## 2. Three Types of Users

| User | Role |
|------|------|
| **Business Owner** | Signs up, uploads docs, manages agents, views dashboard |
| **Support Agent** | Employee of the business, handles escalated chats |
| **Customer** | Visitor on the business's website, chats with AI |

---

## 3. How RAG Works in This Project

RAG = Retrieval Augmented Generation. Instead of AI answering from its own training data, we feed it relevant content from the business's own documents before asking it to respond.

### Step-by-step RAG flow:

```
SETUP (done once when business uploads a document):
────────────────────────────────────────────────
1. Business uploads a PDF or text file
2. We extract raw text from the file
3. Split text into small chunks (300-500 words each)
4. Convert each chunk into a vector (embedding) using Groq/Gemini embedding model
5. Store each chunk + its vector in PostgreSQL (pgvector)

QUERY (happens every time a customer sends a message):
──────────────────────────────────────────────────────
1. Customer types: "What is your return policy?"
2. Convert that question into a vector using same embedding model
3. Search pgvector for the 5 most similar chunks using cosine similarity
4. Take those 5 chunks (raw text) + customer question
5. Send to Groq/Gemini as context: "Using only this information: [chunks], answer: [question]"
6. AI generates accurate answer based on business's own documents
7. Check confidence — if low, escalate to human
```

### What is a Vector / Embedding?

A vector is just an array of numbers that represents the meaning of text.

```
"What is your return policy?" → [0.23, -0.87, 0.45, 0.12, ...] (1536 numbers)
"We accept returns within 30 days" → [0.21, -0.85, 0.43, 0.14, ...] (1536 numbers)
```

Sentences with similar meaning have similar numbers — so pgvector can find them by mathematical distance.

### What is a Knowledge Base?

The knowledge base is simply the collection of document chunks stored in the database for a specific business. When a business uploads a FAQ PDF, we process it into chunks and store them. That stored data IS the knowledge base. Nothing more complex than that.

---

## 4. Complete Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + TypeScript + Tailwind CSS | Clean, typed UI |
| Backend | Node.js + Express + TypeScript | API server + agent logic |
| Database | Supabase (PostgreSQL) | Regular data + pgvector for embeddings |
| ORM | Prisma | Type-safe database queries |
| Vector Search | pgvector (Supabase built-in) | Semantic similarity search |
| Real-time | Socket.io | Live chat between customer and human agent |
| Cache | Redis (Upstash free tier) | Active session management |
| AI Model | Groq API (LLaMA 3.1) | Fast LLM responses |
| Embeddings | Gemini text-embedding-004 | Convert text to vectors |
| File Uploads | Cloudinary | Store uploaded documents |
| Auth | JWT (access + refresh tokens) | Secure authentication |
| Frontend Deploy | Vercel | Free, fast |
| Backend Deploy | Railway | Simple Node.js hosting |

---

## 5. Complete Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// ─── BUSINESS (tenant) ───────────────────────────────────────────
model Business {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  password     String
  widgetKey    String   @unique @default(cuid()) // used to identify which business the widget belongs to
  plan         Plan     @default(FREE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  agents       Agent[]
  documents    Document[]
  conversations Conversation[]
  settings     BusinessSettings?
}

enum Plan {
  FREE
  PRO
}

// ─── BUSINESS SETTINGS ───────────────────────────────────────────
model BusinessSettings {
  id                 String   @id @default(cuid())
  businessId         String   @unique
  widgetColor        String   @default("#1a56db")
  widgetPosition     String   @default("bottom-right")
  welcomeMessage     String   @default("Hi! How can I help you today?")
  agentName          String   @default("Support Assistant")
  confidenceThreshold Float   @default(0.7) // below this score, escalate to human
  business           Business @relation(fields: [businessId], references: [id])
}

// ─── SUPPORT AGENT (employee of business) ────────────────────────
model Agent {
  id         String   @id @default(cuid())
  businessId String
  name       String
  email      String   @unique
  password   String
  isOnline   Boolean  @default(false)
  createdAt  DateTime @default(now())

  business      Business       @relation(fields: [businessId], references: [id])
  conversations Conversation[]
}

// ─── DOCUMENT (uploaded by business) ─────────────────────────────
model Document {
  id         String         @id @default(cuid())
  businessId String
  name       String
  fileUrl    String         // Cloudinary URL
  status     DocumentStatus @default(PROCESSING)
  createdAt  DateTime       @default(now())

  business Business        @relation(fields: [businessId], references: [id])
  chunks   DocumentChunk[]
}

enum DocumentStatus {
  PROCESSING  // being chunked and embedded
  READY       // embeddings stored, ready for search
  FAILED      // processing failed
}

// ─── DOCUMENT CHUNK (RAG) ────────────────────────────────────────
model DocumentChunk {
  id         String                      @id @default(cuid())
  documentId String
  businessId String                      // denormalized for faster search
  content    String                      // raw text of this chunk
  embedding  Unsupported("vector(768)")  // pgvector column (Gemini = 768 dimensions)
  chunkIndex Int                         // order of chunk in original document
  createdAt  DateTime                    @default(now())

  document Document @relation(fields: [documentId], references: [id])

  @@index([businessId])
}

// ─── CONVERSATION ─────────────────────────────────────────────────
model Conversation {
  id           String             @id @default(cuid())
  businessId   String
  agentId      String?            // null until escalated
  customerName String?
  customerEmail String?
  status       ConversationStatus @default(OPEN)
  handedOff    Boolean            @default(false) // true when AI escalated to human
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  business  Business  @relation(fields: [businessId], references: [id])
  agent     Agent?    @relation(fields: [agentId], references: [id])
  messages  Message[]
}

enum ConversationStatus {
  OPEN
  RESOLVED
  ESCALATED
}

// ─── MESSAGE ──────────────────────────────────────────────────────
model Message {
  id             String      @id @default(cuid())
  conversationId String
  role           MessageRole // CUSTOMER, AI, AGENT
  content        String
  confidence     Float?      // AI confidence score (null for human messages)
  createdAt      DateTime    @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
}

enum MessageRole {
  CUSTOMER
  AI
  AGENT
}
```

---

## 6. RAG Implementation (Core Logic)

### 6a. Text Chunking

```typescript
// src/services/chunker.ts

export function chunkText(text: string, chunkSize = 400, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) chunks.push(chunk);
  }

  return chunks;
}
```

### 6b. Generate Embeddings

```typescript
// src/services/embeddings.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await model.embedContent(text);
  return result.embedding.values; // returns array of 768 numbers
}
```

### 6c. Store Chunks in pgvector

```typescript
// src/services/documentProcessor.ts
import { prisma } from '../lib/prisma';
import { chunkText } from './chunker';
import { generateEmbedding } from './embeddings';

export async function processDocument(documentId: string, businessId: string, text: string) {
  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);

    // Store using raw SQL because Prisma doesn't support vector type natively
    await prisma.$executeRaw`
      INSERT INTO "DocumentChunk" (id, "documentId", "businessId", content, embedding, "chunkIndex", "createdAt")
      VALUES (
        ${cuid()},
        ${documentId},
        ${businessId},
        ${chunks[i]},
        ${JSON.stringify(embedding)}::vector,
        ${i},
        NOW()
      )
    `;
  }

  // Mark document as ready
  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'READY' }
  });
}
```

### 6d. Search Similar Chunks (Vector Search)

```typescript
// src/services/vectorSearch.ts
import { prisma } from '../lib/prisma';
import { generateEmbedding } from './embeddings';

export async function searchKnowledgeBase(
  query: string,
  businessId: string,
  limit = 5
): Promise<{ content: string; similarity: number }[]> {

  const queryEmbedding = await generateEmbedding(query);

  // Cosine similarity search using pgvector <=> operator
  const results = await prisma.$queryRaw<{ content: string; similarity: number }[]>`
    SELECT content, 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
    FROM "DocumentChunk"
    WHERE "businessId" = ${businessId}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return results;
}
```

### 6e. AI Agent Logic (The Brain)

```typescript
// src/services/agent.ts
import Groq from 'groq-sdk';
import { searchKnowledgeBase } from './vectorSearch';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CONFIDENCE_THRESHOLD = 0.65;

interface AgentResponse {
  answer: string;
  confidence: number;
  shouldEscalate: boolean;
  sources: string[];
}

export async function runAgent(
  query: string,
  businessId: string,
  conversationHistory: { role: string; content: string }[]
): Promise<AgentResponse> {

  // Step 1: Search knowledge base
  const relevantChunks = await searchKnowledgeBase(query, businessId, 5);

  // Step 2: Check if we found anything relevant
  const topSimilarity = relevantChunks[0]?.similarity ?? 0;

  // Step 3: Build context from chunks
  const context = relevantChunks
    .map((chunk, i) => `[Source ${i + 1}]: ${chunk.content}`)
    .join('\n\n');

  // Step 4: Build prompt
  const systemPrompt = `You are a helpful customer support assistant. 
Answer the customer's question using ONLY the information provided in the context below.
If the context does not contain enough information to answer confidently, say exactly: "I need to connect you with a human agent who can better help you."
Do not make up information. Be concise and friendly.

Context from knowledge base:
${context}`;

  // Step 5: Call Groq
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // last 6 messages for context
      { role: 'user', content: query }
    ],
    max_tokens: 500,
    temperature: 0.3 // lower = more factual, less creative
  });

  const answer = response.choices[0].message.content ?? '';

  // Step 6: Determine if we should escalate
  const needsEscalation =
    topSimilarity < CONFIDENCE_THRESHOLD ||
    answer.includes('human agent') ||
    answer.includes('connect you with');

  return {
    answer,
    confidence: topSimilarity,
    shouldEscalate: needsEscalation,
    sources: relevantChunks.map(c => c.content.slice(0, 100))
  };
}
```

---

## 7. Complete API Routes

### Auth Routes
```
POST   /api/auth/business/register     → Business signup
POST   /api/auth/business/login        → Business login
POST   /api/auth/agent/login           → Agent login
POST   /api/auth/refresh               → Refresh JWT token
POST   /api/auth/logout                → Logout
```

### Business Dashboard Routes
```
GET    /api/business/profile           → Get business profile
PUT    /api/business/settings          → Update widget settings
GET    /api/business/widget-key        → Get embed code

GET    /api/documents                  → List all documents
POST   /api/documents/upload           → Upload new document
DELETE /api/documents/:id              → Delete document

GET    /api/conversations              → List all conversations
GET    /api/conversations/:id          → Get single conversation with messages
PUT    /api/conversations/:id/resolve  → Mark as resolved

GET    /api/agents                     → List support agents
POST   /api/agents/invite              → Invite a new agent
DELETE /api/agents/:id                 → Remove agent

GET    /api/analytics                  → Conversations resolved, escalated, avg response time
```

### Widget Routes (called from embedded widget on customer's site)
```
POST   /api/widget/conversation/start  → Start new conversation (uses widgetKey)
POST   /api/widget/message             → Customer sends a message → AI responds
```

### Agent Routes (support agent dashboard)
```
GET    /api/agent/conversations        → Get escalated conversations assigned to me
POST   /api/agent/message              → Agent sends message in conversation
PUT    /api/agent/conversations/:id/resolve → Resolve conversation
```

---

## 8. WebSocket Events (Socket.io)

```typescript
// All socket events

// ── Customer joins a conversation ──
customer emits:    'join_conversation'    { conversationId }
server emits back: 'conversation_joined'  { conversationId, history }

// ── Customer sends message ──
customer emits:    'customer_message'     { conversationId, content }
server emits:      'ai_typing'            { conversationId }         → to customer
server emits:      'ai_response'          { conversationId, message } → to customer
// if escalated:
server emits:      'escalated_to_human'   { conversationId }         → to customer
server emits:      'new_escalation'       { conversationId }         → to all online agents of that business

// ── Agent joins their dashboard ──
agent emits:       'agent_online'         { agentId, businessId }
server emits:      'agent_status_updated' { agentId, isOnline: true } → to business room

// ── Agent accepts escalated conversation ──
agent emits:       'accept_conversation'  { conversationId, agentId }
server emits:      'agent_joined'         { agentId, agentName }     → to customer

// ── Agent sends message ──
agent emits:       'agent_message'        { conversationId, content }
server emits:      'agent_response'       { conversationId, message } → to customer

// ── Conversation resolved ──
agent emits:       'resolve_conversation' { conversationId }
server emits:      'conversation_resolved' { conversationId }        → to customer
```

---

## 9. Document Upload Flow

```
1. Business selects PDF/TXT file in dashboard
2. Frontend uploads file to backend via multipart/form-data
3. Backend uploads raw file to Cloudinary → gets fileUrl
4. Backend saves Document record in DB with status = PROCESSING
5. Backend responds immediately to frontend (don't make user wait)
6. Background job starts:
   a. Download file from Cloudinary
   b. Extract text (use pdf-parse for PDF, plain read for TXT)
   c. Chunk the text into 400-word pieces
   d. For each chunk: generate embedding via Gemini API
   e. Store chunk + embedding in DocumentChunk table
   f. Update Document status to READY
7. Frontend polls GET /api/documents every 5 seconds to show status change
```

---

## 10. Embeddable Widget

The widget is a React component built separately and served as a script tag businesses paste on their site:

```html
<!-- Business pastes this on their website -->
<script 
  src="https://yourdomain.com/widget.js" 
  data-widget-key="clx9a2b3c4d5e6f7g"
></script>
```

The widget.js script:
1. Reads `data-widget-key` from the script tag
2. Injects a chat bubble into the page
3. On open: calls `POST /api/widget/conversation/start` with the widgetKey
4. Connects to Socket.io with the conversationId
5. Sends/receives messages in real-time

---

## 11. Folder Structure

```
ai-support-agent/
├── frontend/                          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── BusinessLogin.tsx
│   │   │   │   └── BusinessRegister.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Overview.tsx       # analytics, stats
│   │   │   │   ├── Documents.tsx      # upload + manage docs
│   │   │   │   ├── Conversations.tsx  # all conversations list
│   │   │   │   ├── ConversationDetail.tsx
│   │   │   │   ├── Agents.tsx         # manage support agents
│   │   │   │   └── Settings.tsx       # widget customization
│   │   │   └── agent/
│   │   │       └── AgentDashboard.tsx # support agent view
│   │   ├── components/
│   │   │   ├── ui/                    # reusable components
│   │   │   ├── ChatWidget.tsx         # embeddable widget preview
│   │   │   └── EmbedCode.tsx          # shows copy-paste script tag
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   └── useAuth.ts
│   │   ├── store/                     # Redux or Zustand
│   │   └── lib/
│   │       └── api.ts                 # axios instance
│
├── widget/                            # Embeddable chat widget (separate build)
│   ├── src/
│   │   ├── Widget.tsx                 # main chat bubble component
│   │   ├── ChatWindow.tsx
│   │   └── index.ts                   # entry point, reads data-widget-key
│   └── vite.config.ts                 # builds to single widget.js file
│
├── backend/                           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── business.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   ├── conversation.routes.ts
│   │   │   ├── agent.routes.ts
│   │   │   └── widget.routes.ts
│   │   ├── controllers/               # route handlers
│   │   ├── services/
│   │   │   ├── agent.ts               # AI agent brain
│   │   │   ├── chunker.ts             # text chunking
│   │   │   ├── embeddings.ts          # Gemini embeddings
│   │   │   ├── vectorSearch.ts        # pgvector search
│   │   │   ├── documentProcessor.ts   # full doc pipeline
│   │   │   └── pdfExtractor.ts        # extract text from PDF
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   └── error.middleware.ts
│   │   ├── socket/
│   │   │   └── socketHandler.ts       # all Socket.io events
│   │   ├── lib/
│   │   │   ├── prisma.ts              # Prisma client singleton
│   │   │   └── redis.ts               # Upstash Redis client
│   │   └── app.ts                     # Express app setup
│   ├── prisma/
│   │   └── schema.prisma
│   └── tsconfig.json
│
└── README.md
```

---

## 12. Environment Variables

```env
# Backend .env

# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# AI
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Auth
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
PORT=5000
CLIENT_URL="http://localhost:5173"
```

---

## 13. Key npm Packages

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "socket.io": "^4.7.0",
    "groq-sdk": "^0.3.0",
    "@google/generative-ai": "^0.1.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "multer": "^1.4.5",
    "pdf-parse": "^1.1.1",
    "@upstash/redis": "^1.28.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/express": "^4.17.21",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "nodemon": "^3.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "socket.io-client": "^4.7.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0",
    "react-dropzone": "^14.2.3",
    "recharts": "^2.10.0"
  }
}
```

---

## 14. Build Order (Follow This Sequence)

Build in this exact order to avoid getting stuck:

```
Phase 1 — Setup (Day 1)
  ✅ Initialize backend with Express + TypeScript
  ✅ Connect Supabase, run Prisma migrations
  ✅ Enable pgvector: CREATE EXTENSION vector; in Supabase SQL editor
  ✅ Set up Redis (Upstash)
  ✅ Basic Express server running on port 5000

Phase 2 — Auth (Day 2)
  ✅ Business register + login (JWT)
  ✅ Agent login
  ✅ Auth middleware

Phase 3 — RAG Pipeline (Day 3-4) ← most important
  ✅ Document upload to Cloudinary
  ✅ PDF text extraction (pdf-parse)
  ✅ Text chunking
  ✅ Gemini embeddings
  ✅ Store chunks in pgvector
  ✅ Vector similarity search working

Phase 4 — AI Agent (Day 5)
  ✅ runAgent() function
  ✅ Widget conversation start API
  ✅ Widget message API (calls agent, returns response)
  ✅ Test in Postman end to end

Phase 5 — Real-time (Day 6-7)
  ✅ Socket.io setup
  ✅ Customer chat events
  ✅ Escalation to human agent
  ✅ Agent accepts and replies

Phase 6 — Frontend Dashboard (Day 8-12)
  ✅ Business auth pages
  ✅ Document upload page
  ✅ Conversations list + detail
  ✅ Settings + embed code page
  ✅ Agent dashboard

Phase 7 — Widget (Day 13-14)
  ✅ Standalone React widget
  ✅ Builds to single widget.js
  ✅ Test embed on a plain HTML page

Phase 8 — Polish + Deploy (Day 15)
  ✅ Deploy backend to Railway
  ✅ Deploy frontend to Vercel
  ✅ Update environment variables
  ✅ Final end-to-end test
```

---

## 15. What to Say in Interviews

**"What is your project?"**
> "I built an agentic AI customer support SaaS. Any business can sign up, upload their documentation, and get an embeddable chat widget. An AI agent autonomously answers customer queries using RAG — it retrieves semantically similar content from the business's knowledge base using pgvector and feeds it to an LLM. When confidence is low, it escalates to a human agent in real time via WebSockets."

**"What is RAG?"**
> "RAG stands for Retrieval Augmented Generation. Instead of relying on the LLM's training data, we convert our documents into vector embeddings and store them in pgvector. When a customer asks a question, we convert it to a vector too, find the most semantically similar document chunks, and inject that context into the LLM prompt. The AI answers using only that retrieved information — so it's always accurate to the business's specific data."

**"What makes it agentic?"**
> "The agent doesn't just answer — it makes decisions. It evaluates its own confidence score based on vector similarity. If the top match is below our threshold, it autonomously decides to escalate to a human rather than hallucinate an answer. That decision loop — perceive, reason, act — is what makes it agentic."

---

*End of documentation. Paste this into Cursor and start with Phase 1.*
