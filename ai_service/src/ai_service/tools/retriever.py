from ai_service.vectorstore.chroma_client import get_vector_store

def get_user_retriever(user_id: str):
    """
    Returns a retriever scoped to a specific user.
    """
    vector_store = get_vector_store()
    return vector_store.as_retriever(
        search_kwargs={
            "k": 4,
            "filter": {"user_id": user_id}
        }
    )
