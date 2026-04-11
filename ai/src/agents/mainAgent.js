// agent.js
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { ChatOpenAI } = require("@langchain/openai");

// Import custom tools
const {
  fetchAllDocs,
  fetchSingleDocumentContent,
  semanticSearchDocs,
} = require("../tools/dbTool");

/**
 * Configure the LLM (Large Language Model)
 * Using NVIDIA NIM (Microservices) with Meta's Llama 3.1 70B
 * Fallback to GROQ if NVIDIA fails
 */
let llm;
const useGroq = process.env.USE_GROQ === 'true';

if (useGroq) {
  console.log('[Agent] Using GROQ API');
  llm = new ChatOpenAI({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-70b-versatile",
    configuration: {
      baseURL: "https://api.groq.com/openai/v1",
    },
    temperature: 0.7,
  });
} else {
  console.log('[Agent] Using NVIDIA NIM API');
  llm = new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    model: "meta/llama-3.1-70b-instruct",
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    temperature: 0.7,
  });
}

/**
 * 🧠 TOOL LOGIC: How Genie should think when choosing what to call
 * 
 * 1. 🔍 semanticSearchDocs → FIRST and FOREVER priority.
 *    - When user asks *any* question that might relate to docs’ content or meaning.
 *    - Example: “What does the onboarding doc say about admins?”
 *    - Genie calls this first to look smart (it searches semantically, not literally).
 * 
 * 2. 📋 fetchAllDocs → Use when user wants to *see what’s available*.
 *    - Example: “Show me all my docs” / “What files do I have?” / “List my stuff.”
 *    - Genie lists titles (never internal IDs).
 * 
 * 3. 📄 fetchSingleDocumentContent → Use when user asks to *read a specific doc*.
 *    - Example: “Open the privacy policy” or “Show me the details of Marketing Plan.”
 *    - Only called when semantic search or listing can’t fully answer.
 * 
 * The tools are ordered by priority — Genie tries them in this order depending on context.
 */

const tools = [
  semanticSearchDocs,          // 🧠 Smart doc search — first and favorite
  fetchAllDocs,                // 📋 List available docs — when user asks “what do I have?”
  fetchSingleDocumentContent,  // 📄 Get a doc’s content — when user wants one opened
];

/**
 * 🎭 System Persona: "Genie" — your chaotic, brilliant, brutally honest digital bestie
 * This defines Genie's tone, style, and emotional chaos.
 */
const systemMessage = `
You are **Genie** — fun, witty, and chaotic.

**CRITICAL RULE: ALWAYS call semanticSearchDocs first for ANY question.**
The system already knows which org/project to search. Just call the tool with the query!

If no documents are found, tell the user fun-style to add some docs first!

Talk like a fun best friend - not robotic. Use emojis sometimes. Be playful but helpful.
`;


/**
 * ⚙️ Create the main agent with Genie’s personality, smarts, and tools
 */
const mainAgent = createReactAgent({
  llm,
  tools,
  messageModifier: systemMessage,
});

module.exports = { mainAgent };
