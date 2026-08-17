from typing import TypedDict, List
from langchain_core.documents import Document

class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        question: question asked by the user
        user_id: user making the request
        documents: list of documents retrieved from vectorstore
        generation: LLM generation (the final answer)
    """
    question: str
    user_id: str
    documents: List[Document]
    generation: str
