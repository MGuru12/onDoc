# mcp/db/config.py

from pymongo import MongoClient

# Ideally, get this from environment variables
MONGO_URI = "mongodb://localhost:27017"

client = MongoClient(MONGO_URI)

db = client["68526def7c34a0ee90a7e22e"]
my_collection = db["docs"] 
