const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const fetch = require("node-fetch");

const callExternalApi = tool(
  async ({ endpoint }) => {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(payload),
      });
      const data = await res.json();
      return JSON.stringify(data);
    } catch (error) {
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: "callExternalApi",
    description: "Call external REST API with payload. Returns the API response.",
    schema: z.object({
      endpoint: z.string().describe("API URL endpoint"),
      payload: z.object({}).passthrough().describe("JSON payload for API"),
    }),
  }
);

module.exports = { callExternalApi };