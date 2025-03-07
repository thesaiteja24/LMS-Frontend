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
    <div className="w-1/2 bg-white rounded-2xl flex flex-col gap-4">
      <div className="text-xl md:text-2xl p-4">
        <p>{currentQuestion.Question}</p>
        <hr />
        <br />
        <p>
          <strong>Constraints:</strong>
          <br />
          {currentQuestion.Constraints}
        </p>
        <br />
        <p>
          <strong>Sample Input:</strong>
          <br />
          {currentQuestion.Sample_Input}
        </p>
        <br />
        <div>
          <strong>Sample Output:</strong>
          <br />
          <pre className="text-base p-1 m-1">{parsedSampleOutput}</pre>
        </div>
      </div>
    </div>
  );
};
