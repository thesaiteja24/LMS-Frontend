import React, { useContext, useEffect, useState } from "react";
import { ExamContext } from "./ExamContext";

const CountdownTimer = () => {
  const { examData } = useContext(ExamContext);

  // Always determine totalExamTime using a fallback (0 if examData is not available)
  const totalExamTime =
    examData && examData.exam ? examData.exam.totalExamTime : 0;

  // Always call useState; if examData is not loaded, initialize with 0 seconds
  const [timeLeft, setTimeLeft] = useState(totalExamTime * 60);

  // Update timeLeft when examData becomes available
  useEffect(() => {
    if (examData && examData.exam) {
      setTimeLeft(examData.exam.totalExamTime * 60);
    }
  }, [examData]);

  // Start the timer unconditionally
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // If examData isn't loaded, show a loading indicator
  if (!examData || !examData.exam) {
    return <div className="text-center p-4">Loading exam data...</div>;
  }

  // Calculate hours, minutes, and seconds from timeLeft (in seconds)
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-2xl w-full bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className=" text-center bg-[#132EE0] text-white font-bold py-2 rounded-t-lg">
        Time Left
      </div>
      <div className="p-4">
        <div className="flex flex-row items-center justify-center space-x-6 p-4">
          <img src="ExamModule/clock.png" alt="Clock" className="w-12 h-12" />
          <div className="flex flex-col items-center">
            <span className="font-bold">{String(hours).padStart(2, "0")}</span>
            <span className="text-sm text-gray-600">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-600">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-600">Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
