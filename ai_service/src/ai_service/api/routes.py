from fastapi import APIRouter, HTTPException
from langchain_core.documents import Document
from ai_service.schemas.api_models import (
    NoteIngestRequest, SearchRequest, SearchResponse, SearchResult,
    ChatRequest, ChatResponse
)
from ai_service.vectorstore.chroma_client import get_vector_store
from ai_service.agents.graph import rag_agent

router = APIRouter()

@router.post("/ingest")
async def ingest_note(request: NoteIngestRequest):
    vector_store = get_vector_store()
    text_to_embed = f"Title: {request.title}\nContent: {request.content}"
    doc = Document(
        page_content=text_to_embed,
        metadata={"user_id": request.user_id, "note_id": request.note_id, "title": request.title}
    )
    vector_store.add_documents([doc], ids=[request.note_id])
    return {"status": "success", "message": f"Note {request.note_id} ingested."}

@router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    vector_store = get_vector_store()
    try:
        vector_store.delete(ids=[note_id])
    except ValueError:
        pass
    return {"status": "success", "message": f"Note {note_id} deleted."}

@router.post("/search", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    vector_store = get_vector_store()
    results = vector_store.similarity_search_with_score(
        query=request.query,
        k=5,
        filter={"user_id": request.user_id}
    )
    formatted_results = []
    for doc, score in results:
        formatted_results.append(
            SearchResult(note_id=doc.metadata["note_id"], score=float(score))
        )
    return {"results": formatted_results}

@router.post("/chat", response_model=ChatResponse)
async def chat_with_notes(request: ChatRequest):
    # Execute the LangGraph RAG Agent
    initial_state = {
        "question": request.question,
        "user_id": request.user_id
    }

    # Run the graph
    result = rag_agent.invoke(initial_state)

    # Extract the generated answer
    answer = result.get("generation", "Sorry, I could not generate an answer.")

    return {"answer": answer}
