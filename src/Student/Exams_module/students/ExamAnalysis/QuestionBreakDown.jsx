import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import icons for correct/incorrect status

export const QuestionBreakDown = ({ details }) => {
  // If details is null, undefined, not an array, or an empty array,
  // display a message indicating that the results will be updated soon.
  if (!details || !Array.isArray(details) || details.length === 0) {
    return (
      <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
        <div className="text-[#19216f] font-semibold text-lg mb-2">
          Question Breakdown
          <hr />
        </div>
        <p className="text-center text-gray-500">
          Results will be updated soon.
        </p>
      </div>
    );
  }

  try {
    return (
      <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
        {/* Header */}
        <div className="text-[#19216f] font-semibold text-lg mb-2">
          Question Breakdown
          <hr />
        </div>

        {/* Scrollable Container */}
        <div className="max-h-80 overflow-y-auto pr-2">
          {details.map((question, index) => {
            // Safely extract values from the question object with defaults
            const questionText = question?.question || "No question provided.";
            const scoreAwarded = question?.scoreAwarded ?? "0";
            const type = question?.type === "objective" ? "MCQ" : "Coding";
            const status = question?.status || "N/A";
            const submitted = question?.submitted;
            const options = question?.options || {};
            const correctAnswer = question?.correctAnswer;
            const testCaseSummary = submitted?.testCaseSummary || {};
            const passedCases = testCaseSummary?.passed ?? "0";
            const failedCases = testCaseSummary?.failed ?? "0";

            return (
              <div key={index} className="border-b pb-2 mb-2 last:border-none">
                <div className="flex gap-2 flex-wrap">
                  <span className="font-medium">Question:</span>
                  <span className="text-black font-bold">{questionText}</span>
                  <span className="font-medium">Marks Awarded:</span>
                  <span className="text-gray-500">{scoreAwarded}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Type:</span>
                  <span>{type}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`flex items-center ${
                      status === "Correct" || status === "Passed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {status}
                    {status === "Correct" || status === "Passed" ? (
                      <FaCheckCircle className="ml-2" />
                    ) : (
                      <FaTimesCircle className="ml-2" />
                    )}
                  </span>
                </div>
                {question?.type === "objective" ? (
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="font-medium">Your Answer:</span>
                      <span>{submitted || "No answer submitted."}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-medium">Options:</span>
                      <div className="flex gap-4 flex-wrap">
                        <span
                          className={
                            correctAnswer === "A" ? "text-green font-bold" : ""
                          }
                        >
                          A: {options.A || "N/A"}
                        </span>
                        <span
                          className={
                            correctAnswer === "B" ? "text-green font-bold" : ""
                          }
                        >
                          B: {options.B || "N/A"}
                        </span>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <span
                          className={
                            correctAnswer === "C" ? "text-green font-bold" : ""
                          }
                        >
                          C: {options.C || "N/A"}
                        </span>
                        <span
                          className={
                            correctAnswer === "D" ? "text-green font-bold" : ""
                          }
                        >
                          D: {options.D || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <span className="font-medium">Passed Cases:</span>
                      <span>{passedCases}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Failed Cases:</span>
                      <span>{failedCases}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    // If any error occurs during rendering, show an error message
    return (
      <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
        <div className="text-[#19216f] font-semibold text-lg mb-2">
          Question Breakdown
          <hr />
        </div>
        <p className="text-center text-red-600">Internal server error.</p>
      </div>
    );
  }
};
