import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const CodingPanel = () => {
  const { codingQuestions, codingIndex } = useContext(ExamContext);
  const currentQuestion = codingQuestions[codingIndex];

  if (!currentQuestion) return null;

  // Safely convert Sample_Output to a string:
  const sampleOutputString = String(currentQuestion.Sample_Output ?? "");

  // Parse the ASCII-art-like output
  const parsedSampleOutput = sampleOutputString
    .replace(/\\s/g, " ") // Replace all \s with an actual space
    .replace(/\\n/g, "\n"); // Replace all \n with a newline

  return (
    <div className="max-w-[583px] min-h-[485px] bg-white rounded-[16px] shadow-[0_4px_12px_0_rgba(3,104,255,0.25)] p-6 mx-auto my-10">
      {/* Display question number + text */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#E1EFFF] w-20 h-16 rounded-[8px] flex items-center justify-center text-xl font-semibold text-blue-800">
          {codingIndex + 1}.
        </div>
        <p className="text-xl md:text-xl font-semibold ">
          {currentQuestion.Question}
        </p>
      </div>
      <hr className="my-3" />

      {/* Constraints */}
      <div className="text-base md:text-lg text-gray-700 space-y-4">
        <div>
          <strong>Constraints:</strong>
          <br />
          {currentQuestion.Constraints}
        </div>

        {/* Sample Input */}
        <div>
          <strong>Sample Input:</strong>
          <br />
          {currentQuestion.Sample_Input}
        </div>

        {/* Sample Output */}
        <div>
          <strong>Sample Output:</strong>
          <br />
          <pre className="text-base p-1 m-1 whitespace-pre-wrap">
            {parsedSampleOutput}
          </pre>
        </div>
      </div>
    </div>
  );
};
