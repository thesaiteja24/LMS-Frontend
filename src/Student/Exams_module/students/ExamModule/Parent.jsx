import React, { useContext } from "react";
import { ExamProvider, ExamContext } from "./ExamContext";
import QNavigation from "./QNavigation";
import { ExamLegend } from "./ExamLegend";
import { DisplayMCQ } from "./DisplayMCQ";
import { DisplayCoding } from "./DisplayCoding";
import { NavigationMCq } from "./NavigationMCQ";
import { NavigationCoding } from "./NavigationCoding";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import { FaUserCircle } from "react-icons/fa";

const ExamContent = () => {
  const {
    selectedMCQ,
    codingQuestions,
    handleSubmit,
    studentName,
    studentExamId,
    totalScore,
    isSubmitting,
    examType,
  } = useContext(ExamContext);
  const { profilePicture } = useStudent();
  return (
    <div className="min-h-screen h-full parent bg-[#E1EFFF] flex flex-col justify-between overflow-hidden">
      <div>
        <div className="stuent-n-exam-details">
          <div className="flex flex-row justify-evenly">
            <div className="flex flex-row justify-evenly items-center test-details bg-white w-3/4 mt-2 ml-2 mr-0.5 MCQ_Stats rounded-2xl text-center p-0.5 text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
              <span>
                <img className="w-44" src="ExamModule/Logo.png" alt="" />
              </span>
              <span className="flex flex-row gap-4 items-center">
                <img src="ExamModule/Exam.png" alt="" /> <span>{examType}</span>
              </span>
              <span>
                <span className="text-[#19216F] font-semibold">Marks:</span>
                <span>{totalScore}</span>
              </span>
            </div>
            <div className="p-2 student-details flex flex-row justify-evenly items-center bg-white w-full mt-2 mr-2 ml-0.5 MCQ_Stats rounded-2xl text-center text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 "
                />
              ) : (
                <FaUserCircle className="w-20 bg-gray-100 rounded-full flex items-center justify-center text-blue-500 text-5xl" />
              )}
              <div className="flex flex-col justify-start items-start">
                <div>{studentName}</div>
                <div className="text-sm">
                  <b>Exam Id: &nbsp;</b>
                  {studentExamId}
                </div>
              </div>
              <div className="flex flex-row gap-4 justify-evenly items-center answered">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting} // disable button when submitting
                  className={`text-white w-48 h-12 rounded-lg font-normal text-xl ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed" // styling when disabled
                      : "bg-[#ED1334]"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Test"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mcq-n-coding-section flex flex-col h-full mt-2">
          {!selectedMCQ && codingQuestions.length > 0 ? (
            <div className="flex flex-row gap-2">
              <DisplayCoding />
              <NavigationCoding />
            </div>
          ) : (
            <div className="flex flex-row gap-2">
              <DisplayMCQ />
              <NavigationMCq />
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="nav-n-legend flex flex-col items-center px-2">
          <QNavigation />
          <ExamLegend />
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
