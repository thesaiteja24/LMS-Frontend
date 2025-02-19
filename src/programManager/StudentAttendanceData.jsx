// import React, { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
// import axios from "axios";
// import { useUniqueBatches } from "../contexts/UniqueBatchesContext";

// /** 1) Convert "YY-MM-DD" => "YYYY-MM-DD" for consistent filtering with <input type="date" />. */
// function convertDateYYMMDDtoYYYYMMDD(shortDate) {
//   // e.g. "25-02-17" => ["25","02","17"]
//   const parts = shortDate.split("-");
//   if (parts.length !== 3) return "";
//   const yy = parseInt(parts[0], 10);
//   const mm = parts[1];
//   const dd = parts[2];
//   const fullYear = yy + 2000;
//   return `${fullYear.toString().padStart(4, "0")}-${mm}-${dd}`;
// }

// /** 2) Get short day name: "Mon", "Sun", etc. from "YYYY-MM-DD". */
// function getDayName(isoDate) {
//   const [yyyy, mm, dd] = isoDate.split("-");
//   if (!yyyy || !mm || !dd) return "";
//   const dateObj = new Date(+yyyy, +mm - 1, +dd);
//   return dateObj.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Mon"
// }

// /** 3) Check if "YYYY-MM-DD" is Sunday. */
// function isSunday(isoDate) {
//   const [yyyy, mm, dd] = isoDate.split("-");
//   if (!yyyy || !mm || !dd) return false;
//   const dateObj = new Date(+yyyy, +mm - 1, +dd);
//   return dateObj.getDay() === 0; // 0 => Sunday
// }

// /** TechStack references (example) */
// const techStackSubjects = {
//   vijayawada: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
//   hyderabad: ["Python Full Stack (PFS)", "Java Full Stack (JFS)", "DataScience", "DataAnalytics"],
//   bangalore: ["Java Full Stack (JFS)"],
// };

// /** Subject references (example) */
// const mockSubjects = {
//   Python: ["Python Full Stack (PFS)"],
//   Java: ["Java Full Stack (JFS)"],
//   AdvancedJava: ["Java Full Stack (JFS)"],
//   Flask: ["Python Full Stack (PFS)"],
//   Frontend: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
//   MySQL: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
//   SoftSkills: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
//   Aptitude: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
//   DataScience: ["DataScience"],
//   DataAnalytics: ["DataAnalytics"],
// };

// const StudentAttendanceData = () => {
//   // ---------------- FILTER STATES ----------------
//   const [selectedLocation, setSelectedLocation] = useState("SelectLocation");
//   const [selectedTechStack, setSelectedTechStack] = useState("SelectTechStack");
//   const [availableTechStacks, setAvailableTechStacks] = useState([]);
//   const [availableSubjects, setAvailableSubjects] = useState([]);
//   const [selectedSubject, setSelectedSubject] = useState("SelectSubject");
//   const [filteredBatches, setFilteredBatches] = useState([]);
//   const [selectedBatch, setSelectedBatch] = useState("SelectBatch");

//   // Additional filters
//   const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD"
//   const [searchQuery, setSearchQuery] = useState("");

//   const [loading, setLoading] = useState(false);

//   // If you have a context for batches:
//   const { batches, fetchBatches } = useUniqueBatches();

//   // ---------------- ATTENDANCE STATES ----------------
//   // We'll store the raw data and a transformed map
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   /**
//    * We'll store each date's `status` and `remarks` in the map:
//    * studentMap[studentId] = {
//    *   studentId,
//    *   name,
//    *   daily: {
//    *     "YYYY-MM-DD": { status, remarks },
//    *     ...
//    *   }
//    * }
//    */
//   const [studentMap, setStudentMap] = useState({});
//   // a sorted array of "YYYY-MM-DD" dates
//   const [uniqueDates, setUniqueDates] = useState([]);

//   // ---------------- Load location from localStorage ----------------
//   useEffect(() => {
//     const location = localStorage.getItem("location");
//     if (location) setSelectedLocation(location);
//   }, []);

