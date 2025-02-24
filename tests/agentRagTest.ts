import chatWithPdf from "../src/chatWithPdf.js"; // Add .js extension

async function runTests() {
  console.log("=== Testing Agentic RAG System ===");

  try {
    // Test 1: Question that should be answerable from PDF content
    console.log("\nTest 1: Question from PDF content");
    const result1 = await chatWithPdf("What is the main topic of the PDF?");
    console.log(`Source: ${result1.source}`);
    console.log(
      `Response: ${
        result1.response
          ? result1.response.substring(0, 200) + "..."
          : "No response"
      }`
    );
    console.log(`Full response object:`, JSON.stringify(result1, null, 2));

    // Test 2: Question requiring external knowledge
    console.log("\nTest 2: Question requiring external knowledge");
    const result2 = await chatWithPdf(
      "What are the latest developments in appium as of 2025?"
    );
    console.log(`Source: ${result2.source}`);
    console.log(
      `Response: ${
        result2.response
          ? result2.response.substring(0, 200) + "..."
          : "No response"
      }`
    );
    console.log(`Full response object:`, JSON.stringify(result2, null, 2));

    // Test 3: Citation test
    if (result2.citations && result2.citations.length > 0) {
      console.log("\nCitations found:");
      result2.citations.forEach((citation, index) => {
        console.log(`Citation ${index + 1}:`);
        console.log(`- Source: ${citation.source}`);
        console.log(`- Text: ${citation.text.substring(0, 100)}...`);
        if (citation.url) console.log(`- URL: ${citation.url}`);
      });
    } else {
      console.log("\nNo high-confidence citations found.");
    }
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("Test execution failed:", error);
  console.error(error.stack);
});
