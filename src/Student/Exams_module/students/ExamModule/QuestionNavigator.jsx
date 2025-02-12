import React from "react";

const QuestionNavigator = ({
  totalQuestions,
  selectedQuestion,
  answeredQuestions,
  reviewQuestions,
  handleQuestionChange,
}) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md w-[300px]">
      <div className="grid grid-cols-5 gap-3">
        {[...Array(totalQuestions)].map((_, index) => {
          const questionNum = index + 1;
          let buttonStyle = "bg-gray-200 text-black"; // Default (Unanswered)

          if (answeredQuestions.includes(questionNum))
            buttonStyle = "bg-green-500 text-white"; // Answered
          if (reviewQuestions.includes(questionNum))
            buttonStyle = "bg-orange-500 text-white"; // Marked for Review
          if (selectedQuestion === questionNum)
            buttonStyle = "bg-blue-500 text-white"; // Current

          return (
            <button
              key={questionNum}
              onClick={() => handleQuestionChange(questionNum)}
              className={`w-10 h-10 rounded-md font-semibold ${buttonStyle}`}
            >
              {questionNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigator;
