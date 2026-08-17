# AI Architecture Blueprint: Smart Notes with RAG & LangGraph

## 1. Overview
This project enhances the Keeper App by introducing an AI-powered microservice. The goal is to provide **Semantic Search** and a **Chat-with-Notes (RAG)** feature to showcase advanced AI engineering, orchestration, and vector database management.

### Architecture Flow
1. **Frontend (React):** Provides UI for Smart Search and Chat interfaces.
2. **Backend (Node.js/Express):** Acts as an API gateway. Handles user authentication and primary document storage (MongoDB). Proxies AI-related requests to the AI Microservice.
3. **AI Microservice (Python/FastAPI):** Handles embedding, vector storage, and orchestration using LangChain and LangGraph.

---

## 2. Technology Stack
*   **Python Package Manager:** `uv` (fast, modern python toolchain)
*   **API Framework:** FastAPI
*   **Vector Database:** ChromaDB (Local, lightweight)
*   **AI Orchestration:** LangChain & LangGraph
*   **LLM & Embeddings:** Google AI Studio (Gemini) / HuggingFace Inference API

---

## 3. Microservice Structure (Scalable Best Practices)
To ensure the microservice can scale for future complex AI features (like multi-agent systems, tool usage, etc.), we will use a robust, modular domain-driven structure. `uv` will be used for dependency management, and `__init__.py` files will be omitted unless absolutely necessary for Python's module resolution.

```text
ai_service/
├── pyproject.toml
├── .python-version
├── README.md
└── src/
    └── ai_service/
        ├── main.py              # FastAPI application entry point
        ├── api/
        │   ├── dependencies.py  # FastAPI dependencies (auth, db sessions)
        │   └── routes.py        # API endpoints (ingest, search, chat)
        ├── core/
        │   └── config.py        # Settings and environment variables (Pydantic BaseSettings)
        ├── schemas/
        │   └── api_models.py    # Pydantic models for API request/response validation
        ├── vectorstore/
        │   ├── chroma_client.py # ChromaDB connection and collection management
        │   └── embeddings.py    # Embedding model initialization (HuggingFace/Google)
        ├── llms/
        │   └── factory.py       # LLM provider initialization and configuration
        ├── prompts/
        │   └── system.py        # Centralized prompt templates for agents
        ├── tools/
        │   └── retriever.py     # LangChain tools for agents (e.g., ChromaDB search tool)
        └── agents/
            ├── state.py         # LangGraph State (TypedDict) definitions
            ├── nodes.py         # Individual execution functions for graph nodes
            └── graph.py         # LangGraph compilation, routing, and workflow definition
```

---

## 4. LangGraph RAG Workflow
We will implement a state machine for the chat feature using LangGraph, designed as an Agentic workflow:

1.  **State Definition (`agents/state.py`):** Tracks `question`, `retrieved_docs`, `generation`, and `chat_history`.
2.  **Nodes (`agents/nodes.py`):**
    *   `retrieve_node`: Uses the `retriever` tool to query ChromaDB.
    *   `generate_node`: Calls the LLM with the context and system prompt to generate an answer.
    *   *(Future Scalability)* `grade_documents`: Evaluates if retrieved docs are relevant.
    *   *(Future Scalability)* `web_search`: Fallback if local DB lacks info.
3.  **Graph (`agents/graph.py`):** Defines the edges connecting these nodes into a deterministic or conditional workflow.

---

## 5. API Contracts (Node.js <-> Python)

### A. Ingest Note (Triggered on note creation)
*   **Route:** `POST /api/ingest`
*   **Payload:** `{ "note_id": "123", "user_id": "abc", "title": "...", "content": "..." }`
*   **Action:** Embeds the title/content and stores it in ChromaDB with `user_id` metadata.

### B. Delete Note (Triggered on note deletion)
*   **Route:** `DELETE /api/notes/{note_id}`
*   **Action:** Removes the corresponding vector from ChromaDB.

### C. Semantic Search
*   **Route:** `POST /api/search`
*   **Payload:** `{ "query": "travel plans", "user_id": "abc" }`
*   **Response:** `{ "results": [{ "note_id": "123", "score": 0.89 }] }`

### D. Chat with Notes (RAG Agent)
*   **Route:** `POST /api/chat`
*   **Payload:** `{ "question": "What is my Hawaii itinerary?", "user_id": "abc" }`
*   **Response:** `{ "answer": "Based on your notes, you are visiting Maui on Tuesday..." }`
