import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import CurriculumTable from "./CurriculumTable";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";

const Course = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [syllabus, setSyllabus] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const { classes, mentorData, scheduleData, fetchMentorStudents } =
    useStudentsMentorData();
  const location = localStorage.getItem("location");
  const [selectedBatch, setSelectedBatch] = useState(""); // Add this at the top

  useEffect(() => {
    fetchMentorStudents();
  }, [fetchMentorStudents]);

  useEffect(() => {
    if (Array.isArray(scheduleData)) {
      const uniqueSubjects = [
        ...new Set(scheduleData.map((item) => item.subject)),
      ];
      setAvailableSubjects(uniqueSubjects);
    }
  }, [scheduleData]);

  // Dynamically filter batches based on selected subject
  useEffect(() => {
    if (selectedSubject && Array.isArray(scheduleData)) {
      const batches = scheduleData
        .filter((entry) => entry.subject === selectedSubject) // Filter by subject
        .flatMap((entry) => entry.batchNo); // Flatten batchNo lists
      setFilteredBatches(batches); // Store filtered batches
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, scheduleData]);

  const fetchMentorSyllabus = async () => {
    fetchMentorStudents(selectedBatch);
    if (selectedSubject && selectedBatch && location) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`,
          {
            params: {
              subject: selectedSubject,
              location,
              batches: selectedBatch,
            },
          }
        );
        // console.log("Backend Response:", response.data);
        setSyllabus(response.data.curriculum);
      } catch (error) {
        console.error("Error fetching mentor syllabus:", error);
      }
    }
  };

  useEffect(() => {
    fetchMentorSyllabus();
  }, [selectedSubject, selectedBatch, location]);

  return (
    <div className="h-full bg-blue-100 py-10 px-5">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-black text-center mb-6">
          Mentor Curriculum
        </h1>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-sky-200 p-4 rounded-lg shadow-md">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-col items-center bg-sky-200 space-y-4 md:space-y-6 px-6 py-6 rounded-lg shadow-lg max-w-md mx-auto">
                <label className="text-lg font-semibold text-black md:text-xl">
                  Select a Subject:
                </label>
                <select
                  className="w-full px-4 py-2 text-sm md:text-base bg-white text-gray-700 rounded-md border border-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-600 focus:border-transparent shadow-md hover:shadow-lg transition duration-300"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  value={selectedSubject}
                >
                  <option value="" className="text-gray-400">
                    --Select Subject--
                  </option>
                  {availableSubjects.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* {selectedSubject && (
              <div className="flex-1 min-w-[200px]">
                <div className="flex flex-col items-center bg-sky-200 space-y-4 md:space-y-6 px-6 py-6 rounded-lg shadow-lg max-w-md mx-auto">
                  <label
                    htmlFor="batch-selector"
                    className="text-xl font-semibold text-black text-center"
                  >
                    Available Batches:
                  </label>
                  <p className="text-lg text-gray-700">
                    {filteredBatches.length > 0
                      ? filteredBatches.join(", ")
                      : "No batches available for this subject."}
                  </p>
                </div>
              </div>
            )} */}
            {selectedSubject && (
              <div className="flex-1 min-w-[200px]">
                <div className="flex flex-col items-center bg-sky-200 space-y-4 md:space-y-6 px-6 py-6 rounded-lg shadow-lg max-w-md mx-auto">
                  <label
                    htmlFor="batch-selector"
                    className="text-xl font-semibold text-black text-center"
                  >
                    Select a Batch:
                  </label>

                  {filteredBatches.length > 0 ? (
                    <select
                      id="batch-selector"
                      className="w-full px-4 py-2 text-lg text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedBatch} // Bind selected value
                      onChange={(e) => setSelectedBatch(e.target.value)} // Update selected batch
                    >
                      <option value="" disabled>
                        Choose a batch
                      </option>
                      {filteredBatches.map((batch, index) => (
                        <option key={index} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg text-gray-700">
                      No batches available for this subject.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {syllabus.length > 0 && selectedBatch && (
            <div className="bg-sky-200 p-4 rounded-lg shadow-md">
              <CurriculumTable
                classes={classes}
                fetchMentorStudents={fetchMentorStudents}
                syllabus={syllabus}
                mentorData={mentorData}
                subject={selectedSubject}
                batches={selectedBatch} // ✅ Pass only the selected batch
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
