import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DailyPerformance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  // Redirect if no data or no results are present.
  useEffect(() => {
    if (!data || !data.results) {
      navigate("/exam-dashboard");
    }
  }, [data, navigate]);

  if (!data || !data.results) return null;

  // Build unique exam names, normalizing by lower-case to remove duplicates.
  const uniqueExamNames = useMemo(() => {
    const namesMap = {};
    data.results.forEach((item) => {
      if (item.exam && item.exam.examName) {
        const lower = item.exam.examName.toLowerCase();
        if (!namesMap[lower]) {
          namesMap[lower] = item.exam.examName;
        }
      }
    });
    return Object.values(namesMap);
  }, [data.results]);

  // State for the searchable exam name dropdown filter.
  const [examNameQuery, setExamNameQuery] = useState("");
  const [examNameFilter, setExamNameFilter] = useState(""); // applied filter

  // New state for attempt status filter: "all", "attempted", "not attempted"
  const [attemptStatusFilter, setAttemptStatusFilter] = useState("all");

  // State for sort order based on overall marks.
  const [scoreSort, setScoreSort] = useState("none"); // "none", "highest", "lowest"

  // Compute filtered data based on exam name and attempt status filters.
  let filteredData = data.results.filter((item) => {
    // Filter out records that don't have an exam.
    if (!item.exam || !item.exam.examName) return false;

    // Check exam name filter (exact match).
    if (
      examNameFilter &&
      item.exam.examName.toLowerCase() !== examNameFilter.toLowerCase()
    ) {
      return false;
    }

    // Check attempt status filter.
    if (attemptStatusFilter !== "all") {
      const attempted = item.exam["attempt-status"] === true;
      if (attemptStatusFilter === "attempted" && !attempted) return false;
      if (attemptStatusFilter === "not attempted" && attempted) return false;
    }
    return true;
  });

  // Sort filtered data based on overall score if required.
  if (scoreSort === "highest") {
    filteredData.sort(
      (a, b) =>
        (b.exam?.analysis?.totalScore || 0) -
        (a.exam?.analysis?.totalScore || 0)
    );
  } else if (scoreSort === "lowest") {
    filteredData.sort(
      (a, b) =>
        (a.exam?.analysis?.totalScore || 0) -
        (b.exam?.analysis?.totalScore || 0)
    );
  }

  // Filter the exam name dropdown options based on the query.
  const examNameOptions = uniqueExamNames.filter((name) =>
    name.toLowerCase().includes(examNameQuery.toLowerCase())
  );

  // Compute subject-wise marks analysis for an exam.
  // We assume the questions are ordered as per exam.subjects.
  const getSubjectWiseAnalysis = (exam) => {
    const details = exam.analysis.details || [];
    let cumulativeIndex = 0;
    return exam.subjects.map((subject) => {
      // Calculate total questions for this subject.
      const codingCount =
        (subject.selectedCoding.easy || 0) +
        (subject.selectedCoding.medium || 0) +
        (subject.selectedCoding.hard || 0);
      const mcqCount =
        (subject.selectedMCQs.easy || 0) +
        (subject.selectedMCQs.medium || 0) +
        (subject.selectedMCQs.hard || 0);
      const subjectTotal = codingCount + mcqCount;

      // Slice the details for this subject.
      const subjectDetails = details.slice(
        cumulativeIndex,
        cumulativeIndex + subjectTotal
      );
      const scoreObtained = subjectDetails.reduce(
        (sum, q) => sum + (q.scoreAwarded || 0),
        0
      );

      // Update cumulative index for next subject.
      cumulativeIndex += subjectTotal;

      return {
        subject: subject.subject,
        scoreObtained,
        totalQuestions: subjectTotal,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Exam Performance Dashboard
      </h1>

      {/* Filters Section */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Searchable Exam Name Dropdown */}
        <div className="relative">
          <label className="font-medium text-gray-700 block mb-1">
            Exam Name
          </label>
          <input
            type="text"
            value={examNameQuery}
            onChange={(e) => {
              setExamNameQuery(e.target.value);
              if (e.target.value === "") {
                setExamNameFilter("");
              }
            }}
            placeholder="Search exam name..."
            className="border rounded px-2 py-1"
          />
          {/* Dropdown Options */}
          {examNameQuery && examNameOptions.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-y-auto">
              {examNameOptions.map((name) => (
                <li
                  key={name}
                  className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setExamNameFilter(name);
                    setExamNameQuery(name);
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
          {examNameFilter && (
            <div className="mt-1 text-sm text-green-700">
              Filter applied: {examNameFilter}{" "}
              <button
                onClick={() => {
                  setExamNameFilter("");
                  setExamNameQuery("");
                }}
                className="underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Attempt Status Filter */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Attempt Status
          </label>
          <select
            value={attemptStatusFilter}
            onChange={(e) => setAttemptStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="attempted">Attempted</option>
            <option value="not attempted">Not Attempted</option>
          </select>
        </div>

        {/* Sort by Score Filter */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Sort by Score
          </label>
          <select
            value={scoreSort}
            onChange={(e) => setScoreSort(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="none">None</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Student ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Phone
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Exam Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Attempt Status
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Marks Overall
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Subject-wise Analysis
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Additional Info
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const { student, exam } = item;
              const subjectAnalysis = exam ? getSubjectWiseAnalysis(exam) : [];
              return (
                <tr
                  key={student.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.phNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {exam?.examName || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {exam
                      ? exam["attempt-status"]
                        ? "Attempted"
                        : "Not Attempted"
                      : "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {exam?.analysis?.totalScore ?? "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {subjectAnalysis.map((subj, idx) => (
                      <div key={idx}>
                        <strong>{subj.subject}:</strong> {subj.scoreObtained} /{" "}
                        {subj.totalQuestions}
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div>
                      <strong>Date:</strong> {exam?.startDate || "N/A"}
                    </div>
                    <div>
                      <strong>Time:</strong> {exam?.startTime || "N/A"}
                    </div>
                    <div>
                      <strong>Total Time:</strong>{" "}
                      {exam?.totalExamTime
                        ? exam.totalExamTime + " mins"
                        : "N/A"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyPerformance;
