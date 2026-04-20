const express = require("express");
const router = express.Router();
const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage, AIMessage } = require("@langchain/core/messages");
const { semanticSearchDocs } = require("../tools/dbTool");

// Configure LLM
const llm = new ChatOpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  model: "meta/llama-3.1-70b-instruct",
  configuration: {
    baseURL: "https://integrate.api.nvidia.com/v1",
  },
  temperature: 0.7,
});

router.post("/test-agent", async (req, res) => {
  const { question, msgs, orgId, projId } = req.body;
  console.log('Request body:', { question, msgs, orgId, projId });
  
  if (!question) {
    return res.status(400).json({
      ok: false,
      error: "Question is required",
    });
  }

  try {
    // Context is now passed directly to tool calls
    console.log('Context for current request:', { orgId, projId });

    // First, search for relevant documents
    console.log('Calling semantic search...');
    let searchResults = null;
    try {
      const searchResult = await semanticSearchDocs.invoke({ 
        query: question, 
        orgId: orgId || "unknown-org", 
        projId: projId || "unknown-project", 
        topK: 5 
      });
      console.log('Search result:', searchResult);
      searchResults = JSON.parse(searchResult);
    } catch (searchErr) {
      console.error('Search error:', searchErr);
    }

    // Build context from search results
    let contextInfo = "";
    if (searchResults && searchResults.results && searchResults.results.length > 0) {
      contextInfo = "\n\nRelevant information from your documentation:\n";
      searchResults.results.forEach((doc, i) => {
        contextInfo += `\n[Document ${i + 1}]: ${doc.content}\n`;
      });
    } else if (searchResults && searchResults.message) {
      contextInfo = "\n\nNote: " + searchResults.message;
    } else {
      contextInfo = "\n\nNote: No documents found in this project.";
    }

    // Build messages
    let messages = [];
    
    // Add history if provided
    if (Array.isArray(msgs) && msgs.length > 0) {
      msgs.forEach(msg => {
        if (msg.role === "user") messages.push(new HumanMessage(msg.content));
        else if (msg.role === "assistant") messages.push(new AIMessage(msg.content));
      });
    }

    // Add system prompt with context
    const systemPrompt = `You are **Genie** — a fun, witty AI assistant for OnDoc. 

You help users understand their documentation. Be playful, use emojis, and keep responses conversational.

IMPORTANT: Answer based on the context provided below. If no relevant info found, tell the user to add documentation first!${contextInfo}`;

    messages.unshift(new SystemMessage(systemPrompt));
    messages.push(new HumanMessage(question));

    // Call LLM
    console.log('Calling LLM...');
    const response = await llm.invoke(messages);
    const aiResponse = typeof response === 'string' ? response : response.content;

    // Build response messages
    const allMessages = [];
    if (Array.isArray(msgs)) {
      msgs.forEach(msg => allMessages.push(msg));
    }
    allMessages.push({ role: "user", content: question });
    allMessages.push({ role: "assistant", content: aiResponse });

    res.json({
      ok: true,
      messages: allMessages,
    });
  } catch (err) {
    console.error("Agent error:", err);
    console.error("Stack:", err.stack);
    res.status(500).json({
      ok: false,
      error: err.message || "Internal server error",
    });
  }
});

module.exports = router;
