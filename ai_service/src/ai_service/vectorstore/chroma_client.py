from langchain_chroma import Chroma
from ai_service.core.config import settings
from ai_service.vectorstore.embeddings import get_embedding_model

_embedding_model = get_embedding_model()

def get_vector_store() -> Chroma:
    """Returns a connected ChromaDB instance."""
    return Chroma(
        collection_name="user_notes",
        embedding_function=_embedding_model,
        persist_directory=settings.CHROMA_DB_DIR
    )
