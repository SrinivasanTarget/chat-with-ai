import { 
  VectorStoreIndex, 
  Document, 
  serviceContextFromDefaults,
  QueryEngineParamsNonStreaming,
  Response
} from "llamaindex";

async function chatWithPdf(queryText: string): Promise<{
  query: string;
  response: Response;
}> {
  const serviceContext = serviceContextFromDefaults({});

  const retailXContent = `
    RetailX is a pioneering technology company with the existential purpose of transforming 
    traditional retail into intelligent, data-driven experiences. The company's core mission 
    is to revolutionize how businesses interact with customers by providing AI-powered 
    solutions that enhance customer engagement, optimize operations, and drive sustainable 
    growth in the retail sector. RetailX believes in creating seamless, personalized shopping 
    experiences while helping retailers adapt to the rapidly evolving digital landscape.
  `;

  const index = await VectorStoreIndex.fromDocuments(
    [new Document({ text: retailXContent, id_: "retailx_doc" })],
    { serviceContext }
  );

  const queryEngine = index.asQueryEngine();
  const queryParams: QueryEngineParamsNonStreaming = {
    query: queryText
  };
  
  const response = await queryEngine.query(queryParams);
  
  return {
    query: queryText,
    response // Return the full Response object, not just response.response
  };
}

export default chatWithPdf;