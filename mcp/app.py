from fastmcp import FastMCP, Context
from bson import ObjectId, json_util
from pymongo.errors import PyMongoError
from db.config import my_collection
import anyio
import json

mcp = FastMCP("My MCP Server")

@mcp.tool
def greet(name: str) -> str:
    return f"Hello, {name}!"

@mcp.tool
async def get_doc(doc_id: str, ctx: Context | None = None) -> dict | None:
    try:
        oid = ObjectId(doc_id)
    except Exception:
        if ctx:
            await ctx.error(f"Invalid ObjectId: {doc_id}")
        return None

    try:
        doc = await anyio.to_thread.run_sync(my_collection.find_one, {"_id": oid})
    except PyMongoError as e:
        if ctx:
            await ctx.error(f"Database error: {e}")
        return None

    if not doc:
        if ctx:
            await ctx.info(f"Document not found: {doc_id}")
        return None

    json_str = json_util.dumps(doc)
    json_doc = json.loads(json_str)

    return json_doc

@mcp.tool
async def get_kb(proj_id: str, ctx: Context | None = None) -> list[dict] | None:
    try:
        oid = ObjectId(proj_id)
        cursor = await anyio.to_thread.run_sync(
            lambda: list(my_collection.find({"proj": oid}))
        )
    except PyMongoError as e:
        if ctx:
            await ctx.error(f"Database error: {e}")
        return None

    if not cursor:
        if ctx:
            await ctx.info(f"No documents found for proj: {proj_id}")
        return []

    json_str = json_util.dumps(cursor)
    json_docs = json.loads(json_str)

    return json_docs

if __name__ == "__main__":
    mcp.run(transport="stdio")
