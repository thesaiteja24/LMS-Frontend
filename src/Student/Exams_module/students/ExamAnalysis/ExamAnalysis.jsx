import React, { useEffect } from "react";
import { QuestionBreakDown } from "./QuestionBreakDown";
import DoughnutChart from "./DoughnutChart";
import { Attempted } from "./Attempted";
import { useLocation, useNavigate } from "react-router-dom";

export const ExamAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionResult = location.state?.submissionResult;

  // Effect to override back navigation
  useEffect(() => {
    // Push a dummy state to history to override back button behavior
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate("/exam-dashboard");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

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
            totalQuestions={submissionResult.analysis.totalQuestions}
            correctAnswers={submissionResult.analysis.correctCount}
            incorrectAnswers={
              submissionResult.analysis.totalQuestions -
              submissionResult.analysis.correctCount
            }
            totalScore={submissionResult.analysis.totalScore}
          />

          {/* Attempted Section */}
          <Attempted
            attemptedMCQ={submissionResult.analysis.attemptedMCQCount}
            attemptedCode={submissionResult.analysis.attemptedCodeCount}
          />
        </div>

        {/* Question Breakdown Section */}
        <div className="mt-6">
          <QuestionBreakDown details={submissionResult.analysis.details} />
        </div>
      </div>

      <div className="text-center text-3xl font-semibold">
        {submissionResult.message}
      </div>
    </div>
  );
};
