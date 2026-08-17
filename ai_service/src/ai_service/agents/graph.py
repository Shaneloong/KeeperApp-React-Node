from langgraph.graph import START, END, StateGraph
from ai_service.agents.state import GraphState
from ai_service.agents.nodes import retrieve_node, generate_node

def build_rag_graph():
    """
    Builds and compiles the LangGraph state machine.
    """
    # 1. Initialize StateGraph with our TypedDict state
    workflow = StateGraph(GraphState)

    # 2. Add nodes
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("generate", generate_node)

    # 3. Define edges
    # Start -> Retrieve -> Generate -> End
    workflow.add_edge(START, "retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", END)

    # 4. Compile graph
    app = workflow.compile()

    return app

# Singleton instance of our compiled graph
rag_agent = build_rag_graph()
