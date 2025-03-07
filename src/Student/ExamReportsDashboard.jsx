import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import HalfDoughnutChart from "./HalfDoughnutChart";
import Alert from "./Exams_module/students/Alert";
import { decryptData } from "../../cryptoUtils.jsx";

export const ExamReportsDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const stdId = decryptData(localStorage.getItem("id"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/student-reports?stdId=${stdId}`
        );
        const { success, results } = response.data;
        if (success && Array.isArray(results)) {
          // Transform each result so that analysis is nested under submissionResult
          const transformedResults = results.map((result) => ({
            ...result,
            submissionResult: { analysis: result.analysis },
          }));
          setExams(transformedResults);
        } else {
          setError("No exam results found.");
        }
      } catch (err) {
        setError("Results under maintenance...");
        console.error("ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    if (stdId) {
      fetchReports();
    } else {
      setLoading(false);
      setError("No student ID found in localStorage.");
    }
  }, [stdId]);

  // Function to calculate maximum marks from a subjects array
  const calculateMaximumMarks = (subjects) => {
    let maximumScore = 0;
    if (!subjects || subjects.length === 0) return 0;
    subjects.forEach((subject) => {
      if (subject.MCQs && subject.MCQs.length > 0) {
        maximumScore += subject.MCQs.reduce((sum, mcq) => sum + mcq.Score, 0);
      }
      if (subject.Coding && subject.Coding.length > 0) {
        maximumScore += subject.Coding.reduce(
          (sum, code) => sum + code.Score,
          0
        );
      }
    });
    return maximumScore;
  };

  // Group exam results by type
  const dailyExams = exams.filter((exam) => exam.type === "Daily-Exam");
  const weeklyExams = exams.filter((exam) => exam.type === "Weekly-Exam");
  const monthlyExams = exams.filter((exam) => exam.type === "Monthly-Exam");

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

  // Render a carousel for a given exam group using custom styling
  const renderExamGroup = (groupName, examGroup) => {
    if (examGroup.length === 0) return null;
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
                const maxScore = calculateMaximumMarks(exam.subjects);
                const correctCount = exam.analysis?.correctCount || 0;
                const incorrectCount = exam.analysis?.incorrectCount || 0;

                return (
                  <div
                    key={exam._id}
                    className=" bg-white rounded-xl shadow-lg flex flex-col items-center transform transition"
                  >
                    <div className="w-full rounded-t-lg px-4 py-2 text-2xl text-white font-bold bg-[#19216f]">
                      View {exam.dayOrder.toUpperCase()} Exam Reports
                    </div>
                    <div className="flex flex-col px-4 justify-start items-center">
                      {/* Display the arc chart */}
                      <HalfDoughnutChart
                        totalScore={totalScore}
                        maximumScore={maxScore}
                      />
                      {/* Exam details */}
                      <div className="flex flex-row gap-4 justify-start mb-3">
                        <p className="text-green-600 font-lg text-xl">
                          Correct Answers: {correctCount}
                        </p>
                        <p className="text-red-600 font-lg text-xl">
                          Incorrect Answers: {incorrectCount}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem("Analysis", JSON.stringify(exam));
                        navigate("/exam-analysis", {
                          state: { isReports: true },
                        });
                      }}
                      type="button"
                      class="text-white bg-[#19216f] font-medium rounded-lg text-lg px-5 py-2.5 mb-2 "
                    >
                      View Detailed Analysis
                    </button>
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
      ) : error ? (
        <div className="text-4xl text-center text-red-600">{error}</div>
      ) : (
        <>
          {renderExamGroup("Daily-Exam", dailyExams)}
          {renderExamGroup("Weekly-Exam", weeklyExams)}
          {renderExamGroup("Monthly-Exam", monthlyExams)}
        </>
      )}
    </div>
  );
};

export default ExamReportsDashboard;
