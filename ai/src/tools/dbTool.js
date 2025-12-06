const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { Embeddings } = require("@langchain/core/embeddings");
const docsModel = require("../models/doc");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const { convert } = require('html-to-text');

// Simple custom embeddings using TF-IDF-like approach
class SimpleEmbeddings extends Embeddings {
  constructor() {
    super({});
    this.vocabulary = new Map();
    this.idf = new Map();
  }

  // Build vocabulary from documents
  buildVocabulary(documents) {
    const docCount = documents.length;
    const termDocCount = new Map();

    // Count document frequency for each term
    documents.forEach(doc => {
      const terms = new Set(this.tokenize(doc));
      terms.forEach(term => {
        termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
        if (!this.vocabulary.has(term)) {
          this.vocabulary.set(term, this.vocabulary.size);
        }
      });
    });

    // Calculate IDF
    termDocCount.forEach((count, term) => {
      this.idf.set(term, Math.log(docCount / count));
    });
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  embedQuery(text) {
    return this.embed(text);
  }

  embedDocuments(documents) {
    // Build vocabulary if not already built
    if (this.vocabulary.size === 0) {
      this.buildVocabulary(documents);
    }
    return documents.map(doc => this.embed(doc));
  }

  embed(text) {
    const tokens = this.tokenize(text);
    const vector = new Array(Math.min(this.vocabulary.size, 384)).fill(0);
    
    // TF-IDF calculation
    const termFreq = new Map();
    tokens.forEach(token => {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    });

    termFreq.forEach((freq, term) => {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined && idx < vector.length) {
        const tf = freq / tokens.length;
        const idf = this.idf.get(term) || 1;
        vector[idx] = tf * idf;
      }
    });

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }
}

// Cache for vector stores per organization
const vectorStoreCache = new Map();
const embeddingsCache = new Map();

const fetchAllDocs = tool(
  async ({orgId, projId}) => {
    try {
      const Docs = docsModel(orgId);
      const docs = await Docs.find({ proj: projId }).select('title path visibility _id');
      return JSON.stringify(docs);
    }
    catch (error) {
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: "fetchAllDocs",
    description: "Fetch all documents for a given project in an organization. Returns list of documents with title, path, and visibility.",
    schema: z.object({
      orgId: z.string().describe("The organization database name"),
      projId: z.string().describe("The project ID to fetch documents for"),
    }),
  }
);

const fetchSingleDocumentContent = tool(
  async ({orgId, docId}) => {
    try {
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
      orgId: z.string().describe("The organization database name"),
      docId: z.string().describe("The document ID to fetch content for"),
    }),
  }
);

const semanticSearchDocs = tool(
  async ({orgId, projId, query, topK = 5}) => {
    try {
      const cacheKey = `${orgId}-${projId}`;
      
      let vectorStore = vectorStoreCache.get(cacheKey);
      
      if (!vectorStore) {
        const Docs = docsModel(orgId);
        const docs = await Docs.find({ proj: projId }).select('title deploy _id path');
        
        if (docs.length === 0) {
          return JSON.stringify({ error: "No documents found in this project" });
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
        }
        
        // Create embeddings instance and build vocabulary
        const embeddings = new SimpleEmbeddings();
        embeddings.buildVocabulary(allTexts);
        embeddingsCache.set(cacheKey, embeddings);
        
        vectorStore = await FaissStore.fromDocuments(documents, embeddings);
        vectorStoreCache.set(cacheKey, vectorStore);
      }
      
      const results = await vectorStore.similaritySearch(query, topK);
      
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
    description: "Search through all documents in a project using semantic similarity. This is the BEST tool to use when answering questions about document content. Returns the most relevant chunks of information based on the query meaning.",
    schema: z.object({
      orgId: z.string().describe("The organization database name"),
      projId: z.string().describe("The project ID to search within"),
      query: z.string().describe("The search query or question to find relevant content for"),
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