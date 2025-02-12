import React, { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";

const CountdownTimer = ({ startTime, totalExamTime }) => {
  // Parse startTime into hours and minutes
  const [hours, minutes] = startTime.split(":").map(Number);

  // Convert to a Date object and add totalExamTime (minutes)
  const startDateTime = new Date();
  startDateTime.setHours(hours, minutes, 0, 0);
  const endTime = new Date(startDateTime.getTime() + totalExamTime * 60000);

  // State for remaining time
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  // Function to calculate remaining time
  function calculateTimeLeft(endTime) {
    const now = new Date();
    const difference = endTime - now;

    if (difference > 0) {
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  }

  // Effect to update the timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-white w-[54rem] h-[6.5rem] m-4 border-black border-2 rounded-[20px] text-center p-4">
      <div className="flex flex-row justify-center items-center">
        <img src="/ExamModule/Vector from Figma.png" alt="" />
        <span className="text-gray-700 font-semibold text-4xl mx-4">Time left:</span>
        <div className="flex flex-row">
          <span className="ml-3 text-gray-900 font-bold text-4xl flex flex-col">
            {String(timeLeft.hours).padStart(2, "0")}{" "}
            <span className="text-sm">Hours</span>
          </span>
          <span className="mx-2 text-gray-900 font-bold text-4xl flex flex-col">
            {String(timeLeft.minutes).padStart(2, "0")}{" "}
            <span className="text-sm">Minutes</span>
          </span>
          <span className="text-gray-900 font-bold text-4xl flex flex-col">
            {String(timeLeft.seconds).padStart(2, "0")}{" "}
            <span className="text-sm">Seconds</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
