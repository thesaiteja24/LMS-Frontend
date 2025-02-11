import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ExamAnalytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exam = location.state?.exam;

  // Generate a PDF report
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Title Section
    doc.setFontSize(22);
    doc.setTextColor("#4f46e5");
    doc.text(`Exam Report: ${exam.dailyExam.subject}`, 105, 15, { align: "center" });

    // Exam Details
    const details = [
      `Batch No: ${exam.batchNo}`,
      `Subject: ${exam.dailyExam.subject}`,
      `Date: ${exam.dailyExam.date}`,
      `Total Score: ${exam.totalScore}`,
      `Duration: ${exam.dailyExam.start_time} - ${exam.dailyExam.end_time}`,
    ];
    doc.setFontSize(12);
    doc.setTextColor(40);
    details.forEach((detail, index) => doc.text(detail, 10, 30 + index * 8));

    // Questions Table
    const questions = exam.answers.map((answer, index) => [
      index + 1,
      answer.type,
      answer.question_text,
      answer.type === "MCQ" ? Object.values(answer.correct_answer).join(", ") : "N/A",
      answer.type === "MCQ" ? Object.values(answer.user_answer).join(", ") : "N/A",
      answer.type === "Coding" ? answer.user_source_code || "Not submitted" : "N/A",
      answer.is_correct ? "Correct" : "Incorrect",
      answer.type === "Coding"
        ? `${answer.test_case_summary.passed} Passed, ${answer.test_case_summary.failed} Failed`
        : "N/A",
    ]);

    doc.autoTable({
      head: [
        [
          "#",
          "Type",
          "Question",
          "Correct Answer",
          "Your Answer",
          "Your Code",
          "Status",
          "Test Case Summary",
        ],
      ],
      body: questions,
      startY: 70,
      styles: { fontSize: 9, cellPadding: 4, overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: 8 }, 2: { cellWidth: 60 } },
    });

    doc.save(`${exam.dailyExam.subject}_Exam_Report.pdf`);
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-100">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No exam data available.</p>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            {exam.batchNo} - {exam.dailyExam.subject}
          </h1>
          <p className="text-lg text-gray-700 mt-2">{exam.dailyExam.date}</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow">
              Duration: {exam.dailyExam.start_time} - {exam.dailyExam.end_time}
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow">
              Total Score: {exam.totalScore}
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Questions and Answers</h2>
        {exam.answers.map((answer, index) => (
          <div
            key={index}
            className="mb-6 bg-gray-50 p-4 rounded-lg shadow-md border-l-4 border-blue-600"
          >
            <p className="text-lg font-semibold text-gray-800">
              Question {index + 1}: {answer.question_text}
            </p>

            {/* MCQ Options */}
            {answer.type === "MCQ" && (
              <div>
                <h3 className="mt-4 font-semibold text-gray-700">Options:</h3>
                <ul className="grid grid-cols-2 gap-4 mt-2">
                  {Object.entries(answer.options).map(([key, value]) => (
                    <li
                      key={key}
                      className={`p-2 rounded-lg text-sm ${
                        value === Object.values(answer.correct_answer)[0]
                          ? "bg-green-100 text-green-700"
                          : value === Object.values(answer.user_answer)[0]
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {value}
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-bold ${
                      answer.is_correct ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {answer.is_correct ? "Correct" : "Incorrect"}
                  </span>
                </p>
              </div>
            )}

            {/* Coding Questions */}
            {answer.type === "Coding" && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Your Code:</h3>
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg text-sm overflow-auto">
                  {answer.user_source_code || "No code submitted"}
                </pre>
                <p className="mt-3">
                  <strong>Test Case Summary:</strong>{" "}
                  <span className="text-green-600">{answer.test_case_summary.passed} Passed</span>,{" "}
                  <span className="text-red-600">{answer.test_case_summary.failed} Failed</span>
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-200"
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </button>
          <button
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
            onClick={generatePDF}
          >
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamAnalytics;
