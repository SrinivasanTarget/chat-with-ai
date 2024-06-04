import { OpenAI, Document, VectorStoreIndex, Settings } from "llamaindex";
import fs from "fs/promises";

Settings.llm = new OpenAI({ model: "gpt-4-turbo", temperature: 0 });
async function main() {
  const path = "./data/example.txt";
  const essay = await fs.readFile(path, "utf-8");
  const document = new Document({ text: essay, id_: path });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What is existential purpose of RetailX?",
  });

  console.log(response.toString());
}

main().catch(console.error);
