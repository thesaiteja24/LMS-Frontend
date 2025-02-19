import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentCard from "./StudentCard";

const DailyPerformance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state; // Payload from /api/v1/exam-details

  // Redirect if no data or no results array is present
  useEffect(() => {
    if (!data || !data.results) {
      navigate("/exam-dashboard");
    }
  }, [data, navigate]);

  if (!data || !data.results) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-8 px-4">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
        Student Performance
      </h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.results.map((result) => (
          <StudentCard key={result.student.id} student={result.student} />
        ))}
      </div>
    </div>
  );
};

export default DailyPerformance;
