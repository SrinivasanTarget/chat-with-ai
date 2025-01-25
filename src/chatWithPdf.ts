import { 
  VectorStoreIndex, 
  serviceContextFromDefaults,
  QueryEngineParamsNonStreaming,
  Response,
  SimpleDirectoryReader,
  OpenAI,
  OpenAIEmbedding
} from "llamaindex";
import path from 'path';

async function chatWithPdf(queryText: string): Promise<{
  query: string;
  response: Response;
}> {

  const serviceContext = serviceContextFromDefaults({
    llm: new OpenAI({
      model: "gpt-4o",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY
    }),
    embedModel: new OpenAIEmbedding({
      model: "text-embedding-3-small",
      apiKey: process.env.OPENAI_API_KEY
    })
  });

  // Load PDF from local directory
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: path.join(process.cwd(), "data"),
  });

  // Create index from the loaded documents
  const index = await VectorStoreIndex.fromDocuments(
    documents,
    { serviceContext }
  );

  const queryEngine = index.asQueryEngine();
  const queryParams: QueryEngineParamsNonStreaming = {
    query: queryText
  };
  
  const response = await queryEngine.query(queryParams);
  
  return {
    query: queryText,
    response
  };
}

export default chatWithPdf;