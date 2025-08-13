import asyncio
import os
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# Set Google API Key if not set
if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "AIzaSyCbrW45LaNZ81z-HKWCLOl9HZqVlCdF7wM"  # Replace this

# Initialize model
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")

# Server parameters for MCP tool communication
server_params = StdioServerParameters(
    command="python",
    args=["app.py"]
)

# Add flag to detect if tools have been used recently
def tool_used_recently(messages):
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and "[TOOL_CALL]" in msg.content:
            return True
    return False

# Force a 'get_kb' tool call for root if nothing has been done yet
def ensure_kb_lookup(chat_history):
    if not tool_used_recently(chat_history):
        chat_history.append(HumanMessage(content="Use the get_kb tool to fetch content for the page titled 'root'"))

# Stricter prompt
system_prompt = (
    "Your name is Genie, the user's assistant and buddy. "
    "You always help the user interact with a knowledge base using MCP tools, "
    "specifically for project ID 68526e187c34a0ee90a7e238. "
    "You MUST ALWAYS call at least one MCP tool before responding. "
    "You are NEVER allowed to answer directly from memory or model knowledge. "
    "Always verify information by retrieving relevant documents using MCP tools. "
    "If the user's query is unclear or general, FIRST call the 'get_kb' tool for the page titled 'root' "
    "to load relevant documentation. "
    "NEVER expose project IDs, document IDs, internal developer terms, or implementation details. "
    "Only provide safe, user-facing instructions."
)

async def run_agent_chat():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await load_mcp_tools(session)
            agent = create_react_agent(model, tools)
            chat_history = [SystemMessage(content=system_prompt)]

            print("📚 Knowledge Base Chatbot Ready. Type 'exit' to quit.\n")

            while True:
                user_input = input("You: ").strip()
                if user_input.lower() in {"exit", "quit"}:
                    print("👋 Exiting chatbot.")
                    break

                chat_history.append(HumanMessage(content=user_input))

                # Force document lookup if tools haven't been used
                ensure_kb_lookup(chat_history)

                try:
                    response = await agent.ainvoke({"messages": chat_history})
                    message_content = response["messages"][-1].content
                    print(f"🤖 Agent: {message_content}")
                    chat_history.append(response["messages"][-1])
                except Exception as e:
                    print(f"⚠️ Error during response: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(run_agent_chat())
    except KeyboardInterrupt:
        print("\n👋 Chat interrupted by user.")