//   // ---------------- When location changes ----------------
//   useEffect(() => {
//     if (selectedLocation !== "SelectLocation") {
//       setAvailableTechStacks(techStackSubjects[selectedLocation] || []);
//       setSelectedTechStack("SelectTechStack");
//       setAvailableSubjects([]);
//       setSelectedSubject("SelectSubject");
//       setFilteredBatches([]);
//     } else {
//       setAvailableTechStacks([]);
//     }
//   }, [selectedLocation]);

//   // ---------------- When techStack changes ----------------
//   useEffect(() => {
//     if (selectedTechStack !== "SelectTechStack") {
//       const subjects = Object.keys(mockSubjects).filter((subj) =>
//         mockSubjects[subj].includes(selectedTechStack)
//       );
//       setAvailableSubjects(subjects);
//       setSelectedSubject("SelectSubject");

//       fetchBatches(selectedLocation);
//       setFilteredBatches([]);
//     } else {
//       setAvailableSubjects([]);
//     }
//   }, [selectedTechStack, selectedLocation, fetchBatches]);

//   // ---------------- When subject changes, filter your batches ----------------
//   useEffect(() => {
//     if (selectedSubject !== "SelectSubject") {
//       const validCourses = mockSubjects[selectedSubject];
//       const filtered = batches.filter((b) => validCourses.includes(b.Course));
//       setFilteredBatches(filtered);
//     } else {
//       setFilteredBatches([]);
//     }
//   }, [selectedSubject, batches]);

