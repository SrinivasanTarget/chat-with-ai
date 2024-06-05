import {
  FaithfulnessEvaluator,
  CorrectnessEvaluator,
  RelevancyEvaluator,
} from "llamaindex";
import chatWithPdf from "../src/chatWithPdf";
import assert from "assert";

async function main() {
  const failthfulness = new FaithfulnessEvaluator();
  const correctness = new CorrectnessEvaluator();
  const relevancy = new RelevancyEvaluator();

  const res = await chatWithPdf("What is existential purpose of RetailX?");

  const failthfulnessResult = await failthfulness.evaluateResponse({
    query: res.query,
    response: res.response,
  });
  const correctnessResult = await correctness.evaluateResponse({
    query: res.query,
    response: res.response,
  });
  const relevancyResult = await relevancy.evaluateResponse({
    query: res.query,
    response: res.response,
  });

  assert(failthfulnessResult.score > 0.5);
  assert(failthfulnessResult.passing === true);
  assert(correctnessResult.score > 0.5);
  assert(relevancyResult.score > 0.5);
}

void main();
