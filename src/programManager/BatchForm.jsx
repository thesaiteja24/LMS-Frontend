import React, { useState } from "react";
import {
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaCodeBranch,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const techStacks = {
  vijayawada: ["Python Full Stack (PFS)", "Java Full Stack (JFS)"],
  hyderabad: [
    "Python Full Stack (PFS)",
    "Java Full Stack (JFS)",
    "Data Science",
    "Data Analytics",
  ],
  bangalore: ["Java Full Stack (JFS)"],
};

const BatchForm = () => {
  const [formData, setFormData] = useState({
    BatchId: "",
    TechStack: "",
    StartDate: "",
    EndDate: "",
    Status: "",
  });

  const [duration, setDuration] = useState(null); // Store calculated duration
  const location = localStorage.getItem("location") || "Vijayawada"; // Default to Vijayawada
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Calculate duration when StartDate and EndDate are selected
    if (name === "StartDate" || name === "EndDate") {
      const startDate = new Date(
        name === "StartDate" ? value : formData.StartDate
      );
      const endDate = new Date(name === "EndDate" ? value : formData.EndDate);

      if (startDate && endDate && endDate >= startDate) {
        const diffTime = Math.abs(endDate - startDate);
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDuration(durationDays + " Days");
      } else {
        setDuration(null); // Reset duration if dates are invalid
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      BatchId: formData.BatchId.toUpperCase(),
      TechStack: formData.TechStack,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      Duration: duration, // Calculated duration in days
      Status: formData.Status,
      location,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/batches`,
        payload
      );
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Batch Created Successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      setFormData({
        BatchId: "",
        TechStack: "",
        StartDate: "",
        EndDate: "",
        Status: "",
      });
      setDuration(null);
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text:
          err.response?.data?.error || "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleViewBatches = () => {
    navigate("/viewbatch");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Create New Batch
          </span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Tech Stack */}
                <div>
              <label
                htmlFor="TechStack"
                className="block text-sm font-medium text-gray-700"
              >
                <FaCodeBranch className="inline mr-2 text-green-500" />
                Tech Stack
              </label>
              <select
                name="TechStack"
                id="TechStack"
                value={formData.TechStack}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>
                  Select a Tech Stack
                </option>
                {techStacks[location]?.map((stack) => (
                  <option key={stack} value={stack}>
                    {stack}
                  </option>
                ))}
              </select>
            </div>
            {/* Batch ID */}
            <div>
              <label
                htmlFor="BatchId"
                className="block text-sm font-medium text-gray-700"
              >
                <FaIdCard className="inline mr-2 text-blue-500" />
                Batch ID
              </label>
              <input
                type="text"
                name="BatchId"
                id="BatchId"
                value={formData.BatchId.toUpperCase()}
                onChange={handleInputChange}
                placeholder="Enter Batch ID (e.g., PFS-100)"
                className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

        

            {/* Start Date */}
            <div>
              <label
                htmlFor="StartDate"
                className="block text-sm font-medium text-gray-700"
              >
                <FaCalendarAlt className="inline mr-2 text-yellow-500" />
                Start Date
              </label>
              <input
                type="date"
                name="StartDate"
                id="StartDate"
                value={formData.StartDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]} // Sets the minimum date to today
                className="mt-1 cursor-pointer block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="EndDate"
                className="block text-sm font-medium text-gray-700"
              >
                <FaCalendarAlt className="inline mr-2 text-red-500" />
                End Date
              </label>
              <input
                type="date"
                name="EndDate"
                id="EndDate"
                value={formData.EndDate}
                onChange={handleInputChange}
                min={formData.StartDate} // Ensure End Date is after Start Date
                className="mt-1 cursor-pointer block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Duration (Auto-Calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaClock className="inline mr-2 text-indigo-500" />
                Course Duration
              </label>
              <div className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm bg-gray-100">
                {duration ? duration : "Select Start and End Date"}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="Status"
                className="block text-sm font-medium text-gray-700"
              >
                <FaInfoCircle className="inline mr-2 text-pink-500" />
                Course Status
              </label>
              <select
                name="Status"
                id="Status"
                value={formData.Status}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-3 rounded-md shadow-lg transform transition duration-300 ease-in-out ${
                isLoading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:scale-105"
              }`}
            >
              {isLoading ? "Submitting..." : "Create Batch"}
            </button>
            <button
              onClick={handleViewBatches}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
            >
              View Batches
            </button>
          </div>
          
        </form>

        
        
      </div>
    </div>
  );
};

export default BatchForm;