//   // ---------------- Fetch data ----------------
//   const fetchAttendanceData = useCallback(async () => {
//     // only fetch if location, techStack, subject, batch are all set
//     if (
//       selectedLocation === "SelectLocation" ||
//       selectedTechStack === "SelectTechStack" ||
//       selectedSubject === "SelectSubject" ||
//       selectedBatch === "SelectBatch"
//     ) {
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getattends`, {
//         params: {
//           location: selectedLocation,
//           techStack: selectedTechStack,
//           subject: selectedSubject,
//           batch: selectedBatch,
//         },
//       });
//       const data = response.data?.data || [];

//       setAttendanceRecords(data);
//       transformData(data);
//     } catch (error) {
//       console.error("Error fetching attendance data:", error);
//       setAttendanceRecords([]);
//       setStudentMap({});
//       setUniqueDates([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedLocation, selectedTechStack, selectedSubject, selectedBatch]);

//   useEffect(() => {
//     fetchAttendanceData();
//   }, [fetchAttendanceData]);

//   // ---------------- Transform data: "YY-MM-DD" => "YYYY-MM-DD", store {status, remarks} ----------------
//   function transformData(rawData) {
//     const dateSet = new Set();
//     const map = {};

//     rawData.forEach((record) => {
//       // e.g. "25-02-17"
//       const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);
//       dateSet.add(isoDate);

//       record.students.forEach((stu) => {
//         if (!map[stu.studentId]) {
//           map[stu.studentId] = {
//             studentId: stu.studentId,
//             name: stu.name || "Unknown",
//             daily: {}, // { isoDate: { status, remarks } }
//           };
//         }
//         map[stu.studentId].daily[isoDate] = {
//           status: stu.status || "-",
//           remarks: stu.remarks || "",
//         };
//       });
//     });

//     const sortedDates = Array.from(dateSet).sort();
//     setUniqueDates(sortedDates);
//     setStudentMap(map);
//   }

//   // ---------------- Build array from studentMap ----------------
//   const allStudents = Object.values(studentMap).sort((a, b) =>
//     a.name.localeCompare(b.name)
//   );

//   // ---------------- Filter by search & date ----------------
//   const displayedStudents = allStudents.filter((stu) => {
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       if (
//         !stu.studentId.toLowerCase().includes(q) &&
//         !stu.name.toLowerCase().includes(q)
//       ) {
//         return false;
//       }
//     }
//     // date => "YYYY-MM-DD"
//     if (selectedDate) {
//       if (!stu.daily[selectedDate]) {
//         return false;
//       }
//     }
//     return true;
//   });

//   // ---------------- Totals per student ----------------
//   function getTotals(stu) {
//     let presentCount = 0;
//     let absentCount = 0;
//     // totalDays might include Sunday or skip it. We'll include it:
//     const totalDays = uniqueDates.length;

//     uniqueDates.forEach((dt) => {
//       if (isSunday(dt)) return; // skip Sunday's effect on totals if you want
//       const info = stu.daily[dt] || {};
//       const val = (info.status || "").toLowerCase();
//       if (val === "present") presentCount++;
//       else if (val === "absent" || val === "ab") absentCount++;
//     });
//     return { presentCount, absentCount, totalDays };
//   }

//   // ---------------- Excel Export (2 columns per date: Status, Remarks) ----------------
//   const handleExportToExcel = () => {
//     if (!attendanceRecords.length) {
//       alert("No attendance data to export!");
//       return;
//     }
//     const wb = XLSX.utils.book_new();

//     // We'll do a wide format with 2 columns per date: [date (dayName) - Status], [date (dayName) - Remarks]
//     const rows = displayedStudents.map((stu, i) => {
//       const row = {
//         "S.No": i + 1,
//         "Student ID": stu.studentId,
//         Name: stu.name,
//       };
//       uniqueDates.forEach((dt) => {
//         const dayName = getDayName(dt);
//         let status = "-";
//         let remarks = "";
//         if (stu.daily[dt]) {
//           status = stu.daily[dt].status || "-";
//           remarks = stu.daily[dt].remarks || "";
//         }
//         if (isSunday(dt)) {
//           // force Sunday => "-"
//           status = "-";
//           remarks = "-";
//         }
//         // e.g.: "2025-02-17 (Mon) - Status"  /  "2025-02-17 (Mon) - Remarks"
//         row[`${dt} (${dayName}) - Status`] = status;
//         row[`${dt} (${dayName}) - Remarks`] = remarks;
//       });

//       const { presentCount, absentCount, totalDays } = getTotals(stu);
//       row["Total Present"] = presentCount;
//       row["Total Absent"] = absentCount;
//       row["Total Days"] = totalDays;
//       return row;
//     });

//     const ws = XLSX.utils.json_to_sheet(rows);
//     XLSX.utils.book_append_sheet(wb, ws, "Attendance");
//     XLSX.writeFile(wb, "Attendance_Spreadsheet.xlsx");
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen p-4 md:p-6">
//       <h1 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 mb-4 md:mb-8">
//         <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
//           Student Attendance
//         </span>
//       </h1>

//       {/* FILTERS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
//         {/* Tech Stack */}
//         <div>
//           <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
//             Select Tech Stack
//           </label>
//           <select
//             className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
//             value={selectedTechStack}
//             onChange={(e) => setSelectedTechStack(e.target.value)}
//             disabled={availableTechStacks.length === 0}
//           >
//             <option value="SelectTechStack" disabled>
//               Select Tech Stack
//             </option>
//             {availableTechStacks.map((ts) => (
//               <option key={ts} value={ts}>
//                 {ts}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Subject */}
//         <div>
//           <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
//             Select Subject
//           </label>
//           <select
//             className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
//             value={selectedSubject}
//             onChange={(e) => setSelectedSubject(e.target.value)}
//             disabled={availableSubjects.length === 0}
//           >
//             <option value="SelectSubject" disabled>
//               Select Subject
//             </option>
//             {availableSubjects.map((sub) => (
//               <option key={sub} value={sub}>
//                 {sub}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Batch */}
//         <div>
//           <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
//             Select Batch
//           </label>
//           <select
//             className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
//             value={selectedBatch}
//             onChange={(e) => setSelectedBatch(e.target.value)}
//             disabled={filteredBatches.length === 0}
//           >
//             <option value="SelectBatch" disabled>
//               Select Batch
//             </option>
//             {filteredBatches.map((b) => (
//               <option key={b.Batch} value={b.Batch}>
//                 {b.Batch}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Date */}
//         <div>
//           <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
//             Filter By Date
//           </label>
//           <input
//             type="date"
//             className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//           />
//         </div>

//         {/* Search */}
//         <div>
//           <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
//             Search by Student
//           </label>
//           <input
//             type="text"
//             className="w-full px-2 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
//             placeholder="Name / ID"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
//           />
//         </div>
//       </div>

//       {/* ACTION BUTTONS */}
//       <div className="mb-4 md:mb-6 flex justify-end items-center">
//         <button
//           className="bg-green-600 text-white py-1 px-3 md:py-2 md:px-4 rounded text-xs md:text-sm hover:bg-green-700"
//           onClick={handleExportToExcel}
//         >
//           Export to Excel
//         </button>
//       </div>

//       {/* TABLE */}
//       {loading ? (
//         <p className="text-blue-600 font-semibold mt-4 md:mt-6">
//           Loading attendance data...
//         </p>
//       ) : displayedStudents.length === 0 ? (
//         <p className="text-gray-500 font-semibold mt-4 md:mt-6">
//           No attendance records found.
//         </p>
//       ) : (
//         <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
//           <table className="border-collapse min-w-full text-xs md:text-sm">
//             <thead>
//               {/* 
//                 Multi-row header:
//                 1st row: S.no, StudentID, Name, then for each date => colSpan=2, then totals 
//                 2nd row: each date => (Status, Remarks)
//               */}
//               <tr className="bg-blue-500 text-white">
//                 <th
//                   className="p-1 md:p-2 border sticky left-0 bg-blue-500 z-10"
//                   rowSpan={2}
//                   style={{ minWidth: "40px" }}
//                 >
//                   S.no
//                 </th>
//                 <th
//                   className="p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-blue-500 z-10"
//                   rowSpan={2}
//                   style={{ minWidth: "70px" }}
//                 >
//                   Student ID
//                 </th>
//                 <th
//                   className="p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-blue-500 z-10"
//                   rowSpan={2}
//                   style={{ minWidth: "120px" }}
//                 >
//                   Name
//                 </th>

//                 {uniqueDates.map((dt) => {
//                   const dayName = getDayName(dt);
//                   return (
//                     <th
//                       key={dt}
//                       colSpan={2}
//                       className="p-1 md:p-2 border text-center"
//                       style={{ minWidth: "120px" }}
//                     >
//                       {dt} ({dayName})
//                     </th>
//                   );
//                 })}
//                 {/* Totals */}
//                 <th
//                   className="p-1 md:p-2 border text-center"
//                   rowSpan={2}
//                   style={{ minWidth: "80px" }}
//                 >
//                   Total Present
//                 </th>
//                 <th
//                   className="p-1 md:p-2 border text-center"
//                   rowSpan={2}
//                   style={{ minWidth: "80px" }}
//                 >
//                   Total Absent
//                 </th>
//                 <th
//                   className="p-1 md:p-2 border text-center"
//                   rowSpan={2}
//                   style={{ minWidth: "70px" }}
//                 >
//                   Total Days
//                 </th>
//               </tr>
//               <tr className="bg-blue-400 text-white">
//                 {uniqueDates.map((dt) => (
//                   <React.Fragment key={dt}>
//                     <th className="p-1 md:p-2 border text-center" style={{ minWidth: "60px" }}>
//                       Status
//                     </th>
//                     <th className="p-1 md:p-2 border text-center" style={{ minWidth: "60px" }}>
//                       Remarks
//                     </th>
//                   </React.Fragment>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {displayedStudents.map((stu, index) => {
//                 const { presentCount, absentCount, totalDays } = getTotals(stu);
//                 return (
//                   <tr key={stu.studentId} className="hover:bg-blue-50">
//                     {/* S.no */}
//                     <td
//                       className="p-1 md:p-2 border text-center font-semibold sticky left-0 bg-gray-100 z-10"
//                       style={{ minWidth: "40px" }}
//                     >
//                       {index + 1}
//                     </td>
//                     {/* Student ID */}
//                     <td
//                       className="p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-gray-100 z-10"
//                       style={{ minWidth: "70px" }}
//                     >
//                       {stu.studentId}
//                     </td>
//                     {/* Name */}
//                     <td
//                       className="p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-gray-100 z-10"
//                       style={{ minWidth: "120px" }}
//                     >
//                       {stu.name}
//                     </td>

//                     {/* For each date, 2 columns => Status, Remarks */}
//                     {uniqueDates.map((dateStr) => {
//                       // If Sunday => override both with "-"
//                       if (isSunday(dateStr)) {
//                         return (
//                           <React.Fragment key={dateStr}>
//                             <td className="p-1 md:p-2 border text-center font-semibold text-black">
//                               -
//                             </td>
//                             <td className="p-1 md:p-2 border text-center text-black">-</td>
//                           </React.Fragment>
//                         );
//                       } else {
//                         // Normal day => show stored status & remarks
//                         const info = stu.daily[dateStr] || { status: "-", remarks: "" };
//                         const isAbsent =
//                           info.status.toLowerCase() === "absent" ||
//                           info.status.toLowerCase() === "ab";
//                         return (
//                           <React.Fragment key={dateStr}>
//                             <td
//                               className={`p-1 md:p-2 border text-center font-semibold ${
//                                 isAbsent ? "text-red-600" : "text-black"
//                               }`}
//                             >
//                               {info.status}
//                             </td>
//                             <td className="p-1 md:p-2 border text-center text-gray-700">
//                               {info.remarks || ""}
//                             </td>
//                           </React.Fragment>
//                         );
//                       }
//                     })}
//                     {/* Totals */}
//                     <td
//                       className="p-1 md:p-2 border text-green-700 font-semibold text-center"
//                       style={{ minWidth: "80px" }}
//                     >
//                       {presentCount}
//                     </td>
//                     <td
//                       className="p-1 md:p-2 border text-red-600 font-semibold text-center"
//                       style={{ minWidth: "80px" }}
//                     >
//                       {absentCount}
//                     </td>
//                     <td
//                       className="p-1 md:p-2 border text-purple-700 font-semibold text-center"
//                       style={{ minWidth: "70px" }}
//                     >
//                       {totalDays}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentAttendanceData;
import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useUniqueBatches } from "../contexts/UniqueBatchesContext";

