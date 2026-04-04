
require('dotenv').config({ path: 'd:/Guru/new projects/onDoc/ai/.env' });
const { ChatOpenAI } = require("@langchain/openai");

async function testNIM() {
  const llm = new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    model: "meta/llama-3.1-70b-instruct",
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    temperature: 0.3,
  });

  try {
    console.log("Sending request to NVIDIA NIM...");
    const response = await llm.invoke("Hello, who are you?");
    console.log("Response:", response.content);
  } catch (error) {
    console.error("Error from NVIDIA NIM:", error);
  }
}

testNIM();
