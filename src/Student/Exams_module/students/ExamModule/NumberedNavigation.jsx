import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const NumberedNavigation = () => {
  const {
    selectedMCQ,
    mcqQuestions,
    codingQuestions,
    mcqIndex,
    setMcqIndex,
    codingIndex,
    setCodingIndex,
  } = useContext(ExamContext);

  const questions = selectedMCQ ? mcqQuestions : codingQuestions;
  const currentIndex = selectedMCQ ? mcqIndex : codingIndex;
  const setIndex = selectedMCQ ? setMcqIndex : setCodingIndex;

  return (
    <div className=" inline-grid grid-flow-col grid-rows-6 gap-2 p-4 w-full mt-4 bg-white rounded-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      {questions.map((item, index) => {
        let bgColor;
        if (index === currentIndex) {
          bgColor = "bg-[#3686FF]";
        } else if (item.markedForReview) {
          bgColor = "bg-[#FF6000]";
        } else if (item.answered) {
          bgColor = "bg-[#129E00]";
        } else {
          bgColor = "bg-[#E1EFFF]";
        }
        return (
          <button
            key={index}
            onClick={() => setIndex(index)}
            className={`${bgColor} text-white rounded-lg w-[64px] h-[64px]`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};
