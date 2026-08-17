import os
from langchain_core.language_models.chat_models import BaseChatModel
# We'll use a HuggingFace Inference Endpoint LLM to keep it free and open source,
# or we can use fake/placeholder locally if API key isn't provided yet.
from langchain_community.llms import HuggingFaceEndpoint
from langchain_community.chat_models.huggingface import ChatHuggingFace
from ai_service.core.config import settings

def get_llm() -> BaseChatModel:
    """Returns the configured LLM for generation."""

    hf_token = os.environ.get("HUGGINGFACE_API_KEY") or settings.HUGGINGFACE_API_KEY

    if not hf_token:
        # Fallback to a simpler approach if no token is provided for demonstration.
        # In a real scenario, we'd throw an error or use a local Ollama model.
        # For this portfolio piece, if no key, we will simulate the LLM.
        raise ValueError("HUGGINGFACE_API_KEY environment variable is required.")

    # We use Mistral or Llama-3 from HuggingFace as our generator.
    llm = HuggingFaceEndpoint(
        repo_id="mistralai/Mistral-7B-Instruct-v0.2",
        huggingfacehub_api_token=hf_token,
        task="text-generation",
        max_new_tokens=512,
        top_k=50,
        temperature=0.1,
    )

    return ChatHuggingFace(llm=llm)
