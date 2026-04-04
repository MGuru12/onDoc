
require("dotenv").config();
const { mainAgent } = require("./src/agents/mainAgent");
const { HumanMessage } = require("@langchain/core/messages");

async function test() {
  console.log("Testing agent...");
  try {
    const result = await mainAgent.invoke({
      messages: [new HumanMessage("hello, what is this documentation about?")]
    });
    console.log("Agent result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test error:", err);
  }
}

test();