/** Convert "YY-MM-DD" => "YYYY-MM-DD". Example: "25-02-17" => "2025-02-17" */
function convertDateYYMMDDtoYYYYMMDD(shortDate) {
  const parts = shortDate.split("-");
  if (parts.length !== 3) return "";
  const yy = parseInt(parts[0], 10);
  const mm = parts[1];
  const dd = parts[2];
  const fullYear = yy + 2000;
  return `${fullYear.toString().padStart(4, "0")}-${mm}-${dd}`;
}

/** Get short weekday name from "YYYY-MM-DD", e.g. "Mon". */
function getDayName(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return "";
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue", etc.
}

/** Check if the given "YYYY-MM-DD" is Sunday. */
function isSunday(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return false;
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.getDay() === 0; // 0 => Sunday
}

const techStackSubjects = {
  vijayawada: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
  hyderabad: ["Python Full Stack (PFS)", "Java Full Stack (JFS)", "DataScience", "DataAnalytics"],
  bangalore: ["Java Full Stack (JFS)"],
};

const mockSubjects = {
  Python: ["Python Full Stack (PFS)"],
  Java: ["Java Full Stack (JFS)"],
  AdvancedJava: ["Java Full Stack (JFS)"],
  Flask: ["Python Full Stack (PFS)"],
  Frontend: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
  MySQL: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
  SoftSkills: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
  Aptitude: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
  DataScience: ["DataScience"],
  DataAnalytics: ["DataAnalytics"],
};

