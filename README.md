# SemanticVault

Semantic document search engine built with TypeScript, Node.js and pgvector. Index documents and retrieve them by meaning — not just keywords — using cosine similarity over dense vector embeddings stored natively in PostgreSQL.

Runs entirely offline with a local HuggingFace embedding model. No external API keys required.

---

## How it works

```
POST /api/v1/documents
        ↓
Text → all-MiniLM-L6-v2 (local, quantized) → float32[384]
        ↓
pgvector — stores embedding with IVFFlat index
        ↓
POST /api/v1/search
        ↓
Query → embed → cosine similarity → ranked results
```

---

## Tech Stack

- **TypeScript** + **Node.js 20**
- **Express** — HTTP server
- **@xenova/transformers** — local HuggingFace inference (all-MiniLM-L6-v2)
- **pgvector** — vector similarity search in PostgreSQL
- **IVFFlat index** — approximate nearest neighbor search
- **Docker** + **Docker Compose**

---

## Getting Started

```bash
git clone https://github.com/ElitonScos/semanticvault.git
cd semanticvault

cp .env.example .env

docker compose up -d
```

API available at `http://localhost:3000`

No API keys needed — embeddings run locally inside the container.

---

## Environment Variables

```env
DATABASE_URL=postgresql://svuser:svpass@db:5432/semanticvault
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384
PORT=3000
```

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/documents` | Index a new document |
| GET | `/api/v1/documents` | List indexed documents |
| DELETE | `/api/v1/documents/:id` | Remove a document |
| POST | `/api/v1/search` | Semantic similarity search |

---

## Search example

Index a document:
```json
POST /api/v1/documents
{
  "title": "Refund Policy",
  "content": "Customers may request a full refund within 30 days of purchase.",
  "source": "support-docs"
}
```

Search by meaning:
```json
POST /api/v1/search
{
  "query": "how do I get my money back?",
  "limit": 5,
  "threshold": 0.5
}
```

Response:
```json
{
  "query": "how do I get my money back?",
  "results": [
    {
      "id": 1,
      "title": "Refund Policy",
      "content": "Customers may request a full refund within 30 days of purchase.",
      "similarity": 0.87
    }
  ],
  "count": 1
}
```

---

## Project Structure

```
semanticvault/
├── src/
│   ├── index.ts          — Express entrypoint, graceful shutdown
│   ├── config.ts         — env-based configuration
│   ├── database.ts       — pg pool, pgvector init, IVFFlat index
│   ├── embeddings.ts     — local transformer inference
│   └── routes/
│       ├── documents.ts  — index, list, delete
│       └── search.ts     — cosine similarity search
├── docker/
│   └── Dockerfile        — multi-stage build
├── docker-compose.yml
└── .env.example
```
