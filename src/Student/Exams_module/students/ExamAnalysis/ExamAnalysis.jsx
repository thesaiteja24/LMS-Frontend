import React from "react";
import { QuestionBreakDown } from "./QuestionBreakDown";
import DoughnutChart from "./DoughnutChart";
import { Attempted } from "./Attempted";

export const ExamAnalysis = () => {
  const analysis = {
    analysis: {
      totalQuestions: 5,
      attemptedCodeCount: 1,
      attemptedCount: 2,
      attemptedMCQCount: 1,
      correctCount: 1,
      details: [
        {
          correctAnswer: "B",
          questionId: "67a9d794c0ea550573fd9bce",
          scoreAwarded: 1,
          status: "Correct",
          submitted: "B",
          timeTaken: 0,
          type: "objective",
        },
        {
          questionId: "67a081186c4050efda546f47",
          scoreAwarded: 0,
          status: "Failed",
          submitted: {
            testCaseSummary: {
              failed: 3,
              passed: 0,
            },
          },
          timeTaken: 0,
          type: "code",
        },
      ],
      examCompleted: true,
      incorrectCount: 1,
      totalScore: 1,
      totalTimeTaken: 0,
    },
    message:
      "Exam submitted successfully. No further test execution as the exam is complete.",
    success: true,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Title */}
      <div className="text-[#132EE0] text-center font-semibold text-xl md:text-2xl m-2 p-2">
        Exam Analysis
      </div>

      <hr className="mb-4" />

      <div className="p-4 md:p-8">
        {/* Top Section - Donut Chart & Attempted */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {/* Chart Section */}
          <DoughnutChart
            totalQuestions={analysis.analysis.totalQuestions}
            correctAnswers={analysis.analysis.correctCount}
            incorrectAnswers={
              analysis.analysis.totalQuestions - analysis.analysis.correctCount
            }
            totalScore={analysis.analysis.totalScore}
          />

          {/* Attempted Section */}
          <Attempted
            attemptedMCQ={analysis.analysis.attemptedMCQCount}
            attemptedCode={analysis.analysis.attemptedCodeCount}
          />
        </div>

        {/* Question Breakdown Section */}
        <div className="mt-6">
          <QuestionBreakDown details={analysis.analysis.details} />
        </div>
      </div>

      <div className="text-center text-3xl font-semibold">{analysis.message}</div>
    </div>
  );
};
