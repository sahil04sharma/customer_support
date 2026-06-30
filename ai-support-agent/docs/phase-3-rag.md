# Phase 3 — RAG Pipeline (highest priority)

**Goal:** Upload a document, extract its text, chunk it, embed each chunk with Gemini, store chunks + vectors in pgvector, and retrieve relevant chunks by semantic similarity.

> This is the core differentiator. Do not skip or shortcut it. Test insert + search early.

## Prerequisites

- Phase 1 + 2 complete.
- `GEMINI_API_KEY`, and Cloudinary keys set in `.env`.
- pgvector extension enabled in Supabase.

## Tasks

### 1. Chunker — `src/services/chunker.ts`

Implement exactly as Section 6a of the spec:

```typescript
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

### 2. Embeddings — `src/services/embeddings.ts`

- Use `@google/generative-ai`, model `text-embedding-004`.
- `generateEmbedding(text): Promise<number[]>` returns 768 numbers.
- Consider a small helper to embed many chunks sequentially (respect rate limits).

### 3. PDF/TXT extraction — `src/services/pdfExtractor.ts`

- `extractText(buffer, mimetype): Promise<string>`.
- PDF → `pdf-parse`. TXT → `buffer.toString('utf-8')`.
- Throw `AppError(400, ...)` for unsupported types.

### 4. Cloudinary upload — `src/lib/cloudinary.ts`

- Configure `cloudinary` from env.
- `uploadDocument(buffer, filename): Promise<string>` returns the secure file URL (use `resource_type: "raw"` for non-images).

### 5. Document processor — `src/services/documentProcessor.ts`

`processDocument(documentId, businessId, text)`:
1. `chunkText(text)`.
2. For each chunk: `generateEmbedding(chunk)`.
3. Insert with **raw SQL** (Prisma can't write `vector`):

```typescript
await prisma.$executeRaw`
  INSERT INTO "DocumentChunk" (id, "documentId", "businessId", content, embedding, "chunkIndex", "createdAt")
  VALUES (${cuid()}, ${documentId}, ${businessId}, ${chunks[i]},
          ${JSON.stringify(embedding)}::vector, ${i}, NOW())
`;
```
4. On success: set `Document.status = "READY"`. On any error: set `"FAILED"` and log.

### 6. Vector search — `src/services/vectorSearch.ts`

`searchKnowledgeBase(query, businessId, limit = 5)`:

```typescript
const queryEmbedding = await generateEmbedding(query);
const results = await prisma.$queryRaw<{ content: string; similarity: number }[]>`
  SELECT content, 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
  FROM "DocumentChunk"
  WHERE "businessId" = ${businessId}
  ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
  LIMIT ${limit}
`;
return results;
```

### 7. Document routes — `src/routes/document.routes.ts` (+ controller)

All protected by `requireBusiness`; scope everything to `req.auth.businessId`.

```
POST   /api/documents/upload   # multer single file → Cloudinary → create Document(PROCESSING) → respond immediately → process in background
GET    /api/documents          # list this business's documents with status
DELETE /api/documents/:id      # delete document (+ chunks via cascade), verify ownership
```

- Use `multer` memory storage.
- After creating the `Document` row, respond `201` immediately, then run `processDocument(...)` without `await` (background). Wrap in try/catch that sets `FAILED`.

## Acceptance criteria

- [ ] Uploading a PDF/TXT returns immediately with a `PROCESSING` document.
- [ ] After processing, `GET /api/documents` shows status `READY`.
- [ ] `DocumentChunk` rows exist in the DB with non-null `embedding`.
- [ ] A direct call to `searchKnowledgeBase("<question in the doc>", businessId)` returns relevant chunks with `similarity` between 0 and 1, ordered descending.
- [ ] A business cannot list or delete another business's documents.
- [ ] Failed processing sets status `FAILED` (test with a corrupt/empty file).

## Verification

```bash
TOKEN=... # business access token
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@faq.pdf"

# poll until READY
curl http://localhost:5000/api/documents -H "Authorization: Bearer $TOKEN"
```

Then add a temporary debug route or script to call `searchKnowledgeBase` and confirm relevant chunks come back.
