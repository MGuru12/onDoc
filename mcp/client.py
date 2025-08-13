import asyncio
from fastmcp import Client

async def main():
    # Adjust the URL or server path as needed
    client = Client("app.py")  # Or path to FastMCP server

    async with client:
        # Call greet tool
        greet_response = await client.call_tool("greet", {"name": "Alice"})
        print("Greet result:", greet_response)

        # Call get_doc tool with a MongoDB ObjectId (string)
        doc_id = "68526e187c34a0ee90a7e23a"
        doc_response = await client.call_tool("get_doc", {"doc_id": doc_id})
        print("Document result:", doc_response)

        # Call get_kb tool with proj ID
        proj_id = "68526e187c34a0ee90a7e238"
        kb_response = await client.call_tool("get_kb", {"proj_id": proj_id})
        print("Knowledge Base result:", kb_response)

if __name__ == "__main__":
    asyncio.run(main())
