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
    fetchMentorStudents(selectedBatch);
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
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Heading - Mentor Curriculum */}
      <h1 className="text-[#132EE0] font-poppins font-semibold text-[24px] sm:text-[28px] md:text-[32px] leading-[32px] sm:leading-[40px] md:leading-[48px] text-center">
        Mentor Curriculum
      </h1>
  
      {/* Top Divider */}
      <div className="w-full max-w-[1200px] border-t border-[#D1D1D1] mt-4"></div>
  
      {/* Main White Container */}
      <div className="bg-white w-full max-w-[1200px] shadow-md rounded-md mt-6 p-6 flex flex-col">
        
        {/* Subject & Batch Selection */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 sm:px-8">
          
          {/* Select Subject */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <label className="text-[#132EE0] font-poppins font-semibold text-[18px] sm:text-[20px] w-full sm:w-[200px] mb-2 sm:mb-0">
              Select a Subject
            </label>
            <select
              className="w-full sm:w-[263px] h-[42px] sm:h-[46px] bg-white border border-gray-300 rounded-md px-3 shadow-md focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedSubject(e.target.value)}
              value={selectedSubject}
            >
              <option value="" className="text-gray-400">--Select Subject--</option>
              {availableSubjects.map((subject, index) => (
                <option key={index} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
  
          {/* Select Batch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <label className="text-[#132EE0] font-poppins font-semibold text-[18px] sm:text-[20px] w-full sm:w-[200px] mb-2 sm:mb-0">
              Select a Batch
            </label>
            <select
              className={`w-full sm:w-[263px] h-[42px] sm:h-[46px] border rounded-md px-3 shadow-md focus:ring-2 focus:ring-blue-500
                ${selectedSubject ? "bg-white border-gray-300 text-black" : "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"}`}
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={!selectedSubject} 
            >
              <option value="" disabled>Choose a batch</option>
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch, index) => (
                  <option key={index} value={batch}>{batch}</option>
                ))
              ) : (
                <option value="" disabled>No batches available</option>
              )}
            </select>
          </div>
        </div>
  
        {/* Divider */}
        <div className="w-full border-t border-[#303C60] mt-6"></div>
  
        {/* Curriculum Table Section */}
        <div className="bg-white rounded-md mt-6 min-h-[300px] sm:min-h-[400px] flex items-center justify-center px-4 sm:px-6">
          {syllabus.length > 0 && selectedBatch ? (
            <CurriculumTable
              classes={classes}
              fetchMentorStudents={fetchMentorStudents}
              syllabus={syllabus}
              mentorData={mentorData}
              subject={selectedSubject}
              batches={selectedBatch}
            />
          ) : (
            <p className="text-gray-500 text-center">No syllabus available</p>
          )}
        </div>
  
      </div>
    </div>
  );
  
};

export default Course;
