import React from "react";

export const Attempted = ({ attemptedMCQ, attemptedCode }) => {
  const totalAttempted = attemptedMCQ + attemptedCode;

  return (
    <div className="bg-white border border-blue-300 rounded-lg shadow-md w-full">
      {/* Header */}
      <div className="bg-blue-600 text-white text-center font-semibold text-xl py-2 rounded-t-lg">
        Attempted
      </div>

      {/* MCQ Attempted */}
      <div className="flex justify-between p-4 border-b m-4">
        <span className="text-black font-medium">MCQ’s Attempted</span>
        <span className="text-black font-bold">{attemptedMCQ}</span>
      </div>

      {/* Coding Questions Attempted */}
      <div className="flex justify-between p-4 border-b m-4">
        <span className="text-black font-medium">
          Coding Questions Attempted
        </span>
        <span className="text-black font-bold">{attemptedCode}</span>
      </div>

      {/* Total Attempted */}
      <div className="flex justify-center items-center px-4 py-2 m-4 bg-gray-100 border border-blue-500 rounded-lg text-lg font-semibold">
        Total Attempted <span className="ml-2 font-bold">{totalAttempted}</span>
      </div>
    </div>
  );
};
