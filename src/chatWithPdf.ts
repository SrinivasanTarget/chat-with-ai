import { 
  VectorStoreIndex, 
  Document, 
  serviceContextFromDefaults,
  QueryEngineParamsNonStreaming,
  Response,
  SimpleDirectoryReader
} from "llamaindex";
import path from 'path';

async function chatWithPdf(queryText: string): Promise<{
  query: string;
  response: Response;
}> {
  const serviceContext = serviceContextFromDefaults({});

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