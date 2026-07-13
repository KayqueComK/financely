import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(new URL("https://mcp.motion.so/mcp"));
const client = new Client({ name: "mcp-client", version: "1.0.0" }, { capabilities: {} });

async function main() {
  await client.connect(transport);
  console.log("Connected");
  
  // Usually, auth happens via a tool or a custom method?
  // Let's list tools to see if there's an auth tool.
  try {
    const tools = await client.listTools();
    console.log("Tools:", JSON.stringify(tools, null, 2));
  } catch (e) {
    console.log("Error listing tools:", e);
  }
}
main().catch(console.error);
