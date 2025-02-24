import { performance } from "perf_hooks";
import chatWithPdf, {
  extractCitations,
  getGoogleResults,
  needsGoogleSearch,
} from "../src/chatWithPdf.js";
import {
  FaithfulnessEvaluator,
  CorrectnessEvaluator,
  RelevancyEvaluator,
} from "llamaindex";
import { expect } from "chai";

// Mock timing functions
const startTimer = () => performance.now();
const endTimer = (start: number) => performance.now() - start;

describe("RAG System Metrics", () => {
  // Track metrics for each test run
  const metrics = {
    latency: [] as number[],
    tokenCounts: [] as number[],
    citationCounts: [] as number[],
    sourceMix: {
      pdfOnly: 0,
      webOnly: 0,
      combined: 0,
      error: 0,
    },
    searchAttempts: {
      total: 0,
      successful: 0,
    },
    errorRates: {
      total: 0,
      byType: {} as Record<string, number>,
    },
  };

  // Helper to count tokens (rough estimation)
  const countTokens = (text: string): number => {
    return text.split(/\s+/).length;
  };

  // Test cases with different query types
  const testQueries = [
    "What is RAG architecture?",
    "Latest developments in AI 2024",
    "How does Appium work?",
    "Invalid query that should fail [][]][]",
    "Technical details about machine learning",
  ];

  // Run tests for each query
  testQueries.forEach((query) => {
    it(`Measure metrics for query: ${query}`, async () => {
      const startTime = startTimer();

      try {
        const result = await chatWithPdf(query);
        const latency = endTimer(startTime);

        // Record latency
        metrics.latency.push(latency);

        // Record token counts
        metrics.tokenCounts.push(countTokens(result.response));

        // Record citation counts
        metrics.citationCounts.push(result.citations?.length || 0);

        // Record source mix
        switch (result.source) {
          case "PDF only":
            metrics.sourceMix.pdfOnly++;
            break;
          case "PDF + Google":
            metrics.sourceMix.combined++;
            metrics.searchAttempts.successful++;
            break;
          case "Error":
            metrics.sourceMix.error++;
            break;
        }
        metrics.searchAttempts.total++;

        // Basic assertions
        expect(result.query).to.equal(query);
        expect(result.response).to.be.ok;
        expect(latency).to.be.lessThan(30000); // 30s timeout
      } catch (error) {
        metrics.errorRates.total++;
        const errorType =
          error instanceof Error ? error.constructor.name : "Unknown";
        metrics.errorRates.byType[errorType] =
          (metrics.errorRates.byType[errorType] || 0) + 1;
        throw error;
      }
    });
  });

  // After all tests, log metrics summary
  after(() => {
    const summary = {
      averageLatency:
        metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length,
      maxLatency: Math.max(...metrics.latency),
      minLatency: Math.min(...metrics.latency),
      averageTokenCount:
        metrics.tokenCounts.reduce((a, b) => a + b, 0) /
        metrics.tokenCounts.length,
      averageCitations:
        metrics.citationCounts.reduce((a, b) => a + b, 0) /
        metrics.citationCounts.length,
      sourceMixDistribution: {
        pdfOnly: (metrics.sourceMix.pdfOnly / testQueries.length) * 100,
        combined: (metrics.sourceMix.combined / testQueries.length) * 100,
        error: (metrics.sourceMix.error / testQueries.length) * 100,
      },
      searchSuccessRate:
        (metrics.searchAttempts.successful / metrics.searchAttempts.total) *
        100,
      errorRate: (metrics.errorRates.total / testQueries.length) * 100,
      errorDistribution: metrics.errorRates.byType,
    };

    console.log(
      "RAG System Metrics Summary:",
      JSON.stringify(summary, null, 2)
    );
  });
});

// Test specific components
describe("Search Component Metrics", () => {
  it("Google search fallback behavior", async () => {
    const startTime = startTimer();
    const results = await getGoogleResults("test query");
    const latency = endTimer(startTime);

    expect(results.length).to.be.lessThanOrEqual(3);
    expect(latency).to.be.lessThan(5000); // 5s timeout
  });
});

