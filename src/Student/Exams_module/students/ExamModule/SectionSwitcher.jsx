import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

const SectionSwitcher = () => {
  const { selectedMCQ, setSelectedMCQ, mcqQuestions, codingQuestions } =
    useContext(ExamContext);

  const hasMCQs = mcqQuestions?.length > 0;
  const hasCoding = codingQuestions?.length > 0;

  // If only one section is available, show its title and disable switching
  if (hasMCQs && !hasCoding) {
    return (
      <div className="text-center p-4 font-bold text-lg bg-white shadow-md rounded-xl">
        MCQ Section
      </div>
    );
  }

  if (!hasMCQs && hasCoding) {
    return (
      <div className="text-center p-4 font-bold text-lg bg-white shadow-md rounded-xl">
        Coding Section
      </div>
    );
  }

  return (
    <div className="section-switching flex flex-row justify-evenly items-center bg-white text-center p-4">
      <button
        onClick={() => setSelectedMCQ(true)}
        className={`${
          selectedMCQ
            ? "text-white bg-[#122CD8] hover:bg-[#3f53d4]"
            : "text-black bg-white hover:bg-gray-50 border-black border-[1px]"
        } rounded-xl w-full text-xl p-2 mx-2`}
      >
        MCQ Section
      </button>
      <button
        onClick={() => setSelectedMCQ(false)}
        className={`${
          selectedMCQ
            ? "text-black bg-white hover:bg-gray-50 border-black border-[1px]"
            : "text-white bg-[#122CD8] hover:bg-[#3f53d4]"
        } rounded-xl w-full text-xl p-2 mx-2`}
      >
        Coding Section
      </button>
    </div>
  );
};

export default SectionSwitcher;
