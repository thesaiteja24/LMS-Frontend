import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const Table = ({ data, onEditRow }) => {
  const [filter, setFilter] = useState(""); // Global filter for all columns
  const [roomFilter, setRoomFilter] = useState(""); // Filter by RoomNo
  const [editedData, setEditedData] = useState([]);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const handleRoomFilterChange = (e) => {
    setRoomFilter(e.target.value.toLowerCase());
  };

  const handleDeleteClick = async (index) => {
    const rowToDelete = editedData[index];
    const id = rowToDelete.id;
  
    try {
      // Confirm delete action
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
  
      if (result.isConfirmed) {
        // Using Axios to delete the row
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`, {
          params: { id },
        });
  
        if (response.status !== 200) throw new Error("Failed to delete row.");
  
        // Update state after successful deletion
        setEditedData((prevData) => prevData.filter((_, idx) => idx !== index));
  
        // Show success message
        Swal.fire("Deleted!", "The row has been deleted.", "success");
      }
    } catch (error) {
      // Show error message
      Swal.fire("Error", error.message || "Failed to delete the row. Please try again.", "error");
      console.error("Error deleting row:", error.message);
    }
  };
  

  const filteredData = editedData.filter((batch) => {
    const globalFilterMatch = [
      Array.isArray(batch.batchNo) ? batch.batchNo.join(", ") : batch.batchNo,
      batch.MentorName,
      batch.RoomNo,
      batch.subject,
      batch.StartTime,
      batch.EndTime,
      batch.StartDate,
      batch.EndDate,
    ].some((value) => value.toString().toLowerCase().includes(filter));

    const roomFilterMatch = batch.RoomNo.toString().toLowerCase().includes(roomFilter);

    return globalFilterMatch && roomFilterMatch;
  });

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-6xl">
        <div className="flex gap-4 mb-4 mt-2">
          <input
            type="text"
            placeholder="Search in all columns..."
            className="border px-4 py-2 rounded w-full"
            value={filter}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Filter by Room No..."
            className="border px-4 py-2 rounded w-1/3"
            value={roomFilter}
            onChange={handleRoomFilterChange}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-blue-100 sticky top-0 z-10">
              <tr>
                <th className="border px-4 py-2 text-left font-semibold">Batch IDs</th>
                <th className="border px-4 py-2 text-left font-semibold">Mentor Name</th>
                <th className="border px-4 py-2 text-left font-semibold">Start Time</th>
                <th className="border px-4 py-2 text-left font-semibold">End Time</th>
                <th className="border px-4 py-2 text-left font-semibold">Start Date</th>
                <th className="border px-4 py-2 text-left font-semibold">End Date</th>
                <th className="border px-4 py-2 text-left font-semibold">Room No</th>
                <th className="border px-4 py-2 text-left font-semibold">Subject</th>
                <th className="border px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((batch, idx) => (
                <tr key={batch.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-4 py-2">
                    {Array.isArray(batch.batchNo) ? batch.batchNo.join(", ") : batch.batchNo}
                  </td>
                  <td className="border px-4 py-2">{batch.MentorName}</td>
                  <td className="border px-4 py-2">{batch.StartTime}</td>
                  <td className="border px-4 py-2">{batch.EndTime}</td>
                  <td className="border px-4 py-2">{batch.StartDate}</td>
                  <td className="border px-4 py-2">{batch.EndDate}</td>
                  <td className="border px-4 py-2">{batch.RoomNo}</td>
                  <td className="border px-4 py-2">{batch.subject}</td>
                  <td className="border px-4 py-2 flex items-center gap-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded flex items-center gap-2"
                      onClick={() => onEditRow(batch)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded flex items-center gap-2"
                      onClick={() => handleDeleteClick(idx)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
