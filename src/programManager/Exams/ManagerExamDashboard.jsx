import React, { useEffect, useState } from "react";
import { useUniqueBatches } from "../../contexts/UniqueBatchesContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "../../../cryptoUtils.jsx";

export const ManagerExamDashboard = () => {
  const navigate = useNavigate();
  const { batches, loading, fetchBatches } = useUniqueBatches();
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");

  const localStorageLocation = decryptData(localStorage.getItem("location"));
  const locations = ["all", "vijayawada", "hyderabad", "bangalore"];

  // Fetch batches on mount
  useEffect(() => {
    fetchBatches(localStorageLocation);
  }, [fetchBatches, localStorageLocation]);

  // Filter batches based on location
  useEffect(() => {
    if (locationFilter === "all" || localStorageLocation !== "all") {
      setFilteredBatches(batches);
    } else {
      setFilteredBatches(
        batches.filter(
          (batch) =>
            batch.location.toLowerCase() === locationFilter.toLowerCase()
        )
      );
    }
  }, [batches, locationFilter, localStorageLocation]);

  const checkDailyExamStatus = async (batch) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/check-exam-status`,
        {
          params: {
            date: date,
            examType: "Daily-Exam",
            batch: batch.Batch,
            location: batch.location,
          },
        }
      );
      handleDailyClick(batch);
    } catch (error) {
      if (error.status == 409) {
        toast.warning(error.response?.data.message);
      }
      console.log(error);
    }
  };

  // Fetch exam details for the selected batch
  const handleDailyClick = async (batch) => {
    try {
      const date = new Date().toISOString().slice(0, 10);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/get-day-exam-data`,
        {
          params: {
            batch: batch.Batch,
            location: batch.location, // Adjust based on your batch object keys.
            date,
          },
        }
      );

      const data = response.data;
      console.log(data);

      // Navigate to the exam creation page with the fetched data
      navigate("/set-exam", {
        state: { examData: data, batch: batch },
      });
    } catch (error) {
      console.error("Error fetching exam details:", error);
      toast.error(
        error.response?.data.message ||
          `Failed to fetch exam details. Please try again or contact support if the issue persists`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-lg font-semibold text-gray-600">
          Loading batches...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        <span className="bg-black bg-clip-text">Scheduling Exam</span>
      </h1>

      {/* Location Filter */}
      {localStorageLocation === "all" && (
        <div className="text-center mb-8">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm sm:text-base"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "all" ? "All Locations" : loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display Batches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full max-w-6xl">
        {filteredBatches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 hover:shadow-2xl transition duration-300 ease-in-out"
            style={{
              borderTop: "4px solid transparent",
              borderImage: "linear-gradient(to bottom right, red, blue) 1",
            }}
          >
            <div className="flex gap-2">
              <h2 className="text-xl font-bold text-gray-700 flex items-center mb-2">
                {batch.Batch}
              </h2>
            </div>
            <div className="flex flex-row">
              <button
                onClick={() => checkDailyExamStatus(batch)}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
              >
                <span className=" relative px-2 py-0.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Daily Exam
                </span>
              </button>
              {/* Other buttons... */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
