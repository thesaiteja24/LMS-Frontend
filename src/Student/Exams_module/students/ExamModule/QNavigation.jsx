import React from "react";

const QNavigation = ({
  handlePrevious,
  handleNext,
  handleMarkReview,
  handleSubmit,
}) => {
  return (
    <div className="flex flex-row justify-evenly items-center legend w-[1200px] rounded-2xl bg-white mb-4 mx-4 p-4 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="flex flex-row gap-4 justify-evenly items-center not-answered">
        <button
          type="button"
          onClick={handlePrevious}
          className="text-white bg-[#132EE0] w-48 h-12 rounded-lg font-normal text-xl"
        >
          &lt; Previous
        </button>
      </div>
      <div className="flex flex-row gap-4 justify-evenly items-center marked-for-review">
        <button
          type="button"
          onClick={handleNext}
          className="text-white bg-[#132EE0] w-48 h-12 rounded-lg font-normal text-xl"
        >
          Next &gt;
        </button>
      </div>
      <div className="flex flex-row gap-4 justify-evenly items-center current">
        <button
          type="button"
          onClick={handleMarkReview}
          className="text-white bg-[#FF6000] w-48 h-12 rounded-lg font-normal text-xl"
        >
          Mark for Review
        </button>
      </div>
      <div className="flex flex-row gap-4 justify-evenly items-center answered">
        <button
          type="button"
          onClick={handleSubmit}
          className="text-white bg-[#129E00] w-48 h-12 rounded-lg font-normal text-xl"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default QNavigation;
