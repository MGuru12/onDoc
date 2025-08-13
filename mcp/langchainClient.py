from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "AIzaSyCbrW45LaNZ81z-HKWCLOl9HZqVlCdF7wM"

model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-001")

server_params = StdioServerParameters(
    command="python",
    args=[
        "app.py"
      ]
)

async def run_agent():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()

            # Get tools
            tools = await load_mcp_tools(session)

            # Create and run the agent
            agent = create_react_agent(model, tools)
            agent_response = await agent.ainvoke({

               "messages": [("user", "get the kb for the project id 68526e187c34a0ee90a7e238 then select the first document and get the document by its id")]

           })
            return agent_response

# Run the async function
if __name__ == "__main__":
    try:
        result = asyncio.run(run_agent())
        print(result)
        print(result["messages"][-1].content)

    except:
        pass