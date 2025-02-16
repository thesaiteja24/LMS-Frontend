import React, { useState } from "react";

const AttendanceModal = ({ isOpen, onClose, attendance = [] }) => {
  // Move useState above conditional return
  const [expandedCourse, setExpandedCourse] = useState(null);

  if (!isOpen) return null; // ✅ Now useState is always called at the top level

  // Group attendance by course
  const groupedAttendance = attendance.reduce((acc, record) => {
    if (!acc[record.course]) {
      acc[record.course] = [];
    }
    acc[record.course].push(record);
    return acc;
  }, {});

  const toggleCourse = (course) => {
    setExpandedCourse(expandedCourse === course ? null : course);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
        >
          &times;
        </button>

        <h3 className="text-2xl font-extrabold text-center text-gradient bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
          Attendance Details
        </h3>

        <div className="overflow-y-auto max-h-96 space-y-4">
          {Object.keys(groupedAttendance).length > 0 ? (
            Object.keys(groupedAttendance).map((course, index) => (
              <div key={index} className="border border-gray-300 rounded-lg shadow-md">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 font-semibold cursor-pointer flex justify-between items-center rounded-t-lg"
                  onClick={() => toggleCourse(course)}
                >
                  <span className="text-lg">{course}</span>
                  <span className="text-xl">{expandedCourse === course ? "▼" : "▶"}</span>
                </div>

                {/* Attendance Table (Visible when course is expanded) */}
                {expandedCourse === course && (
                  <div className="bg-white p-4">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100 text-gray-800">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Date</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedAttendance[course].map((record, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="border border-gray-300 px-4 py-2">{record.datetime || "N/A"}</td>
                            <td
                              className={`border border-gray-300 px-4 py-2 font-semibold text-center rounded-md ${
                                (record.status || "").toLowerCase() === "present"
                                  ? "text-green-600 bg-green-100"
                                  : "text-red-600 bg-red-100"
                              }`}
                            >
                              {record.status || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center text-lg">No attendance data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
