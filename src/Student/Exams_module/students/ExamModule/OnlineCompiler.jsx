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

  // Instead of holding HTML, we store the array of test-case results
  const [testCases, setTestCases] = useState([]);
  const [testCaseSummary, setTestCaseSummary] = useState(
    existingData[questionId]?.testCaseSummary || { passed: 0, failed: 0 }
  );
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

      // If you’ve saved testCases in existingData, you could restore them here:
      // setTestCases(existingData[questionId]?.testCases || []);
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

      // Compute pass/fail
      const computedResults = results.map((res) => {
        const passed = res.actual_output.trim() === res.expected_output.trim();
        return { ...res, status: passed ? "Passed" : "Failed" };
      });

      // Summarize
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

      // Save in context
      setExistingData((prev) => ({
        ...prev,
        [questionId]: {
          language,
          sourceCode: code,
          customInputEnabled,
          customInput,
          testCaseSummary: summary,
          testCases: computedResults, // store array of test cases
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
        // You can store the testCases array here if needed
      });
    } catch (error) {
      console.error("Error:", error);
      // If you want to display an error test case or something else:
      setTestCases([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-2/3 h-full bg-white rounded-2xl my-4 mx-2 p-6 flex flex-col gap-2">
      {/* Language Selector + Run Button */}
      <div className="flex flex-row items-center gap-4 justify-between">
        <div className="flex flex-row items-center">
          <div>
            <label className="block font-semibold mx-4">Select Language:</label>
          </div>
          <div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className=" border rounded w-full"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-2 text-white text-xl bg-blue-600 rounded hover:bg-blue-700"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* Code Editor */}
      <div className="mb-4">
        <CodeMirror
          value={code}
          height="300px"
          theme={oneDark}
          extensions={[languageExtensions[language]]}
          onChange={handleCodeChange}
        />
      </div>

      {/* Test Summary and Results */}
      <div className="p-2 border rounded bg-white overflow-auto">
        <p className="font-semibold mb-2">
          Test Summary: {testCaseSummary.passed} Passed /{" "}
          {testCaseSummary.failed} Failed
        </p>
        <TestCaseTabs testCases={testCases} />
      </div>
    </div>
  );
};

export default OnlineCompiler;
