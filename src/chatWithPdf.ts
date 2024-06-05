import { OpenAI, VectorStoreIndex, Settings } from "llamaindex";
import { SimpleDirectoryReader } from "llamaindex/readers/SimpleDirectoryReader";

Settings.llm = new OpenAI({ model: "gpt-4-turbo", temperature: 0.5 });
async function chatWithPdf(query: string) {
  const reader = new SimpleDirectoryReader();
  const documents = await reader.loadData("./data");
  const index = await VectorStoreIndex.fromDocuments(documents);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query,
  });

  console.log(response.toString());
  return { query: query, response: response };
}

chatWithPdf("What is existential purpose of RetailX?").catch(console.error);

export default chatWithPdf;
