import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import icons for correct/incorrect status

export const QuestionBreakDown = ({ details }) => {
  return (
    <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
      {/* Header */}
      <div className="text-[#19216f] font-semibold text-lg mb-2">
        Question Breakdown
        <hr />
      </div>

      {/* Scrollable Container */}
      <div className="max-h-80 overflow-y-auto pr-2">
        {details.map((question, index) => (
          <div key={index} className="border-b pb-2 mb-2 last:border-none">
            <div className="flex gap-2">
              <span className="font-medium">Question :</span>
              <span className="text-black font-bold">{question.question}</span>
              <span className="font-medium">Marks Awarded :</span>
              <span className="text-gray-500">{question.scoreAwarded}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">Type :</span>
              <span>{question.type === "objective" ? "MCQ" : "Coding"}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-medium">Status :</span>
              <span
                className={`flex items-center ${
                  question.status === "Correct" || question.status === "Passed"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {question.status}
                {question.status === "Correct" ||
                question.status === "Passed" ? (
                  <FaCheckCircle className="ml-2" />
                ) : (
                  <FaTimesCircle className="ml-2" />
                )}
              </span>
            </div>
            {question.type === "objective" ? (
              <div>
                <div className="flex gap-2">
                  <span className="font-medium">Your Answer :</span>
                  <span>{question.submitted}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-medium">Options :</span>
                  <div className="flex gap-4">
                    <span
                      className={
                        question.correctAnswer === "A" ? "text-green-7src/Student/Exams_module/students/ExamAnalysis/QuestionBreakDown.jsx00 font-bold" : ""
                      }
                    >
                      A: {question.options.A}
                    </span>
                    <span
                      className={
                        question.correctAnswer === "B" ? "text-green-7src/Student/Exams_module/students/ExamAnalysis/QuestionBreakDown.jsx00 font-bold" : ""
                      }
                    >
                      B: {question.options.B}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span
                      className={
                        question.correctAnswer === "C" ? "text-green-7src/Student/Exams_module/students/ExamAnalysis/QuestionBreakDown.jsx00 font-bold" : ""
                      }
                    >
                      C: {question.options.C}
                    </span>
                    <span
                      className={
                        question.correctAnswer === "D" ? "text-green-7src/Student/Exams_module/students/ExamAnalysis/QuestionBreakDown.jsx00 font-bold" : ""
                      }
                    >
                      D: {question.options.D}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <span className="font-medium">Passed Cases :</span>
                  <span>{question.submitted.testCaseSummary.passed}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Failed Cases :</span>
                  <span>{question.submitted.testCaseSummary.failed}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
