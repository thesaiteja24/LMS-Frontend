import React from "react";

export const ExamLegend = () => {
  return (
    <div className="flex flex-row justify-evenly items-center legend w-[1200px] rounded-2xl bg-white mb-4 mx-4 p-4 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="flex flex-row gap-4 justify-evenly items-center not-answered">
        <span className="bg-[#E1EFFF] w-9 h-9 inline-block rounded-[6px]"></span>
        <span className="font-normal text-xl">Not answered</span>
      </div>
      <div className="flex flex-row gap-4 justify-evenly items-center marked-for-review">
        <span className="bg-[#FF6000] w-9 h-9 inline-block rounded-[6px]"></span>
        <span className="font-normal text-xl">Mark for review</span>
      </div>
      <div className="flex flex-row gap-4 justify-evenly items-center current">
        <span className="bg-[#3686FF] w-9 h-9 inline-block rounded-[6px]"></span>
        <span className="font-normal text-xl">Current</span>
      </div>
      <div className="flex flex-row gap-4 justify-evenly items-center answered">
        <span className="bg-[#129E00] w-9 h-9 inline-block rounded-[6px]"></span>
        <span className="font-normal text-xl">Answered</span>
      </div>
    </div>
  );
};
