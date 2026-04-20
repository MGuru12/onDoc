const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { Embeddings } = require("@langchain/core/embeddings");
const docsModel = require("../models/doc");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const axios = require("axios");

const { convert } = require('html-to-text');

// Removed global context to prevent race conditions in concurrent requests.
// orgId and projId are now passed explicitly to each tool.

// Cache for vector stores per project
const vectorStoreCache = new Map();

// NVIDIA NIM embeddings class
class NVIDIAEmbeddings extends Embeddings {
  constructor() {
    super({});
    this.apiKey = process.env.NVIDIA_API_KEY;
    this.baseUrl = "https://integrate.api.nvidia.com/v1";
    this.model = "NV-Embed-QA-4";
  }

  async embedQuery(text) {
    return this.embed(text);
  }

  async embedDocuments(documents) {
    const results = [];
    for (const doc of documents) {
      const text = typeof doc === "string" ? doc : doc.pageContent;
      const embedding = await this.embed(text);
      results.push(embedding);
    }
    return results;
  }

  async embed(text) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          input: text,
          model: this.model,
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('[NVIDIAEmbeddings] Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Cache for embeddings instance
let embeddingsInstance = null;
const getEmbeddings = () => {
  if (!embeddingsInstance) {
    console.log('[Embeddings] Using NVIDIA NIM embeddings');
    embeddingsInstance = new NVIDIAEmbeddings();
  }
  return embeddingsInstance;
};

const fetchAllDocs = tool(
  async ({ orgId, projId }) => {
    try {
      console.log('[fetchAllDocs] Using org:', orgId, 'proj:', projId);
      
      if (!orgId || !projId) {
        return JSON.stringify({ 
          error: "orgId and projId are required parameters."
        });
      }
      
      const Docs = docsModel(orgId);
      let docs;
      try {
        docs = await Docs.find({}).select('title path visibility _id proj');
        console.log('[fetchAllDocs] All docs found:', docs.length);
        
        if (docs.length > 0) {
          docs = docs.filter(doc => {
            const docProj = doc._doc.proj?.toString() || doc._doc.proj;
            return docProj === projId;
          });
          console.log('[fetchAllDocs] Filtered docs for proj', projId, ':', docs.length);
        }
      } catch (err) {
        console.error('[fetchAllDocs] Query error:', err);
        return JSON.stringify({ error: "Database query failed: " + err.message });
      }
      
      return JSON.stringify(docs);
    }
    catch (error) {
      console.error('[fetchAllDocs] Error:', error);
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: "fetchAllDocs",
    description: "Fetch all documents for a project. Returns list of documents with title, path, and visibility.",
    schema: z.object({
      orgId: z.string().describe("The organization ID"),
      projId: z.string().describe("The project ID"),
    }),
  }
);

const fetchSingleDocumentContent = tool(
  async ({docId, orgId}) => {
    try {
      if (!orgId || !docId) {
        return JSON.stringify({ error: "Organization ID and Document ID are required." });
      }
      
      const Docs = docsModel(orgId);
      const doc = await Docs.findById(docId).select('deploy title');
      
      if (!doc) {
        return JSON.stringify({ error: "Document not found" });
      }
      
      return JSON.stringify({
        title: doc.title,
        content: doc.deploy,
        contentType: "html"
      });
    }
    catch (error) {
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: "fetchSingleDocumentContent",
    description: "Fetch the deployed HTML content of a single document by its ID. Use this when you need the full document content.",
    schema: z.object({
      docId: z.string().describe("The document ID to fetch content for"),
      orgId: z.string().describe("The organization ID"),
    }),
  }
);

const semanticSearchDocs = tool(
  async ({query, orgId, projId, topK = 5}) => {
    try {
      console.log('[semanticSearchDocs] Using org:', orgId, 'proj:', projId, 'query:', query);
      
      if (!orgId || !projId) {
        return JSON.stringify({ 
          error: "orgId and projId are required parameters."
        });
      }
      
      const cacheKey = `${orgId}-${projId}`;
      
      let vectorStore = vectorStoreCache.get(cacheKey);
      
      if (!vectorStore) {
        const Docs = docsModel(orgId);
        console.log('[semanticSearchDocs] Querying docs for org:', orgId, 'proj:', projId);
        
        let docs;
        try {
          docs = await Docs.find({}).select('title deploy _id path proj');
          console.log('[semanticSearchDocs] All docs found:', docs.length);
          
          if (docs.length > 0) {
            docs = docs.filter(doc => {
              const docProj = doc._doc.proj?.toString() || doc._doc.proj;
              return docProj === projId;
            });
            console.log('[semanticSearchDocs] Filtered docs:', docs.length);
          }
        } catch (err) {
          console.error('[semanticSearchDocs] Query error:', err);
          return JSON.stringify({ error: "Database query failed: " + err.message });
        }
        
        if (docs.length === 0) {
          return JSON.stringify({ 
            message: "No documents found in this project. Tell the user they need to add some documentation first!",
            hasDocuments: false 
          });
        }
        
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        
        const documents = [];
        const allTexts = [];
        
        for (const doc of docs) {
          const textContent = convert(doc.deploy, {
            wordwrap: false,
            preserveNewlines: false,
          });
          
          console.log('[semanticSearchDocs] Doc title:', doc.title, 'Content length:', textContent.length);
          
          if (textContent.trim().length > 10) {
            const chunks = await textSplitter.createDocuments(
              [textContent],
              [{
                docId: doc._id.toString(),
                title: doc.title,
                path: doc.path,
              }]
            );
            
            documents.push(...chunks);
            allTexts.push(...chunks.map(c => c.pageContent));
            console.log('[semanticSearchDocs] Created', chunks.length, 'chunks for:', doc.title);
          } else {
            console.log('[semanticSearchDocs] Skipping empty doc:', doc.title);
          }
        }
        
        console.log('[semanticSearchDocs] Total chunks:', documents.length);
        
        if (documents.length === 0) {
          return JSON.stringify({ 
            message: "No documents with content found. Tell the user they need to add some documentation first!",
            hasDocuments: false 
          });
        }
        
        try {
          // Use NVIDIA NIM embeddings
          const embeddings = getEmbeddings();
          
          console.log('[semanticSearchDocs] Creating vector store with NVIDIA embeddings...');
          vectorStore = await FaissStore.fromDocuments(documents, embeddings);
          vectorStoreCache.set(cacheKey, vectorStore);
          console.log('[semanticSearchDocs] Vector store created successfully!');
        } catch (embedErr) {
          console.error('[semanticSearchDocs] Embeddings error:', embedErr);
          // Return docs directly as fallback
          return JSON.stringify({
            query: query,
            resultsCount: documents.length,
            results: documents.map(doc => ({
              content: doc.pageContent,
              metadata: doc.metadata,
              relevance: "medium"
            })),
            fallback: true
          });
        }
      }
      
      const results = await vectorStore.similaritySearch(query, topK);
      
      console.log('[semanticSearchDocs] Search results:', results.length);
      results.forEach((doc, i) => {
        console.log(`[semanticSearchDocs] Result ${i + 1}:`, doc.pageContent.substring(0, 100), '...');
      });
      
      const formattedResults = results.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        relevance: "high"
      }));
      
      return JSON.stringify({
        query: query,
        resultsCount: formattedResults.length,
        results: formattedResults
      });
      
    } catch (error) {
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: "semanticSearchDocs",
    description: "Search through all documents in a project using semantic similarity. returns the most relevant chunks of information based on the query meaning.",
    schema: z.object({
      query: z.string().describe("The search query or question to find relevant content for"),
      orgId: z.string().describe("The organization ID"),
      projId: z.string().describe("The project ID"),
      topK: z.number().optional().default(5).describe("Number of relevant chunks to return (default: 5)"),
    }),
  }
);

const invalidateVectorStoreCache = (orgId, projId) => {
  const cacheKey = `${orgId}-${projId}`;
  vectorStoreCache.delete(cacheKey);
  embeddingsCache.delete(cacheKey);
};

module.exports = { 
  fetchAllDocs, 
  fetchSingleDocumentContent,
  semanticSearchDocs,
  invalidateVectorStoreCache
};