import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const CodingPanel = () => {
  const { codingQuestions, codingIndex, totalScore } = useContext(ExamContext);
  const currentQuestion = codingQuestions[codingIndex];

  if (!currentQuestion) return null;

  return (
    <div className="w-full bg-white rounded-2xl my-4 mx-2 p-4 flex flex-col gap-4 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="text-2xl p-4">
        <p>{currentQuestion.Question}</p>
        <p>
          <strong>Constraints:</strong> {currentQuestion.Constraints}
        </p>
      </div>
    </div>
  );
};
