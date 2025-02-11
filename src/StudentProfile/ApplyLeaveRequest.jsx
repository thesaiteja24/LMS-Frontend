import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useStudent } from '../contexts/StudentProfileContext'; 

const ApplyLeaveRequest = () => {
  const { studentDetails } = useStudent();
  const [leaveData, setLeaveData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); 
    return difference + 1; 
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setLoading(true);
  
    if (!studentDetails) {
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: "Student details not found. Please log in again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
  
    const totalDays = calculateDays(leaveData.startDate, leaveData.endDate);
  
    if (totalDays <= 0) {
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: "End date must be after start date.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
  
    const payload = {
      studentId: studentDetails.studentId,
      batchNo: studentDetails.BatchNo,
      studentName: studentDetails.name,
      studentNumber: Number(studentDetails.phone),
      parentNumber: Number(studentDetails.parentNumber),
      reason: leaveData.reason,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      location: studentDetails.location,
      totalDays,
      status:"pending"

    };
  
  
    try {
       await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/stdleave`,
        payload
      );
  
  
      Swal.fire({
        title: "Success",
        text: "Leave request submitted successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
  
      // Reset form after submission
      setLeaveData({ reason: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error("Error submitting leave request:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to submit leave request. Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 sm:p-10">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center">
        Apply Leave Request
      </h2>
      {studentDetails ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-semibold text-gray-700"
            >
              Reason for Leave
            </label>
            <textarea
              id="reason"
              name="reason"
              value={leaveData.reason}
              onChange={handleChange}
              required
              placeholder="Enter your reason for leave"
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-semibold text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={leaveData.startDate}
                onChange={handleChange}
                required
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-semibold text-gray-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={leaveData.endDate}
                onChange={handleChange}
                required
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-lg font-medium text-white rounded-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      ) : (
        <p className="text-red-500 text-center">
          Please log in to submit a leave request.
        </p>
      )}
    </div>
  );
};

export default ApplyLeaveRequest;
