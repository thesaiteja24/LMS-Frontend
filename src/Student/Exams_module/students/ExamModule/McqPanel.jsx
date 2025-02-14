import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const McqPanel = () => {
  const { mcqQuestions, mcqIndex, updateMcqAnswer } =
    useContext(ExamContext);
  const currentQuestion = mcqQuestions[mcqIndex];

  const handleOptionChange = (e) => {
    updateMcqAnswer(mcqIndex, e.target.value);
  };

  return (
    <div className="bg-white flex flex-col gap-4 ">
      <div className="text-2xl p-4">
        <span className="bg-[#E1EFFF] p-4 rounded-lg">{`${
          mcqIndex + 1
        }.`}</span>
        <span className="bg-[#E1EFFF] mx-2 p-4 rounded-lg">
          {currentQuestion && currentQuestion.Question}
        </span>
      </div>
      <div className="text-2xl p-4">Options</div>
      <div className="options flex flex-col gap-2 p-4">
        {currentQuestion &&
          Object.entries(currentQuestion.Options).map(
            ([optionKey, optionValue]) => {
              const isSelected = currentQuestion.answer === optionKey;
              return (
                <label
                  key={optionKey}
                  className={`flex items-center p-2 rounded cursor-pointer w-1/3  ${
                    isSelected
                      ? "bg-white shadow-[0px_4px_17px_0px_#0368FF26]"
                      : "bg-[#E1EFFF]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionId}`}
                    value={optionKey} // use the key instead of the option text
                    checked={isSelected}
                    onChange={(e) => updateMcqAnswer(mcqIndex, e.target.value)}
                    className="mr-2"
                  />
                  {optionKey}: {optionValue}
                </label>
              );
            }
          )}
      </div>
    </div>
  );
};
