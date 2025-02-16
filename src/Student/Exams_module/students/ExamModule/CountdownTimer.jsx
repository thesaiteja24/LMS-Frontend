import React, { useContext, useEffect, useState } from "react";
import { ExamContext } from "./ExamContext";

const CountdownTimer = () => {
  const { examData } = useContext(ExamContext);

  // Ensure examData is always accessed safely
  const totalExamTime = examData?.exam?.totalExamTime || 0;
  const startTime = examData?.exam?.startTime || "00:00:00";
  const startDate = examData?.exam?.startDate || "1970-01-01";

  // Convert startDate and startTime to a JavaScript timestamp
  const examStartTimestamp = new Date(`${startDate}T${startTime}`).getTime();
  const examEndTimestamp = examStartTimestamp + totalExamTime * 60 * 1000;

  // Calculate the initial remaining time when component mounts
  const calculateRemainingTime = () => {
    const now = Date.now();
    return Math.max(0, Math.floor((examEndTimestamp - now) / 1000));
  };

  // State initialization must always happen
  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime);

  // Start the countdown timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(calculateRemainingTime);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [examEndTimestamp]);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-2xl w-full bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="text-center bg-[#132EE0] text-white font-bold py-2 rounded-t-lg">
        Time Left
      </div>
      <div className="p-4">
        {examData && examData.exam ? (
          <div className="flex flex-row items-center justify-center space-x-6 p-4">
            <img src="ExamModule/clock.png" alt="Clock" className="w-12 h-12" />
            <div className="flex flex-col items-center">
              <span className="font-bold">
                {String(hours).padStart(2, "0")}
              </span>
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
        ) : (
          <div className="text-center p-4 text-red-500">
            Loading exam data...
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
