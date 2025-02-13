export const CodingPanel = ({ map, currentIndex, total }) => {
  const currentQuestion = map[currentIndex];

  return (
    <div className="w-full h-auto bg-white rounded-2xl my-4 mx-2 p-4 flex flex-col gap-4 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="marks-section flex flex-row justify-between">
        <span className="text-4xl">Question {currentQuestion.Question_No}</span>
        <span className="text-4xl">Total Score: {total}</span>
      </div>
      <div className="text-2xl p-4">
        <p>{currentQuestion.Question}</p>
        <p>
          <strong>Constraints:</strong> {currentQuestion.Constraints}
        </p>
      </div>
    </div>
  );
};
