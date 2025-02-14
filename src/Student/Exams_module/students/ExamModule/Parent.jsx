import React, { useContext } from "react";
import { ExamProvider, ExamContext } from "./ExamContext";
import QNavigation from "./QNavigation";
import { ExamLegend } from "./ExamLegend";
import { DisplayMCQ } from "./DisplayMCQ";
import { DisplayCoding } from "./DisplayCoding";
import { NavigationMCq } from "./NavigationMCQ";
import { NavigationCoding } from "./NavigationCoding";

const ExamContent = () => {
  const {
    selectedMCQ,
    codingQuestions,
    handleSubmit,
    studentName,
    studentExamId,
  } = useContext(ExamContext);

  return (
    <div className="min-h-screen h-full parent bg-[#E1EFFF] flex flex-col justify-evenly">
      <div className="stuent-n-exam-details">
        <div className="flex flex-row justify-evenly">
          <div className="flex flex-row justify-evenly items-centerst test-details bg-white w-full mt-2 ml-2 mr-0.5 MCQ_Stats rounded-2xl text-center p-4 text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
            <span>
              <img src="ExamModule/Exam.png" alt="" />{" "}
            </span>
            <span>Daily Test</span>
          </div>
          <div className="student-details flex flex-row justify-evenly items-center bg-white w-full mt-2 mr-2 ml-0.5 MCQ_Stats rounded-2xl text-center p-4 text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
            <div className="flex flex-col justify-start items-start">
              <div>{studentName}</div>
              <div className="text-sm"><b>Exam Id: &nbsp;</b>{studentExamId}</div>
            </div>
            <div className="flex flex-row gap-4 justify-evenly items-center answered">
              <button
                type="button"
                onClick={handleSubmit}
                className="text-white bg-[#ED1334] w-48 h-12 rounded-lg font-normal text-xl"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mcq-n-coding-section">
        {!selectedMCQ && codingQuestions.length > 0 ? (
          <div className="flex flex-row">
            <DisplayCoding />
            <NavigationCoding />
          </div>
        ) : (
          <div className="flex flex-row">
            <DisplayMCQ />
            <NavigationMCq />
          </div>
        )}
      </div>
      <div className="nav-n-legend flex flex-row gap-4 justify-evenly items-center">
        <div className="w-full mx-4">
          <QNavigation />
          <ExamLegend />
        </div>
        <div className="bg-white flex items-center rounded-2xl mx-4 p-7">
          <img src="ExamModule/Logo.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export const Parent = () => {
  return (
    <ExamProvider>
      <ExamContent />
    </ExamProvider>
  );
};

export default Parent;
