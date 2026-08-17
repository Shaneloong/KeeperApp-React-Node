from ai_service.agents.state import GraphState
from ai_service.tools.retriever import get_user_retriever
from ai_service.prompts.system import rag_prompt
from ai_service.llms.factory import get_llm
from langchain_core.output_parsers import StrOutputParser

def retrieve_node(state: GraphState) -> dict:
    """
    Retrieve documents from ChromaDB based on the user's question.
    """
    print("---RETRIEVE---")
    question = state["question"]
    user_id = state["user_id"]

    retriever = get_user_retriever(user_id)
    documents = retriever.invoke(question)

    return {"documents": documents, "question": question, "user_id": user_id}

def generate_node(state: GraphState) -> dict:
    """
    Generate an answer using the LLM based on retrieved documents.
    """
    print("---GENERATE---")
    question = state["question"]
    documents = state["documents"]

    # Format docs
    context = "\n\n".join(doc.page_content for doc in documents)

    # Check if we should fake the LLM response if no API key is set
    # to avoid crashing the local demo if the user hasn't set it up yet.
    try:
        llm = get_llm()

        # Build chain
        rag_chain = rag_prompt | llm | StrOutputParser()

        # Generate
        generation = rag_chain.invoke({"context": context, "question": question})

    except ValueError as e:
        print(f"Fallback due to missing LLM: {e}")
        if not documents:
            generation = "I couldn't find anything in your notes about that."
        else:
            generation = f"(Simulated AI Answer): Based on your notes, here is the relevant info:\n\n{context}"

    return {"documents": documents, "question": question, "generation": generation}