describe("Citation Extraction Metrics", () => {
  it("Citation extraction accuracy", () => {
    const testText =
      "Recent study (Smith et al. 2024) shows progress. Another paper (Jones 2023) confirms.";
    const citations = extractCitations(testText, "pdf");

    expect(citations.length).to.equal(2);
    expect(citations[0].confidence).to.be.greaterThan(0.6);
  });
});

describe("Response Quality Metrics", () => {
  it("Response coherence check", async () => {
    const result = await chatWithPdf("What is RAG?");

    // Check response length
    expect(result.response.length).to.be.greaterThan(100);
    // Check for hallucination indicators
    expect(needsGoogleSearch(result.response)).to.be.false;

    // Check citation quality
    if (result.citations) {
      expect(result.citations.some((c) => c.confidence > 0.8)).to.be.true;
    }
  });
});

describe.only("Response Evaluation Metrics", () => {
  const faithfulness = new FaithfulnessEvaluator();
  const correctness = new CorrectnessEvaluator();
  const relevancy = new RelevancyEvaluator();

  // Reference the test queries defined earlier
  const testQueries = [
    // "What is RAG architecture?",
    "Latest developments in Appium 2025",
    // "How does Appium work?",
    // "Technical details about machine learning",
  ];

  it("Response quality evaluation", async () => {
    const query = "What is RAG architecture?";
    const result = await chatWithPdf(query);

    // Track evaluation scores
    const scores = {
      faithfulness: await faithfulness.evaluate({
        response: result.response,
        query: query,
      }),
      correctness: await correctness.evaluate({
        response: result.response,
        query: query,
      }),
      relevancy: await relevancy.evaluate({
        response: result.response,
        query: query,
      }),
    };
    // Basic quality thresholds
    expect(scores.faithfulness.score).to.be.greaterThan(0.7);
    expect(scores.correctness.score).to.be.greaterThan(0.75);
    expect(scores.relevancy.score).to.be.greaterThan(0.75);

    // Log evaluation results
    console.log(
      "Response Quality Evaluation:",
      JSON.stringify(scores, null, 2)
    );
  });

  it.only("Response evaluation across multiple queries", async () => {
    const evaluationMetrics = {
      faithfulness: [] as number[],
      correctness: [] as number[],
      relevancy: [] as number[],
    };

    for (const query of testQueries) {
      try {
        const result = await chatWithPdf(query);

        const [faithfulnessScore, correctnessScore, relevancyScore] =
          await Promise.all([
            faithfulness.evaluate({
              response: result.response,
              query: query,
            }),
            correctness.evaluate({
              response: result.response,
              query: query,
            }),
            relevancy.evaluate({
              response: result.response,
              query: query,
            }),
          ]);

        evaluationMetrics.faithfulness.push(faithfulnessScore.score);
        evaluationMetrics.correctness.push(correctnessScore.score);
        evaluationMetrics.relevancy.push(relevancyScore.score);
      } catch (error) {
        console.error(`Evaluation failed for query "${query}":`, error);
        // Push null or default values to maintain array length
        evaluationMetrics.faithfulness.push(0);
        evaluationMetrics.correctness.push(0);
        evaluationMetrics.relevancy.push(0);
      }
    }

    // Calculate averages
    const summary = {
      averageFaithfulness:
        evaluationMetrics.faithfulness.reduce((a, b) => a + b, 0) /
        testQueries.length,
      averageCorrectness:
        evaluationMetrics.correctness.reduce((a, b) => a + b, 0) /
        testQueries.length,
      averageRelevancy:
        evaluationMetrics.relevancy.reduce((a, b) => a + b, 0) /
        testQueries.length,
    };

    console.log(summary);

    // Quality thresholds for averages
    expect(summary.averageFaithfulness).to.be.greaterThan(0.7);
    expect(summary.averageCorrectness).to.be.greaterThan(0.75);
    expect(summary.averageRelevancy).to.be.greaterThan(0.75);

    console.log(
      "Average Evaluation Metrics:",
      JSON.stringify(summary, null, 2)
    );
  });
});
