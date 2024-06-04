import { OpenAI, VectorStoreIndex, Settings } from "llamaindex";
import { SimpleDirectoryReader } from "llamaindex/readers/SimpleDirectoryReader";

Settings.llm = new OpenAI({ model: "gpt-4-turbo", temperature: 0.5 });
async function main() {
  const reader = new SimpleDirectoryReader();
  const documents = await reader.loadData("./data");
  const index = await VectorStoreIndex.fromDocuments(documents);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What is existential purpose of RetailX?",
  });

  console.log(response.toString());
}

main().catch(console.error);
