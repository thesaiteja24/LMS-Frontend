import React, { useState } from "react";
import axios from "axios";
import AttendanceModal from './AttendanceModal'

const StudentSearch = () => {
  const [studentId, setStudentId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isEligibleModalOpen, setIsEligibleModalOpen] = useState(false);

  const handleSearch = async () => {
    const id = studentId.toUpperCase();
    try {
      setLoading(true); // Start loading
      setErrorMessage("");
      setStudentData(null);
      setAppliedJobs([]);
      setEligibleJobs([]);
      setAttendance([]);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/searchstudent`,
        { studentId: id }
      );

      const data = response.data;
      if (!data.student_data || data.student_data.length === 0) {
        setErrorMessage(data.message);
        return;
      }

      const studentDetails = data.student_data[0];
      setStudentData({
        studentId: studentDetails.studentId,
        name: studentDetails.name || "N/A",
        email: studentDetails.email,
        qualification: studentDetails.qualification || "N/A",
        parentNumber: studentDetails.parentNumber,
        batchNo: studentDetails.std_BatchNo,
        skills: Array.isArray(studentDetails.studentSkills) && studentDetails.studentSkills.length > 0
        ? studentDetails.studentSkills.join(", ")
        : "N/A",
              percentage: studentDetails.highestGraduationpercentage || "N/A",
        yearOfPassing: studentDetails.yearOfPassing || "N/A",
      });
      setAppliedJobs(data.applied_jobs_details || []);
      setEligibleJobs(data.eligible_jobs_details || []);
      setAttendance(data.Attendance || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); 
      handleSearch();
    }
  };
  

  const handleRowClick = (job) => {
    setSelectedJob(job);
  };

  const closeModal = () => {
    setSelectedJob(null);
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-blue-100 to-white p-4 min-h-[70vh]">
      <div className="w-full md:max-w-lg p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Student Data
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onKeyDown={handleKeyDown} // Trigger search on Enter key press
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`w-full text-white py-2 px-4 rounded-md shadow-md transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 focus:outline-none"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
      </div>

      {(studentData) && (
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6">
       {/* Student Details Card */}
       <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-xl w-full max-w-2xl">
         <h3 className="text-2xl font-extrabold text-indigo-800 mb-6 text-center">
           Student Details
         </h3>
         <div className="overflow-y-auto max-h-60 bg-white p-4 rounded-lg shadow-md">
           <table className="w-full border-collapse">
             <tbody>
               {Object.entries(studentData).map(([key, value]) => (
                 <tr
                   key={key}
                   className="even:bg-gray-50 odd:bg-white hover:bg-indigo-50 transition duration-200"
                 >
                   <th className="border-b border-gray-200 px-4 py-3 text-left capitalize font-semibold text-indigo-700">
                     {key.replace(/([A-Z])/g, " $1")}
                   </th>
                   <td className="border-b border-gray-200 px-4 py-3 text-gray-800 font-medium">
                     {Array.isArray(value) ? (
                       value.map((item, index) => (
                         <span
                           key={index}
                           className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mr-2"
                         >
                           {item}
                         </span>
                       ))
                     ) : value ? (
                       value
                     ) : (
                       <span className="italic text-gray-500">N/A</span>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     
       {/* Other Sections like Applied Jobs, Eligible Jobs, etc. */}
       {appliedJobs.length > 0 ? (
         <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-lg w-full max-w-2xl">
           <h3 className="text-2xl font-extrabold text-green-700 mb-6 text-center">
             Applied Jobs <span className="text-blue-500 ml-2">({appliedJobs.length})</span>
           </h3>
     
           <div className="overflow-y-auto max-h-60 bg-white p-4 rounded-lg shadow-inner">
             <table className="w-full border-collapse border border-gray-300">
               <thead>
                 <tr className="bg-green-100">
                   <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                     Company Name
                   </th>
                   <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                     Job Role
                   </th>
                   <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                     Salary
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {appliedJobs.map((job, index) => (
                   <tr
                     key={index}
                     className="transition-all cursor-pointer hover:bg-green-50"
                     onClick={() => handleRowClick(job)}
                   >
                     <td className="border border-gray-300 px-4 py-2">{job.companyName}</td>
                     <td className="border border-gray-300 px-4 py-2">{job.jobRole}</td>
                     <td className="border border-gray-300 px-4 py-2">
                       {job.salary.includes("LPA") ? job.salary : `${job.salary} LPA`}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       ) : (
         <div className="bg-gradient-to-r from-red-100 to-red-200 p-6 rounded-lg shadow-lg w-full max-w-2xl text-center">
           <h3 className="text-2xl font-extrabold text-red-700 mb-4">
             No Applied Jobs Found
           </h3>
           <p className="text-gray-800 text-lg">
             This student has not applied for any jobs yet.
           </p>
         </div>
       )}

{eligibleJobs.length > 0 ? (
  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-lg w-full max-w-2xl">
    <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
      Eligible Jobs
      <span className="text-blue-500 ml-2">({eligibleJobs.length})</span>
    </h3>

    {/* Table Preview */}
    <div className="overflow-y-auto max-h-60 bg-white p-4 rounded-lg shadow-md">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
              Company Name
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
              Job Role
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
              Salary
            </th>
          </tr>
        </thead>
        <tbody>
          {eligibleJobs.slice(0, 3).map((job, index) => (
            <tr
              key={index}
              className="transition-all cursor-pointer hover:bg-green-100"
              onClick={() => handleRowClick(job)}
            >
              <td className="border border-gray-300 px-4 py-2">{job.companyName}</td>
              <td className="border border-gray-300 px-4 py-2">{job.jobRole}</td>
              <td className="border border-gray-300 px-4 py-2">
                {job.salary.includes("LPA") ? job.salary : `${job.salary} LPA`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Show More Button */}
    <div className="text-center mt-4">
      <button
        onClick={() => setIsEligibleModalOpen(true)}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-green-700 transition duration-300"
      >
        Show All Eligible Jobs
      </button>
    </div>

    {/* Modal for Eligible Jobs */}
    {isEligibleModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
        <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
          <button
            onClick={() => setIsEligibleModalOpen(false)}
            className="absolute top-2 right-2 px-2 text-black font-bold hover:text-red-500"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
            Eligible Jobs
            <span className="text-blue-500 ml-2">({eligibleJobs.length})</span>
          </h3>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                    Company Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                    Job Role
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligibleJobs.map((job, index) => (
                  <tr
                    key={index}
                    className="transition-all cursor-pointer hover:bg-green-100"
                  >
                    <td className="border border-gray-300 px-4 py-2">{job.companyName}</td>
                    <td className="border border-gray-300 px-4 py-2">{job.jobRole}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {job.salary.includes("LPA") ? job.salary : `${job.salary} LPA`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
) : (
  <div className="bg-red-50 p-6 rounded-lg shadow-md w-full max-w-2xl text-center">
    <h3 className="text-xl font-bold text-red-600">No Eligible Jobs Found</h3>
    <p className="text-gray-700">The student is not eligible for any jobs currently.</p>
  </div>
)}

     
       {attendance.length > 0 ? (
         <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg w-full max-w-2xl justify-center">
           <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">
             Attendance Overview
           </h3>
           <div className="flex justify-around items-center bg-white p-4 rounded-lg shadow-md mb-6">
             <div className="flex flex-col items-center">
               <span className="text-blue-500 text-lg font-bold">Total Days</span>
               <span className="text-gray-700 text-2xl font-extrabold">{attendance.length}</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-green-500 text-lg font-bold">Present</span>
               <span className="text-gray-700 text-2xl font-extrabold">
                 {attendance.filter((record) => record.status.toLowerCase() === "present").length}
               </span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-red-500 text-lg font-bold">Absent</span>
               <span className="text-gray-700 text-2xl font-extrabold">
                 {attendance.filter((record) => record.status.toLowerCase() === "absent").length}
               </span>
             </div>
           </div>
           <div className="text-center">
             <button
               onClick={() => setIsAttendanceModalOpen(true)}
               className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition duration-300"
             >
               Show Detailed Attendance
             </button>
             <AttendanceModal
               isOpen={isAttendanceModalOpen}
               onClose={() => setIsAttendanceModalOpen(false)}
               attendance={attendance}
             />
           </div>
         </div>
       ) : (
         <div className="bg-red-50 p-6 rounded-lg shadow-lg w-full max-w-2xl">
           <h3 className="text-2xl font-bold text-red-600 mb-4 text-center">
             No Attendance Records Found
           </h3>
           <p className="text-gray-700 text-center">
             The student has not attended any classes yet.
           </p>
         </div>
       )}
     </div>
     
      )}

      {selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 px-2 text-black font-bold hover:text-red-500"
            >
              ✕
            </button>
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "rgb(204, 51, 102)" }}
            >
              {selectedJob.jobRole}
            </h2>
            <p className="text-sm mb-2">
              <span className="font-bold">Company Name:</span> {selectedJob.companyName}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Salary:</span> {selectedJob.salary.includes("LPA") ? selectedJob.salary : `${selectedJob.salary} LPA`}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Location:</span> {selectedJob.jobLocation || "N/A"}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Percentage:</span> {selectedJob.percentage || "N/A"}%
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Bond:</span> {selectedJob.bond || "N/A"} year
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Branch:</span> {selectedJob.department?.join(", ") || "N/A"}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Qualification:</span> {selectedJob.educationQualification}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Graduate Level:</span>{" "}
              {selectedJob.graduates?.join(", ") || "N/A"}
            </p>
            <div className="flex gap-2 mt-4">
              {selectedJob.jobSkills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 border border-gray-300 text-sm text-[#00796b] font-semibold bg-[#e6f4f1] rounded-[5px]"
                >
                  {skill}
                </span>
              ))}
            </div>
            {selectedJob.specialNote && (
              <div className="mt-4 p-2 border-l-4 border-yellow-500">
                <p className="text-sm font-bold">Special Note:</p>
                <p className="text-sm">{selectedJob.specialNote}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
