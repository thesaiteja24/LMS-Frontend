import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentCard from "./StudentCard";

// Helper function to parse day-1, day-2, etc. into numeric values for sorting.
function parseDayOrder(dayOrder) {
  // If it's "N/A" or not in the format "day-N", return -1 so that it sorts last.
  if (!dayOrder?.startsWith("day-")) {
    return -1;
  }
  // Extract the number after "day-" and convert to integer.
  return parseInt(dayOrder.slice(4), 10);
}

const DailyPerformance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  console.log("data:", data);
  // Two pieces of local state for our two filters:
  const [dayFilter, setDayFilter] = useState("all"); // "all", "day-1", "day-2", etc.
  const [scoreOrder, setScoreOrder] = useState("none");
  // "none" = no sorting by score, "asc" = ascending, "desc" = descending

  // Redirect if no data or no results array is present
  useEffect(() => {
    if (!data || !data.results) {
      navigate("/exam-dashboard");
    }
  }, [data, navigate]);

  if (!data || !data.results) return null;

  // 1) First, filter by dayOrder if the user picked one (other than "all").
  let filteredData = data.results;
  if (dayFilter !== "all") {
    filteredData = filteredData.filter(
      (item) => item.student.dayOrder === dayFilter
    );
  }

  // 2) Sort by dayOrder in descending order by default
  //    (i.e. day-3 > day-2 > day-1 > N/A).
  filteredData.sort((a, b) => {
    return (
      parseDayOrder(b.student.dayOrder) - parseDayOrder(a.student.dayOrder)
    );
  });

  // 3) If the user chose to sort by score asc or desc, apply that next.
  if (scoreOrder !== "none") {
    filteredData.sort((a, b) => {
      const scoreA = a.student.totalScore || 0;
      const scoreB = b.student.totalScore || 0;
      if (scoreOrder === "asc") {
        return scoreA - scoreB;
      } else {
        return scoreB - scoreA;
      }
    });
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-8 px-4">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
        Student Performance
      </h1>

      {/* --- Filters --- */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {/* Day Order Filter */}
        <div>
          <label className="font-semibold mr-2 text-gray-700">
            Filter by Day Order:
          </label>
          <select
            className="border rounded-md p-1"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="day-1">day-1</option>
            <option value="day-2">day-2</option>
            <option value="day-3">day-3</option>
            {/* Add more if needed */}
          </select>
        </div>

        {/* Score Sort Order */}
        <div>
          <label className="font-semibold mr-2 text-gray-700">
            Sort by Score:
          </label>
          <select
            className="border rounded-md p-1"
            value={scoreOrder}
            onChange={(e) => setScoreOrder(e.target.value)}
          >
            <option value="none">None</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* --- Student Cards --- */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredData.map((result) => (
          <StudentCard key={result.student.id} student={result.student} />
        ))}
      </div>
    </div>
  );
};

export default DailyPerformance;
