import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import './CurriculumTable.css'

export const Tabel = ({ subject, batch, mentorId }) => {
  const [tableData, setTableData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch the curriculum table whenever subject, batch, or mentorId changes
  useEffect(() => {
    if (subject && batch && mentorId) {
      fetchCurriculumTable();
    }
  }, [subject, batch, mentorId]);

  const fetchCurriculumTable = async () => {  
    try {
      setLoading(true);
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/mentorsyllabus?mentorId=${mentorId}&subject=${subject}&batch=${batch}`;
      const response = await axios.get(url);
      console.log(response.data);
      setTableData(response.data);
      // Create a deep copy so that editing doesn't affect the original data immediately
      setEditedData(JSON.parse(JSON.stringify(response.data)));
    } catch (error) {
      console.error("Error fetching curriculum table:", error);
      toast.error("Error fetching curriculum table.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle subtopic status if it is currently "false"
  const handleSubtopicChange = (rowId, tag) => {
    setEditedData((prevData) => {
      const newData = { ...prevData };
      const subtopics = newData[rowId].SubTopics;
      // Find the subtopic index by its tag
      const index = subtopics.findIndex((sub) => sub.tag === tag);
      if (index !== -1 && subtopics[index].status === "false") {
        subtopics[index].status = "true";
      }
      return newData;
    });
  };

  // Update the video URL for a specific row
  const handleVideoUrlChange = (rowId, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      [rowId]: { ...prevData[rowId], videoUrl: value },
    }));
  };

  // Submit changes for a single row via an axios POST call and then refresh the table
  const handleRowSubmit = async (rowId) => {
    const payload = {
      mentorId,
      subject,
      batch,
      data: { [rowId]: editedData[rowId] },
    };
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`;
      const response = await axios.post(url, payload);
      console.log("Submitted row payload:", payload);
      console.log("Response:", response.data);
      toast.success(response.data.message || "Row updated successfully.");
    } catch (error) {
      console.error("Error submitting row:", error.response);
      toast.error(
        error.response?.data?.error || "Error submitting row. Please try again."
      );
    } finally {
      // Refresh the table data irrespective of the outcome
      fetchCurriculumTable();
      setLoading(false);
    }
  };

  return (
<div className="bg-white w-full max-w-[1200px] h-auto p-6 flex flex-col justify-center">
  {loading && <p className="mt-4 text-center">Loading...</p>}

  {Object.keys(editedData).length > 0 ? (
    <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#0C1BAA] scrollbar-track-[#F5F5F5]">
      <div className="max-h-[500px] overflow-y-auto scrollbar-custom">
        <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
          <thead className="sticky top-0 bg-[#0C1BAA] text-white text-left font-medium">
            <tr>
              <th className="px-6 py-4">Day Order</th>
              <th className="px-6 py-4">Topic</th>
              <th className="px-6 py-4">Topics to Cover</th>
              <th className="px-6 py-4">Video URL</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(editedData).map(([id, item], index) => {

              const rowComplete =
                tableData[id]?.videoUrl &&
                tableData[id].videoUrl === item.videoUrl &&
                item.SubTopics.every((sub) => sub.status === "true");

              return (
                <tr
                  key={id}
                  className={`${
                    index % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"
                  } text-black`}
                >
                  <td className="px-6 py-4">Class {index + 1}</td>
                  <td className="px-6 py-4">{item.Topics}</td>
                  <td className="px-6 py-4">
                    <ul className="list-none space-y-1">
                      {item.SubTopics.slice()
                        .sort((a, b) => {
                          const parseTag = (tag) => {
                            const match = tag.match(/Day-(\d+):(\d+)/);
                            if (match) {
                              return {
                                day: parseInt(match[1], 10),
                                id: parseInt(match[2], 10),
                              };
                            }
                            return { day: 0, id: 0 };
                          };
                          const aInfo = parseTag(a.tag || "");
                          const bInfo = parseTag(b.tag || "");
                          if (aInfo.day !== bInfo.day) {
                            return aInfo.day - bInfo.day;
                          }
                          return aInfo.id - bInfo.id;
                        })
                        .map((sub, subIndex) => (
                          <li
                            key={subIndex}
                            className={
                              "Day-" + (index + 1) !==
                              (sub.tag.match(/(Day-\d+)/)?.[0] || "")
                                ? "text-red-500"
                                : ""
                            }
                          >
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={sub.status === "true"}
                              disabled={sub.status === "true"}
                              onChange={() => handleSubtopicChange(id, sub.tag)}
                            />
                            {sub.title}
                          </li>
                        ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4">
                    {rowComplete ? (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.videoUrl}
                      </a>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter Video URL..."
                        value={item.videoUrl || ""}
                        onChange={(e) => handleVideoUrlChange(id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!rowComplete && (
                      <button
                        onClick={() => handleRowSubmit(id)}
                        className="w-[100px] h-[36px] text-white text-base font-semibold rounded-md transition bg-[#0C1BAA] hover:bg-blue-900"
                      >
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <p className="mt-4 text-center text-gray-500">
      No curriculum data available.
    </p>
  )}
</div>

  );
};
