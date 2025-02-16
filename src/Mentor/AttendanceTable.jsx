import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";

const AttendanceTable = () => {
  const navigate = useNavigate();
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();
  const [selectedLocation, setSelectedLocation] = useState("SelectLocation");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("SelectSubject");
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("SelectBatch");
  const [students, setStudents] = useState([]);
  const [uniqueStudents, setUniqueStudents] = useState([]); // Unique student list
  const [filteredStudents, setFilteredStudents] = useState([]); // Filtered students for search
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected student's attendance
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search query

  useEffect(() => {
    fetchMentorStudents();
  }, [fetchMentorStudents]);

  useEffect(() => {
    const location = localStorage.getItem("location");
    setSelectedLocation(location);
  }, []);

  useEffect(() => {
    const subjects = scheduleData.map((item) => item.subject);
    setAvailableSubjects([...new Set(subjects)]);
    setSelectedSubject("SelectSubject");
    setFilteredBatches([]);
  }, [scheduleData]);

  useEffect(() => {
    if (selectedSubject !== "SelectSubject") {
      const validBatches = scheduleData
        .filter((item) => item.subject === selectedSubject)
        .flatMap((item) => item.batchNo);
      setFilteredBatches(validBatches);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, scheduleData]);

  const fetchAttendanceData = useCallback(async () => {
    if (
      selectedLocation === "SelectLocation" ||
      selectedSubject === "SelectSubject" ||
      selectedBatch === "SelectBatch"
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getattends`, {
        params: {
          location: selectedLocation,
          subject: selectedSubject,
          batch: selectedBatch,
        },
      });

      const data = response.data?.data || [];
      const allStudents = data.flatMap((record) =>
        record.students.map((student) => ({
          studentId: student.studentId,
          name: student.name,
          status: student.status,
          remarks: student.remarks || "N/A",
          date: record.datetime,
          batchNo: record.batchNo,
          subject: record.course, // Added subject field
        }))
      );

      // Extract unique students based on studentId
      const unique = Array.from(
        new Map(allStudents.map((student) => [student.studentId, student])).values()
      );

      setStudents(allStudents);
      setUniqueStudents(unique);
      setFilteredStudents(unique); // Initialize filtered students
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setStudents([]);
      setUniqueStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedBatch, selectedSubject]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedLocation, selectedSubject, selectedBatch, fetchAttendanceData]);

  const handleStudentClick = (studentId) => {
    const studentAttendance = students.filter(
      (student) => student.studentId === studentId
    );
    setSelectedStudent(studentAttendance); // Set selected student's attendance
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredStudents(uniqueStudents); // Reset to original list
    } else {
      setFilteredStudents(
        uniqueStudents.filter(
          (student) =>
            student.studentId.toLowerCase().includes(query) ||
            student.name.toLowerCase().includes(query)
        )
      );
    }
  };

  const handleExportToExcel = () => {
    if (!students.length) {
      alert("No attendance data to export!");
      return;
    }

    // Prepare the data for export
    const formattedData = students.map((student, index) => ({
      "S.No": index + 1,
      "Student ID": student.studentId || "N/A",
      Name: student.name || "N/A",
      Status: student.status || "N/A",
      Remarks: student.remarks || "N/A",
      "Batch No": student.batchNo || "N/A",
      Subject: student.subject || "N/A", // Ensure subject is correctly included
      Date: student.date || "N/A",
    }));

    // Create a new workbook and sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Append the sheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Save the file
    XLSX.writeFile(wb, "Attendance_Summary.xlsx");
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <div className="container mx-auto p-6">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-8">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Student Attendance
          </span>
        </h1>
        <div className="mb-6 flex justify-between items-center">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="bg-green-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition"
            onClick={handleExportToExcel}
          >
            Export to Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Select Subject</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={availableSubjects.length === 0}
            >
              <option value="SelectSubject" disabled>
                Select Subject
              </option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Select Batch</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={filteredBatches.length === 0}
            >
              <option value="SelectBatch" disabled>
                Select Batch
              </option>
              {filteredBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Student ID or Name"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <p className="text-blue-600 font-semibold mt-6 text-center">Loading attendance data...</p>
        ) : selectedStudent ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6 relative">
            <div className="absolute top-6 right-6 space-y-4">
              <div className="bg-green-100 text-green-600 font-bold px-4 py-2 rounded-lg shadow-md">
                Present: {selectedStudent.filter((rec) => rec.status === "present").length}
              </div>
              <div className="bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg shadow-md">
                Absent: {selectedStudent.filter((rec) => rec.status === "absent").length}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">
              Attendance Details for {selectedStudent[0]?.name}
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              <strong>Batch:</strong> {selectedStudent[0]?.batchNo}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              <strong>Subject:</strong> {selectedStudent[0]?.subject}
            </p>
            
            <table className="w-full text-left border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 border-b border-gray-300">Date</th>
                  <th className="p-3 border-b border-gray-300">Status</th>
                  <th className="p-3 border-b border-gray-300">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.map((record, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="p-3 border-b border-gray-300">{record.date}</td>
                    <td
                      className={`p-3 border-b border-gray-300 ${
                        record.status === "present" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {record.status}
                    </td>
                    <td className="p-3 border-b border-gray-300">{record.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition"
              onClick={() => setSelectedStudent(null)}
            >
              Back to All Students
            </button>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
    <table className="w-full text-left border-collapse border border-gray-300 rounded-lg overflow-hidden">
      <thead className="bg-blue-100">
        <tr>
          <th className="p-3 border-b border-gray-300">S.No</th>
          <th className="p-3 border-b border-gray-300">Student ID</th>
          <th className="p-3 border-b border-gray-300">Name</th>
        </tr>
      </thead>
      <tbody>
        {filteredStudents.map((student, index) => (
          <tr
            key={index}
            className="hover:bg-blue-50 cursor-pointer"
            onClick={() => handleStudentClick(student.studentId)}
          >
            <td className="p-3 border-b border-gray-300">{index + 1}</td>
            <td className="p-3 border-b border-gray-300">{student.studentId}</td>
            <td className="p-3 border-b border-gray-300">{student.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
          </div>
        ) : (
          <p className="text-gray-500 font-semibold mt-6 text-center">
            No attendance records found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
