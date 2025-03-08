import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import HalfDoughnutChart from "./HalfDoughnutChart";
import { StudentReportsContext } from "../contexts/StudentReportsContext.jsx";

export const ExamReportsDashboard = () => {
  // Use the context to get exam reports and loading state
  const { dailyExam, weeklyExam, monthlyExam, loading } = useContext(
    StudentReportsContext
  );
  const navigate = useNavigate();

  // Calculate maximum marks from the exam's paper
  const calculateMaximumMarks = (paper) => {
    let maximumScore = 0;
    if (!paper || paper.length === 0) return 0;
    paper.forEach((subjectPaper) => {
      if (subjectPaper.MCQs && subjectPaper.MCQs.length > 0) {
        maximumScore += subjectPaper.MCQs.reduce(
          (sum, mcq) => sum + mcq.Score,
          0
        );
      }
      if (subjectPaper.Coding && subjectPaper.Coding.length > 0) {
        maximumScore += subjectPaper.Coding.reduce(
          (sum, code) => sum + code.Score,
          0
        );
      }
    });
    return maximumScore;
  };

  // Carousel settings: Show 4 cards per page.
  const cardsPerPage = 4;
  const [pageIndices, setPageIndices] = useState({
    "Daily-Exam": 0,
    "Weekly-Exam": 0,
    "Monthly-Exam": 0,
  });

  const handleNext = (groupName, groupLength) => {
    setPageIndices((prev) => {
      const currentIndex = prev[groupName] || 0;
      if (currentIndex + cardsPerPage < groupLength) {
        return { ...prev, [groupName]: currentIndex + 1 };
      }
      return prev;
    });
  };

  const handlePrev = (groupName) => {
    setPageIndices((prev) => {
      const currentIndex = prev[groupName] || 0;
      if (currentIndex > 0) {
        return { ...prev, [groupName]: currentIndex - 1 };
      }
      return prev;
    });
  };

  // Render a carousel for a given exam group
  const renderExamGroup = (groupName, examGroup) => {
    if (!examGroup || examGroup.length === 0) return null;
    const startIndex = pageIndices[groupName] || 0;
    const visibleExams = examGroup.slice(startIndex, startIndex + cardsPerPage);

    return (
      <div className="mb-10" key={groupName}>
        <h3 className="text-2xl font-bold text-[#19216F] mb-4">{groupName}</h3>
        <div className="relative">
          {/* Left Arrow */}
          {startIndex > 0 && (
            <button
              onClick={() => handlePrev(groupName)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow hover:bg-blue-700 transition z-10"
            >
              &larr;
            </button>
          )}
          <div className="overflow-hidden">
            <div className="flex space-x-6 transition-transform duration-300">
              {visibleExams.map((exam) => {
                const totalScore = exam.analysis?.totalScore || 0;
                // Calculate maximum score from the exam's "paper" instead of "subjects"
                const maxScore = calculateMaximumMarks(exam.paper);
                const correctCount = exam.analysis?.correctCount || 0;
                const incorrectCount = exam.analysis?.incorrectCount || 0;
                const attempted = exam["attempt-status"];

                return (
                  <div
                    key={exam._id}
                    className="bg-white rounded-xl shadow-lg flex flex-col items-center transform transition"
                  >
                    <div className="w-full rounded-t-lg px-4 py-2 text-2xl text-white font-bold bg-[#19216f]">
                      {exam.examName}
                    </div>
                    {attempted ? (
                      <>
                        <div className="flex flex-col px-4 justify-start items-center">
                          {/* Display the chart and exam details */}
                          <HalfDoughnutChart
                            totalScore={totalScore}
                            maximumScore={maxScore}
                          />
                          <div className="flex flex-row gap-4 justify-start mb-3">
                            <p className="text-green-600 font-lg text-xl">
                              Correct: {correctCount}
                            </p>
                            <p className="text-red-600 font-lg text-xl">
                              Incorrect: {incorrectCount}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.setItem(
                              "Analysis",
                              JSON.stringify(exam)
                            );
                            navigate("/exam-analysis", {
                              state: { isReports: true },
                            });
                          }}
                          type="button"
                          className="text-white bg-[#19216f] font-medium rounded-lg text-lg px-5 py-2.5 mb-2"
                        >
                          View Detailed Analysis
                        </button>
                      </>
                    ) : (
                      // If the exam wasn't attempted, display "Not Attempted"
                      <div className="flex h-full flex-col justify-center w-full px-4 pb-4 items-center text-3xl text-center text-red-500">
                        <div>
                          <h1>Did Not</h1>
                          <h1>Attempt Exam</h1>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Right Arrow */}
          {startIndex + cardsPerPage < examGroup.length && (
            <button
              onClick={() => handleNext(groupName, examGroup.length)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow hover:bg-blue-700 transition z-10"
            >
              &rarr;
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-[49px] bg-gray-100 min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          &larr; Back
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <>
          {renderExamGroup("Daily-Exam", dailyExam)}
          {renderExamGroup("Weekly-Exam", weeklyExam)}
          {renderExamGroup("Monthly-Exam", monthlyExam)}
        </>
      )}
    </div>
  );
};

export default ExamReportsDashboard;
