import { expect } from 'chai';
import chatWithPdf, { getGoogleResults, extractCitations, needsGoogleSearch } from "../chatWithPdf.js";
import { performance } from "perf_hooks";

// Mock timing functions
const startTimer = () => performance.now();
const endTimer = (start: number) => performance.now() - start;

// Metrics object
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

describe("RAG System Metrics", () => {
  const testQueries = [
    "What is RAG architecture?",
    "Latest developments in AI 2024",
    "How does Appium work?",
    "Invalid query that should fail [][]][]",
    "Technical details about machine learning",
  ];

  testQueries.forEach((query) => {
    it(`should measure metrics for query: ${query}`, async () => {
      const startTime = startTimer();

      try {
        const result = await chatWithPdf(query);
        const latency = endTimer(startTime);

        metrics.latency.push(latency);
        metrics.tokenCounts.push(countTokens(result.response));
        metrics.citationCounts.push(result.citations?.length || 0);

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

        expect(result.query).to.equal(query);
        expect(result.response).to.be.a('string').that.is.not.empty;
        expect(latency).to.be.lessThan(30000);
      } catch (error) {
        metrics.errorRates.total++;
        const errorType = error instanceof Error ? error.constructor.name : "Unknown";
        metrics.errorRates.byType[errorType] = (metrics.errorRates.byType[errorType] || 0) + 1;
        throw error;
      }
    });
  });

  after(() => {
    const summary = {
      averageLatency: metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length,
      maxLatency: Math.max(...metrics.latency),
      minLatency: Math.min(...metrics.latency),
      averageTokenCount: metrics.tokenCounts.reduce((a, b) => a + b, 0) / metrics.tokenCounts.length,
      averageCitations: metrics.citationCounts.reduce((a, b) => a + b, 0) / metrics.citationCounts.length,
      sourceMixDistribution: {
        pdfOnly: (metrics.sourceMix.pdfOnly / testQueries.length) * 100,
        combined: (metrics.sourceMix.combined / testQueries.length) * 100,
        error: (metrics.sourceMix.error / testQueries.length) * 100,
      },
      searchSuccessRate: (metrics.searchAttempts.successful / metrics.searchAttempts.total) * 100,
      errorRate: (metrics.errorRates.total / testQueries.length) * 100,
      errorDistribution: metrics.errorRates.byType,
    };

    console.log("RAG System Metrics Summary:", JSON.stringify(summary, null, 2));
  });
});

describe("Search Component", () => {
  it("should test Google search fallback behavior", async () => {
    const startTime = startTimer();
    const results = await getGoogleResults("test query");
    const latency = endTimer(startTime);

    expect(results).to.be.an('array');
    expect(results.length).to.be.at.most(3);
    expect(latency).to.be.lessThan(5000);
  });
});

describe("Citation Extraction", () => {
  it("should test citation extraction accuracy", () => {
    const testText = "Recent study (Smith et al. 2024) shows progress. Another paper (Jones 2023) confirms.";
    const citations = extractCitations(testText, "pdf");

    expect(citations).to.be.an('array').with.length(2);
    expect(citations[0].confidence).to.be.greaterThan(0.6);
  });
});

describe("Response Quality", () => {
  it("should check response coherence", async () => {
    const result = await chatWithPdf("What is RAG?");

    expect(result.response).to.have.length.greaterThan(100);
    expect(needsGoogleSearch(result.response)).to.be.false;
    
    if (result.citations) {
      expect(result.citations.some(c => c.confidence > 0.8)).to.be.true;
    }
  });
}); 