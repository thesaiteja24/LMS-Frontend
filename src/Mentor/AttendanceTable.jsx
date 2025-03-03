import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";
import { decryptData } from '../../cryptoUtils.jsx';

/** Convert "YY-MM-DD" => "YYYY-MM-DD". */
function convertDateYYMMDDtoYYYYMMDD(shortDate) {
  const parts = shortDate.split("-");
  if (parts.length !== 3) return "";
  const yy = parseInt(parts[0], 10);
  const mm = parts[1];
  const dd = parts[2];
  const fullYear = 2000 + yy;
  return `${fullYear.toString().padStart(4, "0")}-${mm}-${dd}`;
}

/** Return short weekday name from \"YYYY-MM-DD\" (e.g., \"Mon\"). */
function getDayName(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return "";
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.toLocaleDateString("en-US", { weekday: "short" });
}

/** Check if \"YYYY-MM-DD\" is Sunday => override status with \"-\". */
function isSunday(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return false;
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.getDay() === 0; // 0 => Sunday
}

const AttendanceTable = () => {
  const navigate = useNavigate();
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();

  // ----------- FILTER STATE -----------
  const [selectedLocation, setSelectedLocation] = useState("SelectLocation");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("SelectSubject");
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("SelectBatch");
  const [searchQuery, setSearchQuery] = useState("");

  // Data from server
  const [loading, setLoading] = useState(false);

  // The raw flattened data from server, still used for reference
  const [records, setRecords] = useState([]);
  // We'll do a map of: studentId => { name, daily: { date => { status, remarks } } }
  const [studentMap, setStudentMap] = useState({});
  // Distinct sorted dates, e.g. ["2025-02-17", "2025-02-18"]
  const [uniqueDates, setUniqueDates] = useState([]);

  useEffect(() => {
    fetchMentorStudents(selectedBatch);
  }, [fetchMentorStudents, selectedBatch]);

  useEffect(() => {
    const location = decryptData(localStorage.getItem("location"));
    setSelectedLocation(location);
  }, []);

  // Build subject drop-down from scheduleData
  useEffect(() => {
    const subjects = scheduleData.map((item) => item.subject);
    setAvailableSubjects([...new Set(subjects)]);
    setSelectedSubject("SelectSubject");
    setFilteredBatches([]);
  }, [scheduleData]);

  // Filter batches when subject changes
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

  // ------------- Fetch Data -------------
  const fetchAttendanceData = useCallback(async () => {
    // Only fetch if location, subject, batch are chosen
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

      // We'll flatten but immediately transform to a multi-day map
      setRecords(data); // Keep the raw if needed
      transformDataToSpreadsheet(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setRecords([]);
      setStudentMap({});
      setUniqueDates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedSubject, selectedBatch]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // ------------- Transform to a multi-day map -------------
  function transformDataToSpreadsheet(rawData) {
    const dateSet = new Set();
    const map = {};

    // rawData is an array, each entry might have {datetime, course, batchNo, students: [...]}
    rawData.forEach((record) => {
      const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);
      dateSet.add(isoDate);

      record.students.forEach((stu) => {
        const { studentId, name, status, remarks } = stu;
        if (!map[studentId]) {
          map[studentId] = {
            studentId,
            name: name || "Unknown",
            daily: {},
          };
        }
        // store date => {status, remarks}
        map[studentId].daily[isoDate] = {
          status: status || "",
          remarks: remarks || "",
        };
      });
    });

    const sortedDates = Array.from(dateSet).sort();
    setUniqueDates(sortedDates);
    setStudentMap(map);
  }

  // ------------- Build array of students, then apply search filter -------------
  const allStudents = Object.values(studentMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const displayedStudents = allStudents.filter((stu) => {
    // If search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = stu.name.toLowerCase().includes(q);
      const matchesId = stu.studentId.toLowerCase().includes(q);
      if (!matchesName && !matchesId) return false;
    }
    return true;
  });

  // ------------- Totals -------------
  // We'll skip Sunday from present/absent. If you want Sunday to be absent, remove the skip.
  function getTotals(stu) {
    let presentCount = 0;
    let absentCount = 0;
    const totalDays = uniqueDates.length;

    uniqueDates.forEach((dt) => {
      if (isSunday(dt)) return; // skip Sunday
      const info = stu.daily[dt] || {};
      let status = info.status?.toLowerCase() || "";
      // If missing => 'Working' on weekdays, not counted as present or absent
      if (!status) {
        status = "working";
      }
      if (status === "present") presentCount++;
      else if (status === "absent" || status === "ab") absentCount++;
    });
    return { presentCount, absentCount, totalDays };
  }

  // ------------- Excel Export -------------
  const handleExportToExcel = () => {
    if (!records.length) {
      alert("No attendance data to export!");
      return;
    }

    const wb = XLSX.utils.book_new();
    const rows = displayedStudents.map((stu, idx) => {
      const row = {
        "S.No": idx + 1,
        "Student ID": stu.studentId,
        Name: stu.name,
      };

      uniqueDates.forEach((dt) => {
        const dayName = getDayName(dt);
        if (isSunday(dt)) {
          row[`${dt} (${dayName}) - Status`] = "-";
          row[`${dt} (${dayName}) - Remarks`] = "-";
        } else {
          const info = stu.daily[dt] || {};
          let st = info.status || "";
          let rm = info.remarks || "";
          if (!st) {
            st = "Working";
          }
          row[`${dt} (${dayName}) - Status`] = st;
          row[`${dt} (${dayName}) - Remarks`] = rm;
        }
      });

      const { presentCount, absentCount, totalDays } = getTotals(stu);
      row["Total Present"] = presentCount;
      row["Total Absent"] = absentCount;
      row["Total Days"] = totalDays;

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Spreadsheet.xlsx");
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <div className="container mx-auto p-6">
        {/* Title */}
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-8">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Student Attendance
          </span>
        </h1>

        {/* Top buttons */}
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

        {/* Subject & Batch Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Select Subject
            </label>
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
            <label className="block mb-2 font-semibold text-gray-700">
              Select Batch
            </label>
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

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Student ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>

        {/* Loading or table */}
        {loading ? (
          <p className="text-blue-600 font-semibold mt-6 text-center">
            Loading attendance data...
          </p>
        ) : displayedStudents.length === 0 ? (
          <p className="text-gray-500 font-semibold mt-6 text-center">
            No attendance records found.
          </p>
        ) : (
          // Multi-date spreadsheet table
          <div className="bg-white rounded-lg shadow-lg p-4 overflow-x-auto">
            <table className="border-collapse border border-gray-300 min-w-full text-sm">
              <thead>
                {/* First row: S.No, Student ID, Name => rowSpan=2
                  and each date => colSpan=2
                  also a final set of columns for totals */}
                <tr className="bg-blue-500 text-white">
                  <th className="p-2 border sticky left-0 bg-blue-500 z-10" rowSpan={2}>
                    S.No
                  </th>
                  <th className="p-2 border sticky left-14 bg-blue-500 z-10" rowSpan={2}>
                    Student ID
                  </th>
                  <th className="p-2 border sticky left-36 bg-blue-500 z-10" rowSpan={2}>
                    Name
                  </th>

                  {uniqueDates.map((dt) => {
                    const dayName = getDayName(dt);
                    return (
                      <th
                        key={dt}
                        className="p-2 border text-center"
                        colSpan={2}
                        style={{ minWidth: "100px" }}
                      >
                        {dt} ({dayName})
                      </th>
                    );
                  })}

                  <th className="p-2 border text-center" rowSpan={2}>
                    Total Present
                  </th>
                  <th className="p-2 border text-center" rowSpan={2}>
                    Total Absent
                  </th>
                  <th className="p-2 border text-center" rowSpan={2}>
                    Total Days
                  </th>
                </tr>
                {/* Second row: sub-columns: Status & Remarks for each date */}
                <tr className="bg-blue-400 text-white">
                  {uniqueDates.map((dt) => (
                    <React.Fragment key={dt}>
                      <th className="p-2 border text-center">Status</th>
                      <th className="p-2 border text-center">Remarks</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((stu, index) => {
                  // Totals
                  let presentCount = 0;
                  let absentCount = 0;
                  const totalDays = uniqueDates.length;

                  uniqueDates.forEach((dt) => {
                    if (isSunday(dt)) return;
                    const info = stu.daily[dt] || {};
                    let st = info.status?.toLowerCase() || "";
                    if (!st) st = "working";
                    if (st === "present") presentCount++;
                    else if (st === "absent" || st === "ab") absentCount++;
                  });

                  return (
                    <tr key={stu.studentId} className="hover:bg-blue-50">
                      {/* S.No */}
                      <td
                        className="p-2 border text-center font-semibold sticky left-0 bg-gray-100 z-10"
                        style={{ minWidth: "50px" }}
                      >
                        {index + 1}
                      </td>
                      {/* Student ID */}
                      <td
                        className="p-2 border sticky left-14 bg-gray-100 z-10"
                        style={{ minWidth: "70px" }}
                      >
                        {stu.studentId}
                      </td>
                      {/* Name */}
                      <td
                        className="p-2 border sticky left-36 bg-gray-100 z-10"
                        style={{ minWidth: "150px" }}
                      >
                        {stu.name}
                      </td>

                      {/* For each date => two columns: (Status, Remarks) */}
                      {uniqueDates.map((dt) => {
                        if (isSunday(dt)) {
                          // Sunday => override
                          return (
                            <React.Fragment key={dt}>
                              <td className="p-2 border text-center font-semibold">-</td>
                              <td className="p-2 border text-center">-</td>
                            </React.Fragment>
                          );
                        } else {
                          const info = stu.daily[dt] || {};
                          let st = info.status || "";
                          let rm = info.remarks || "";
                          if (!st) {
                            st = "Working";
                          }
                          const isAbsent = st.toLowerCase() === "absent" || st.toLowerCase() === "ab";
                          return (
                            <React.Fragment key={dt}>
                              <td
                                className={`p-2 border text-center font-semibold ${
                                  isAbsent ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {st}
                              </td>
                              <td className="p-2 border text-center">{rm}</td>
                            </React.Fragment>
                          );
                        }
                      })}

                      {/* Totals columns */}
                      <td className="p-2 border text-green-700 font-semibold text-center">
                        {presentCount}
                      </td>
                      <td className="p-2 border text-red-600 font-semibold text-center">
                        {absentCount}
                      </td>
                      <td className="p-2 border text-purple-700 font-semibold text-center">
                        {totalDays}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
