import React from "react";

const QuestionPanel = ({ question, selectedOption, handleOptionChange }) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md w-[800px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-semibold">Question</span>
        <span className="text-lg font-semibold">Total marks: 20</span>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-lg font-bold px-4 py-2 bg-gray-200 rounded-md">
          {question.Question_No}.
        </span>
        <span className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg">
          {question.Question}
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(question.Options).map(([key, value]) => (
          <label
            key={key}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
              selectedOption === key
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:bg-gray-100"
            }`}
          >
            <input
              type="radio"
              name="option"
              value={key}
              checked={selectedOption === key}
              onChange={() => handleOptionChange(key)}
              className="mr-3 w-5 h-5"
            />
            <span className="text-lg font-medium">
              {key}. {value}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionPanel;
