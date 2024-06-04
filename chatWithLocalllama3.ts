import { Ollama } from "llamaindex";

async function main() {
  const llm = new Ollama({ model: "llama3" });

  const response = await llm.chat({
    messages: [{ content: "whats up", role: "user" }],
  });
  console.log(`Response is: ${response.message.content}`);
}

main().catch(console.error);
