import {
  FaithfulnessEvaluator, 
  CorrectnessEvaluator, //
  RelevancyEvaluator,
} from "llamaindex";
import chatWithPdf from "../src/chatWithPdf.js";
import assert from "assert";

async function main() {
  const faithfulness = new FaithfulnessEvaluator();
  const correctness = new CorrectnessEvaluator();
  const relevancy = new RelevancyEvaluator();

  const res = await chatWithPdf("What is the existential purpose of RetailX?");

  console.log("Query:", res.query);
  console.log("Response:", res.response);

  const faithfulnessResult = await faithfulness.evaluateResponse({
    query: res.query,
    response: res.response // Now passing the full Response object
  });
  
  console.log("Faithfulness Score:", faithfulnessResult.score);
  console.log("Faithfulness Passing:", faithfulnessResult.passing);

  const correctnessResult = await correctness.evaluateResponse({
    query: res.query,
    response: res.response
  });
  
  console.log("Correctness Score:", correctnessResult.score);

  const relevancyResult = await relevancy.evaluateResponse({
    query: res.query,
    response: res.response
  });
  
  console.log("Relevancy Score:", relevancyResult.score);

  assert(
    faithfulnessResult.score > 0.5,
    `Faithfulness score (${faithfulnessResult.score}) should be > 0.5`
  );
  assert(
    faithfulnessResult.passing === true,
    `Faithfulness check should pass`
  );
  assert(
    correctnessResult.score > 0.5,
    `Correctness score (${correctnessResult.score}) should be > 0.5`
  );
  assert(
    relevancyResult.score > 0.5,
    `Relevancy score (${relevancyResult.score}) should be > 0.5`
  );
}

void main().catch(error => {
  console.error("Test failed:", error);
  process.exit(1);
});