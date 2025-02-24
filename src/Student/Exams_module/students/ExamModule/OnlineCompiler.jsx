import React, { useState, useEffect, useContext } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { ExamContext } from "./ExamContext";
import TestCaseTabs from "../TestCaseTabs";

const OnlineCompiler = () => {
  const {
    onlineCompilerQuestion,
    existingData,
    setExistingData,
    updateCodingAnswer,
  } = useContext(ExamContext);

  const question = onlineCompilerQuestion || { question_id: null };
  const questionId = question.question_id;

  // Track language, code, custom input states
  const [language, setLanguage] = useState(
    existingData[questionId]?.language || "JavaScript"
  );
  const [code, setCode] = useState(existingData[questionId]?.sourceCode || "");
  const [customInputEnabled, setCustomInputEnabled] = useState(
    existingData[questionId]?.customInputEnabled || false
  );
  const [customInput, setCustomInput] = useState(
    existingData[questionId]?.customInput || ""
  );

  // For normal test results (sample/hidden), we track pass/fail
  const [testCases, setTestCases] = useState([]);
  const [testCaseSummary, setTestCaseSummary] = useState(
    existingData[questionId]?.testCaseSummary || { passed: 0, failed: 0 }
  );

  // For custom input results
  const [customTestCases, setCustomTestCases] = useState([]);

  const [loading, setLoading] = useState(false);

  const languageExtensions = {
    JavaScript: javascript(),
    Python: python(),
    Java: java(),
  };

  // Sync with existingData each time questionId changes
  useEffect(() => {
    if (questionId) {
      setLanguage(existingData[questionId]?.language || "JavaScript");
      setCode(existingData[questionId]?.sourceCode || "");
      setCustomInputEnabled(
        existingData[questionId]?.customInputEnabled || false
      );
      setCustomInput(existingData[questionId]?.customInput || "");
      setTestCaseSummary(
        existingData[questionId]?.testCaseSummary || { passed: 0, failed: 0 }
      );

      // If you saved them previously, you could restore testCases/customTestCases here
      // setTestCases(existingData[questionId]?.testCases || []);
      // setCustomTestCases(existingData[questionId]?.customTestCases || []);
    }
  }, [questionId, existingData]);

  // Auto-save code to context
  const handleCodeChange = (val) => {
    setCode(val);
    setExistingData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        sourceCode: val,
      },
    }));
  };

  // Save the selected language
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setExistingData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        language: lang,
      },
    }));
  };

  // Run code and parse test-case results
  const handleRun = async () => {
    setLoading(true);

    const bodyData = {
      question_id: questionId,
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

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { results } = await response.json();

      // Separate results into normal vs. custom
      const normalResults = results.filter((r) => r.type !== "custom");
      const customResults = results.filter((r) => r.type === "custom");

      // Compute pass/fail only for normal results
      const computedResults = normalResults.map((res) => {
        // If there's no expected output (like hidden tests sometimes),
        // you might handle that differently, but here is a basic check:
        const passed =
          res.expected_output?.trim() === res.actual_output?.trim();
        return { ...res, status: passed ? "Passed" : "Failed" };
      });

      const summary = computedResults.reduce(
        (acc, cur) => {
          if (cur.status === "Passed") acc.passed++;
          else acc.failed++;
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      setTestCaseSummary(summary);
      setTestCases(computedResults);
      setCustomTestCases(customResults);

      // Save in context
      setExistingData((prev) => ({
        ...prev,
        [questionId]: {
          language,
          sourceCode: code,
          customInputEnabled,
          customInput,
          testCaseSummary: summary,
          testCases: computedResults,
          customTestCases: customResults,
          answered: true,
        },
      }));

      // Update coding answer for final exam submission
      updateCodingAnswer({
        questionId,
        sourceCode: code,
        language,
        testCaseSummary: summary,
        answered: true,
        // If you need them: testCases: computedResults, customTestCases: customResults
      });
    } catch (error) {
      console.error("Error:", error);
      setTestCases([]);
      setCustomTestCases([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-2/3 xl:w-1/2 mx-auto m-2 bg-white rounded-2xl flex flex-col gap-4 p-4">
      {/* Language Selector + Run Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="block font-semibold">Select Language:</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
          </select>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-2 text-white text-lg bg-blue-600 rounded hover:bg-blue-700 self-end sm:self-auto"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* Code Editor */}
      <div className="border rounded overflow-hidden">
        <CodeMirror
          value={code}
          height="300px"
          theme={oneDark}
          extensions={[languageExtensions[language]]}
          onChange={handleCodeChange}
        />
      </div>

      {/* Custom Input */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center space-x-2 font-semibold">
          <input
            type="checkbox"
            checked={customInputEnabled}
            onChange={() => setCustomInputEnabled((prev) => !prev)}
          />
          <span>Enable Custom Input</span>
        </label>
        {customInputEnabled && (
          <textarea
            rows={1src/Student/Exams_module/students/ExamModule/OnlineCompiler.jsx}
            className="w-full p-2 border rounded"
            placeholder="Enter custom input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
        )}
      </div>

      {/* Normal Test Summary & Results */}
      {customInputEnabled ? (
        <div className="p-2 border rounded bg-white">
          <p className="font-semibold mb-2">Custom Input Results</p>
          {customTestCases.length === 0 ? (
            <p className="text-sm">No custom input results yet.</p>
          ) : (
            <TestCaseTabs testCases={customTestCases} />
          )}
        </div>
      ) : (
        <div className="p-2 border rounded bg-white">
          <p className="font-semibold mb-2">
            Normal Test Summary: {testCaseSummary.passed} Passed /{" "}
            {testCaseSummary.failed} Failed
          </p>
          {testCases.length === 0 ? (
            <p className="text-sm">No normal test cases to display.</p>
          ) : (
            <TestCaseTabs testCases={testCases} />
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineCompiler;
