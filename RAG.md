## What's Retrieval Augmented Generation (RAG)?

RAG is a technique for augmenting LLM knowledge with additional data.

- LLMs have broad reasoning capabilities but limited knowledge scope
- Knowledge cutoff: trained on public data up to a specific date
- Limitations: can't reason about private data or post-cutoff information
- Solution: Retrieval Augmented Generation (RAG)

## RAG process:

- Retrieve relevant information
- Insert into model prompt
- Augment LLM's knowledge for specific tasks
- Generate more accurate and relevant responses

![alt text](<_avichawla - 1880141212365255134.gif>)

Credits: Avi Chawla

Example:

| Query                                                                | Response                                                                                                             | Source                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What battles took place in New York City in the American Revolution? | The Battle of Long Island was the largest battle of the American Revolutionary War that took place in New York City. | === American Revolution === The Stamp Act Congress met in New York in October 1765, as the Sons of Liberty organization emerged in the city and skirmished over the next ten years with British troops stationed there. The Battle of Long Island, the largest battle of the American |

# Retrieval Augmented Generation Metrics

- Faithfulness // Maps response to Source - Hallucination
- Similarity // correctness of a generated answer against a reference answer
- Response Relevancy // Response & Source related to query
- Context Precision // Relevant chunks in the retrieved_contexts
- Context Recall // Fewer relevant documents were left out.
- Context Entities Recall
- Noise Sensitivity // Wrong information

# Agentic RAGS:

![alt text](<_avichawla - 1880141232091115590-1.gif>)

Credits: Avi Chawla
