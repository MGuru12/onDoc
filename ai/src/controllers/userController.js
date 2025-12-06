const express = require("express");
const router = express.Router();
const { mainAgent } = require("../agents/mainAgent");
const { HumanMessage, SystemMessage, AIMessage } = require("@langchain/core/messages");

router.post("/test-agent", async (req, res) => {
  const { question, msgs, orgId, projId } = req.body;
  console.log(req.body);
  
  if (!question) {
    return res.status(400).json({
      ok: false,
      error: "Question is required",
    });
  }

  try {
    let messages = [];

    // If msgs is provided and valid, clone it
    if (Array.isArray(msgs) && msgs.length > 0) {
      messages = msgs.map((msg) => {
        if (msg.role === "system") return new SystemMessage(msg.content);
        if (msg.role === "assistant") return new AIMessage(msg.content);
        return new HumanMessage(msg.content);
      });
    } else {
      // Add a default system prompt if none exist
      messages.push(
        new SystemMessage(
          `You are an AI assistant working for organization ${orgId || "unknown-org"} and project ${projId || "unknown-project"}. Respond helpfully and concisely.`
        )
      );
    }

    // Append the new user question
    messages.push(new HumanMessage(question));

    // Invoke the main agent
    const result = await mainAgent.invoke({ messages });

    // Extract assistant response
    const aiResponse = result.messages[result.messages.length - 1].content;

    // Append assistant reply to message list
    messages.push(new AIMessage(aiResponse));

    // Return full updated message list
    res.json({
      ok: true,
      messages: messages.map((m) => ({
        role:
          m instanceof SystemMessage
            ? "system"
            : m instanceof HumanMessage
            ? "user"
            : "assistant",
        content: m.content,
      })),
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
