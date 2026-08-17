from pydantic import BaseModel
from typing import List, Optional

class NoteIngestRequest(BaseModel):
    note_id: str
    user_id: str
    title: str
    content: str

class SearchRequest(BaseModel):
    query: str
    user_id: str

class SearchResult(BaseModel):
    note_id: str
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResult]

class ChatRequest(BaseModel):
    question: str
    user_id: str

class ChatResponse(BaseModel):
    answer: str
