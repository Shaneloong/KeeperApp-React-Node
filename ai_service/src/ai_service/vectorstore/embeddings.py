from langchain_community.embeddings import HuggingFaceEmbeddings

# Using a robust, fast, open-source sentence-transformer model from HuggingFace
# Note: Since we want to run this locally/freely, we'll download a lightweight model
# directly to the local machine when the app starts.
def get_embedding_model():
    model_name = "all-MiniLM-L6-v2"
    model_kwargs = {'device': 'cpu'}
    encode_kwargs = {'normalize_embeddings': False}
    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )
