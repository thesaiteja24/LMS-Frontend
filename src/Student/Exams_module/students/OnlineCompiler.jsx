import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";

/**
 * Displays an editor, language selector, custom input, and a "Run" button.
 * On "Run", calls the backend with the user's code, then shows test results
 * (including hidden test case pass/fail).
 */
const OnlineCompiler = ({ question, existingData = {}, onRun = () => {} }) => {
  // We track the question ID so that if the user navigates to a new question,
  // we reset local states from `existingData`.
  const [currentQuestionId, setCurrentQuestionId] = useState(
    question.question_id
  );

  // Local states for the code editor
  const [language, setLanguage] = useState(
    existingData.language || "JavaScript"
  );
  const [code, setCode] = useState(existingData.sourceCode || "");
  const [customInputEnabled, setCustomInputEnabled] = useState(
    existingData.customInputEnabled || false
  );
  const [customInput, setCustomInput] = useState(
    existingData.customInput || ""
  );
  const [output, setOutput] = useState(existingData.output || "");
  const [testCaseSummary, setTestCaseSummary] = useState(
    existingData.testCaseSummary || { passed: 0, failed: 0 }
  );
  const [loading, setLoading] = useState(false);

  const languageExtensions = {
    JavaScript: javascript(),
    Python: python(),
    Java: java(),
  };

  /**
   * If the user navigates to a *different* question, reset local state
   * from the parent's existingData for that question.
   */
  useEffect(() => {
    if (question.question_id !== currentQuestionId) {
      setCurrentQuestionId(question.question_id);
      setLanguage(existingData.language || "JavaScript");
      setCode(existingData.sourceCode || "");
      setCustomInputEnabled(existingData.customInputEnabled || false);
      setCustomInput(existingData.customInput || "");
      setOutput(existingData.output || "");
      setTestCaseSummary(
        existingData.testCaseSummary || { passed: 0, failed: 0 }
      );
      setLoading(false);
    }
  }, [question.question_id, existingData, currentQuestionId]);

  const handleRun = async () => {
    setLoading(true);

    // Build your request payload
    const bodyData = {
      question_id: question.question_id,
      source_code: code,
      language,
      custom_input_enabled: customInputEnabled,
      custom_input: customInput,
      constraints: question.constraints,
      description: question.description,
      difficulty: question.difficulty,
      hidden_test_cases: question.hidden_test_cases,
      sample_input: question.sample_input,
      sample_output: question.sample_output,
      score: question.score,
      type: question.type,
    };

    console.log("Payload to backend:", bodyData);

    try {
      // Replace with your actual endpoint
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { message, results } = await response.json();
      console.log("Backend Response:", { message, results });

      // Compute status for each test case by comparing expected and actual outputs.
      const computedResults = results.map((result) => {
        const status =
          typeof result.status === "string"
            ? result.status
            : result.actual_output.trim() === result.expected_output.trim()
            ? "Passed"
            : "Failed";
        return { ...result, status };
      });

      // Summarize test results using the computed status values.
      const summary = computedResults.reduce(
        (acc, result) => {
          if (result.status === "Passed") {
            acc.passed++;
          } else {
            acc.failed++;
          }
          return acc;
        },
        { passed: 0, failed: 0 }
      );
      setTestCaseSummary(summary);

      // Build an HTML snippet for the output
      let outputHtml = computedResults
        .map((result, index) => {
          if (result.type === "hidden") {
            // For hidden tests, show minimal info
            return `
              <div style="margin-bottom: 10px;">
                <h4>Hidden Test Case ${index + 1}: ${result.status}</h4>
              </div>
            `;
          } else {
            // For sample tests, show full info
            return `
              <div style="margin-bottom: 10px;">
                <h4>Test Case ${index + 1}: ${result.status}</h4>
                <p><strong>Input:</strong> ${result.input}</p>
                <p><strong>Expected Output:</strong> ${
                  result.expected_output
                }</p>
                <p><strong>Your Output:</strong> ${result.actual_output}</p>
              </div>
            `;
          }
        })
        .join("");

      setOutput(outputHtml);

      // Notify parent so it can store updated code/language/summary in `responses`
      onRun({
        language,
        sourceCode: code,
        customInputEnabled,
        customInput,
        testCaseSummary: summary,
        output: outputHtml,
      });
    } catch (error) {
      console.error("Error:", error);
      setOutput("An error occurred while processing your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl my-4 mx-2 p-6 flex flex-col gap-2 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      {/* Language Select */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
        </select>
      </div>

      {/* Editor */}
      <div className="mb-4">
        <CodeMirror
          value={code}
          height="300px"
          theme={oneDark}
          extensions={[languageExtensions[language]]}
          onChange={(val) => setCode(val)}
        />
      </div>

      {/* Custom Input */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={customInputEnabled}
            onChange={() => setCustomInputEnabled((prev) => !prev)}
          />
          <span className="font-semibold">Enable Custom Input</span>
        </label>
        {customInputEnabled && (
          <textarea
            rows={4}
            className="w-full mt-2 p-2 border rounded"
            placeholder="Enter custom input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
        )}
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        {loading ? "Running..." : "Run"}
      </button>

      {/* Results */}
      <div className="mt-4 p-2 border rounded bg-white">
        <p className="font-semibold mb-2">
          Test Summary: {testCaseSummary.passed} Passed /{" "}
          {testCaseSummary.failed} Failed
        </p>
        <div
          dangerouslySetInnerHTML={{ __html: output }}
          style={{ maxHeight: "150px", overflowY: "auto" }}
        />
      </div>
    </div>
  );
};

export default OnlineCompiler;