const StudentAttendanceData = () => {
  // ---------------- FILTER STATES ----------------
  const [selectedLocation, setSelectedLocation] = useState("SelectLocation");
  const [selectedTechStack, setSelectedTechStack] = useState("SelectTechStack");
  const [availableTechStacks, setAvailableTechStacks] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("SelectSubject");
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("SelectBatch");

  // Additional filters
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const { batches, fetchBatches } = useUniqueBatches();

  // ---------------- ATTENDANCE STATES ----------------
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  /**
   * We'll store each date's { status, remarks } in the map:
   * studentMap[studentId] = {
   *   studentId,
   *   name,
   *   daily: {
   *     "YYYY-MM-DD": { status, remarks },
   *     ...
   *   }
   * }
   */
  const [studentMap, setStudentMap] = useState({});
  // a list of "YYYY-MM-DD" dates
  const [uniqueDates, setUniqueDates] = useState([]);

  // ---------------- LOAD LOCATION FROM LOCALSTORAGE ----------------
  useEffect(() => {
    const location = localStorage.getItem("location");
    if (location) setSelectedLocation(location);
  }, []);

  // ---------------- WHEN LOCATION CHANGES ----------------
  useEffect(() => {
    if (selectedLocation !== "SelectLocation") {
      setAvailableTechStacks(techStackSubjects[selectedLocation] || []);
      setSelectedTechStack("SelectTechStack");
      setAvailableSubjects([]);
      setSelectedSubject("SelectSubject");
      setFilteredBatches([]);
    } else {
      setAvailableTechStacks([]);
    }
  }, [selectedLocation]);

  // ---------------- WHEN TECH STACK CHANGES ----------------
  useEffect(() => {
    if (selectedTechStack !== "SelectTechStack") {
      const subjects = Object.keys(mockSubjects).filter((subj) =>
        mockSubjects[subj].includes(selectedTechStack)
      );
      setAvailableSubjects(subjects);
      setSelectedSubject("SelectSubject");

      fetchBatches(selectedLocation);
      setFilteredBatches([]);
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedTechStack, selectedLocation, fetchBatches]);

  // ---------------- WHEN SUBJECT CHANGES ----------------
  useEffect(() => {
    if (selectedSubject !== "SelectSubject") {
      const validCourses = mockSubjects[selectedSubject];
      const filtered = batches.filter((b) => validCourses.includes(b.Course));
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, batches]);

  // ---------------- FETCH DATA ----------------
  const fetchAttendanceData = useCallback(async () => {
    if (
      selectedLocation === "SelectLocation" ||
      selectedTechStack === "SelectTechStack" ||
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
          techStack: selectedTechStack,
          subject: selectedSubject,
          batch: selectedBatch,
        },
      });
      const data = response.data?.data || [];

      setAttendanceRecords(data);
      transformData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceRecords([]);
      setStudentMap({});
      setUniqueDates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedTechStack, selectedSubject, selectedBatch]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // ---------------- TRANSFORM & STORE (YY-MM-DD => YYYY-MM-DD) & status/remarks ----------------
  function transformData(rawData) {
    const dateSet = new Set();
    const map = {};

    rawData.forEach((record) => {
      const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);
      dateSet.add(isoDate);

      record.students.forEach((stu) => {
        if (!map[stu.studentId]) {
          map[stu.studentId] = {
            studentId: stu.studentId,
            name: stu.name || "Unknown",
            daily: {}, // date => { status, remarks }
          };
        }
        map[stu.studentId].daily[isoDate] = {
          status: stu.status || "",
          remarks: stu.remarks || "",
        };
      });
    });

    const sortedDates = Array.from(dateSet).sort();
    setUniqueDates(sortedDates);
    setStudentMap(map);
  }

  // ---------------- BUILD STUDENT ARRAY & FILTER ----------------
  const allStudents = Object.values(studentMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const displayedStudents = allStudents.filter((stu) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!stu.studentId.toLowerCase().includes(q) && !stu.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedDate) {
      if (!stu.daily[selectedDate]) {
        return false;
      }
    }
    return true;
  });

  // ---------------- TOTALLING ----------------
  function getTotals(stu) {
    let presentCount = 0;
    let absentCount = 0;
    // totalDays = uniqueDates.length (including Sunday if you want)
    const totalDays = uniqueDates.length;

    uniqueDates.forEach((dt) => {
      // If it's Sunday => skip
      if (isSunday(dt)) return;

      // If there's a record, check status; otherwise treat as 'Working'
      let info = stu.daily[dt];
      let status = info ? info.status.toLowerCase() : "working";

      // If you prefer "Working" to count as present, do that here:
      // For now, "Working" is neither present nor absent.
      if (status === "present") presentCount++;
      else if (status === "absent" || status === "ab") absentCount++;
      // else if (status === \"working\") presentCount++; // If you want working to count as present
    });
    return { presentCount, absentCount, totalDays };
  }

  // ---------------- EXCEL EXPORT ----------------
  // For each date, we either show Sunday's "-/-" or normal status/remarks
  // If no record => status=Working
  const handleExportToExcel = () => {
    if (!attendanceRecords.length) {
      alert("No attendance data to export!");
      return;
    }
    const wb = XLSX.utils.book_new();
    const rows = displayedStudents.map((stu, i) => {
      const row = {
        "S.No": i + 1,
        "Student ID": stu.studentId,
        Name: stu.name,
      };
      uniqueDates.forEach((dt) => {
        const dayName = getDayName(dt);

        if (isSunday(dt)) {
          // Sunday => status, remarks => '-'
          row[`${dt} (${dayName}) - Status`] = "-";
          row[`${dt} (${dayName}) - Remarks`] = "-";
        } else {
          // Normal day => if no record => 'Working'
          let info = stu.daily[dt];
          let status = info ? info.status : "";
          let remarks = info ? info.remarks : "";

          if (!status) {
            status = "Working"; // override empty with \"Working\"
          }
          row[`${dt} (${dayName}) - Status`] = status;
          row[`${dt} (${dayName}) - Remarks`] = remarks || "";
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

  // ---------------- RENDER ----------------
  return (
    <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen p-4 md:p-6">
      <h1 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 mb-4 md:mb-8">
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Student Attendance
        </span>
      </h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Tech Stack */}
        <div>
          <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
            Select Tech Stack
          </label>
          <select
            className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            value={selectedTechStack}
            onChange={(e) => setSelectedTechStack(e.target.value)}
            disabled={availableTechStacks.length === 0}
          >
            <option value="SelectTechStack" disabled>
              Select Tech Stack
            </option>
            {availableTechStacks.map((ts) => (
              <option key={ts} value={ts}>
                {ts}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
            Select Subject
          </label>
          <select
            className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={availableSubjects.length === 0}
          >
            <option value="SelectSubject" disabled>
              Select Subject
            </option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Batch */}
        <div>
          <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
            Select Batch
          </label>
          <select
            className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={filteredBatches.length === 0}
          >
            <option value="SelectBatch" disabled>
              Select Batch
            </option>
            {filteredBatches.map((b) => (
              <option key={b.Batch} value={b.Batch}>
                {b.Batch}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
            Filter By Date
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Search */}
        <div>
          <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
            Search by Student
          </label>
          <input
            type="text"
            className="w-full px-2 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            placeholder="Name / ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mb-4 md:mb-6 flex justify-end items-center">
        <button
          className="bg-green-600 text-white py-1 px-3 md:py-2 md:px-4 rounded text-xs md:text-sm hover:bg-green-700"
          onClick={handleExportToExcel}
        >
          Export to Excel
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-blue-600 font-semibold mt-4 md:mt-6">
          Loading attendance data...
        </p>
      ) : displayedStudents.length === 0 ? (
        <p className="text-gray-500 font-semibold mt-4 md:mt-6">
          No attendance records found.
        </p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
          <table className="border-collapse min-w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th
                  className="p-1 md:p-2 border sticky left-0 bg-blue-500 z-10"
                  rowSpan={2}
                  style={{ minWidth: "40px" }}
                >
                  S.no
                </th>
                <th
                  className="p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-blue-500 z-10"
                  rowSpan={2}
                  style={{ minWidth: "70px" }}
                >
                  Student ID
                </th>
                <th
                  className="p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-blue-500 z-10"
                  rowSpan={2}
                  style={{ minWidth: "120px" }}
                >
                  Name
                </th>

                {uniqueDates.map((dt) => {
                  const dayName = getDayName(dt);
                  return (
                    <th
                      key={dt}
                      colSpan={2}
                      className="p-1 md:p-2 border text-center"
                      style={{ minWidth: "120px" }}
                    >
                      {dt} ({dayName})
                    </th>
                  );
                })}
                {/* Totals */}
                <th
                  className="p-1 md:p-2 border text-center"
                  rowSpan={2}
                  style={{ minWidth: "80px" }}
                >
                  Total Present
                </th>
                <th
                  className="p-1 md:p-2 border text-center"
                  rowSpan={2}
                  style={{ minWidth: "80px" }}
                >
                  Total Absent
                </th>
                <th
                  className="p-1 md:p-2 border text-center"
                  rowSpan={2}
                  style={{ minWidth: "70px" }}
                >
                  Total Days
                </th>
              </tr>
              <tr className="bg-blue-400 text-white">
                {uniqueDates.map((dt) => (
                  <React.Fragment key={dt}>
                    <th className="p-1 md:p-2 border text-center" style={{ minWidth: "60px" }}>
                      Status
                    </th>
                    <th className="p-1 md:p-2 border text-center" style={{ minWidth: "60px" }}>
                      Remarks
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((stu, index) => {
                const { presentCount, absentCount, totalDays } = getTotals(stu);
                return (
                  <tr key={stu.studentId} className="hover:bg-blue-50">
                    <td
                      className="p-1 md:p-2 border text-center font-semibold sticky left-0 bg-gray-100 z-10"
                      style={{ minWidth: "40px" }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-gray-100 z-10"
                      style={{ minWidth: "70px" }}
                    >
                      {stu.studentId}
                    </td>
                    <td
                      className="p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-gray-100 z-10"
                      style={{ minWidth: "120px" }}
                    >
                      {stu.name}
                    </td>

                    {/* For each date => 2 columns => Status, Remarks */}
                    {uniqueDates.map((dateStr) => {
                      if (isSunday(dateStr)) {
                        // Sunday => override with '-'
                        return (
                          <React.Fragment key={dateStr}>
                            <td className="p-1 md:p-2 border text-center font-semibold">-</td>
                            <td className="p-1 md:p-2 border text-center">-</td>
                          </React.Fragment>
                        );
                      } else {
                        let info = stu.daily[dateStr];
                        let status = info ? info.status : "";
                        let remarks = info ? info.remarks : "";

                        // If no server record => default 'Working'
                        if (!status) {
                          status = "Working";
                        }
                        const isAbsent =
                          status.toLowerCase() === "absent" || status.toLowerCase() === "ab";

                        return (
                          <React.Fragment key={dateStr}>
                            <td
                              className={`p-1 md:p-2 border text-center font-semibold ${
                                isAbsent ? "text-red-600" : "text-black"
                              }`}
                            >
                              {status}
                            </td>
                            <td className="p-1 md:p-2 border text-center text-gray-700">
                              {remarks}
                            </td>
                          </React.Fragment>
                        );
                      }
                    })}

                    {/* Totals */}
                    <td
                      className="p-1 md:p-2 border text-green-700 font-semibold text-center"
                      style={{ minWidth: "80px" }}
                    >
                      {presentCount}
                    </td>
                    <td
                      className="p-1 md:p-2 border text-red-600 font-semibold text-center"
                      style={{ minWidth: "80px" }}
                    >
                      {absentCount}
                    </td>
                    <td
                      className="p-1 md:p-2 border text-purple-700 font-semibold text-center"
                      style={{ minWidth: "70px" }}
                    >
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
  );
};

export default StudentAttendanceData;

