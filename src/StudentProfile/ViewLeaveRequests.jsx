import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useStudent } from '../contexts/StudentProfileContext';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const ViewLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { studentDetails } = useStudent();

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    if (!studentDetails) return; // Ensure studentDetails is available
    try {
      const { studentId, location } = studentDetails;
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/stdleave`,
        { params: { studentId, location } }
      );
      setLeaveRequests(response.data.leaves || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  }, [studentDetails]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  if (!studentDetails) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          Applied Leave Requests
        </h2>
        <p className="text-gray-600">Loading student details...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 sm:p-8 lg:p-10 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4 text-center">
        Applied Leave Requests
      </h2>
      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : leaveRequests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white text-sm md:text-base">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border border-gray-300 p-3">Reason</th>
                <th className="border border-gray-300 p-3">Start Date</th>
                <th className="border border-gray-300 p-3">End Date</th>
                <th className="border border-gray-300 p-3">Total Days</th>
                <th className="border border-gray-300 p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-100 transition-colors ${
                    request.status === 'accepted'
                      ? 'bg-green-50'
                      : request.status === 'rejected'
                      ? 'bg-red-50'
                      : 'bg-yellow-50'
                  }`}
                >
                  <td className="border border-gray-300 p-3 text-gray-700">
                    {request.Reason}
                  </td>
                  <td className="border border-gray-300 p-3 text-gray-700">
                    {request.StartDate}
                  </td>
                  <td className="border border-gray-300 p-3 text-gray-700">
                    {request.EndDate}
                  </td>
                  <td className="border border-gray-300 p-3 text-gray-700">
                    {request.TotalDays}
                  </td>
                  <td className="border border-gray-300 p-3 font-medium flex items-center gap-2">
                    {request.status === 'accepted' && (
                      <>
                        <FaCheckCircle className="text-green-600" />
                        <span className="text-green-600">Accepted</span>
                      </>
                    )}
                    {request.status === 'rejected' && (
                      <>
                        <FaTimesCircle className="text-red-600" />
                        <span className="text-red-600">Rejected</span>
                      </>
                    )}
                    {request.status === 'pending' && (
                      <>
                        <FaHourglassHalf className="text-yellow-600" />
                        <span className="text-yellow-600">Pending</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No leave requests found.</p>
      )}
    </div>
  );
};

export default ViewLeaveRequests;
