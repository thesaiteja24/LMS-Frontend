import React, { useEffect } from "react";
import { QuestionBreakDown } from "./QuestionBreakDown";
import DoughnutChart from "./DoughnutChart";
import { Attempted } from "./Attempted";
import { useLocation, useNavigate } from "react-router-dom";

export const ExamAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionResult = JSON.parse(localStorage.getItem("Analysis"));
  const isReports = location.state?.isReports;

  // Effect to override back navigation
  useEffect(() => {
    // Push a dummy state to history to override back button behavior
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (isReports) {
        navigate("/exam-reports-dashboard");
      } else {
        navigate("/exam-dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Title */}
      <div className="text-[#19216F] text-center font-semibold text-2xl md:text-3xl">
        Exam Analysis
      </div>

      <hr />

      <div className="p-2 md:p-4">
        {/* Top Section - Donut Chart & Attempted */}
        <div className="flex flex-col md:flex-row gap-x-6 justify-center">
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
        <div>
          <QuestionBreakDown details={submissionResult.analysis.details} />
        </div>
      </div>

      <div className="text-center text-3xl font-semibold">
        {submissionResult.message}
      </div>
    </div>
  );
};
