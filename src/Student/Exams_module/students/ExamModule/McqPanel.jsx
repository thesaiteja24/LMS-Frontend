import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const McqPanel = () => {
  const { mcqQuestions, mcqIndex, updateMcqAnswer } = useContext(ExamContext);
  const currentQuestion = mcqQuestions[mcqIndex];

  return (
    <div className="bg-white flex flex-col gap-4 p-4">
      {/* Question Header */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="bg-[#E1EFFF] p-3 md:p-4 rounded-lg">
            {mcqIndex + 1}.
          </span>
          <span className="bg-[#E1EFFF] flex-1 p-3 md:p-4 rounded-lg break-words">
            {currentQuestion && currentQuestion.Question}
          </span>
        </div>
      </div>

      {/* Options Title */}
      <div className="text-xl md:text-2xl p-4">Options</div>

      {/* Options List */}
      <div className="options flex flex-col gap-2 p-4">
        {currentQuestion &&
          Object.entries(currentQuestion.Options).map(
            ([optionKey, optionValue]) => {
              const isSelected = currentQuestion.answer === optionKey;
              return (
                <label
                  key={optionKey}
                  className={`flex items-center p-2 rounded cursor-pointer w-full sm:w-1/2 md:w-1/3 ${
                    isSelected
                      ? "bg-white shadow-[0px_4px_17px_0px_#0368FF26]"
                      : "bg-[#E1EFFF]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionId}`}
                    value={optionKey}
                    checked={isSelected}
                    onChange={(e) => updateMcqAnswer(mcqIndex, e.target.value)}
                    className="mr-2"
                  />
                  {String(optionKey)}: {optionValue}
                </label>
              );
            }
          )}
      </div>
    </div>
  );
};
