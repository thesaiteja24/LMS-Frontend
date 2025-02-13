export const McqPanel = ({ map, currentIndex, total, updateMcqAnswer }) => {
  const currentQuestion = map[currentIndex];

  const handleOptionChange = (e) => {
    updateMcqAnswer(currentIndex, e.target.value);
  };

  return (
    <div className="w-full h-auto bg-white rounded-2xl m-4 p-4 flex flex-col gap-4">
      <div className="marks-section flex flex-row justify-between">
        <span className="text-4xl">Question</span>
        <span className="text-4xl">Total Score: {total}</span>
      </div>
      <div className="text-2xl p-4">
        <span className="bg-[#E1EFFF] p-4 rounded-lg">{`${
          currentIndex + 1
        }.`}</span>
        <span className="bg-[#E1EFFF] mx-2 p-4 rounded-lg">
          {currentQuestion.Question}
        </span>
      </div>
      <div className="text-2xl p-4">Options</div>
      <div className="options flex flex-col gap-2 p-4">
        {Object.entries(currentQuestion.Options).map(([key, value]) => {
          const isSelected = currentQuestion.answer === value;
          return (
            <label
              key={key}
              className={`flex items-center p-2 rounded cursor-pointer ${
                isSelected
                  ? "bg-white shadow-[0px_4px_17px_0px_#0368FF26]"
                  : "bg-[#E1EFFF]"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.questionId}`}
                value={value}
                checked={isSelected}
                onChange={handleOptionChange}
                className="mr-2"
              />
              {key}: {value}
            </label>
          );
        })}
      </div>
    </div>
  );
};
