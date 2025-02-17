import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const CodingPanel = () => {
  const { codingQuestions, codingIndex, totalScore } = useContext(ExamContext);
  const currentQuestion = codingQuestions[codingIndex];

  if (!currentQuestion) return null;

  return (
    <div className="w-1/3 bg-white rounded-2xl my-4 mx-2 p-4 flex flex-col gap-4 ">
      <div className="text-2xl p-4">
        <p>{currentQuestion.Question}</p>
        <p>
          <strong>Constraints:</strong> {currentQuestion.Constraints}
        </p>
      </div>
    </div>
  );
};
