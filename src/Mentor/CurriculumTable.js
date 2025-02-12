import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import { useStudentsMentorData } from "../contexts/MentorStudentsContext";

const CurriculumTable = ({
  subject,
  batches,
  mentorData,
  classes,
  fetchMentorStudents,
  syllabus,
}) => {
  // const { classes, fetchMentorStudents } = useStudentsMentorData();
  const [curriculumData, setCurriculumData] = useState([]);
  const [checkedSubTopics, setCheckedSubTopics] = useState({});
  const [submittedCurriculumIds, setSubmittedCurriculumIds] = useState(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const location = localStorage.getItem("location");
  const mentorId = mentorData?.id;
  const mentorName = mentorData?.name;

  const fetchSyllabus = async () => {
    try {
      // const syllabusRes = await axios.get(
      //   `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentorsyllabus`,
      //   { params: { subject, location, batches } }
      // );
      const syllabusData = syllabus || [];
      const updatedSyllabus = syllabusData.map((item) => {
        const matchedClass = classes.find(
          (cls) => cls.CurriculumId === item.id
        );
        const completedSubTopics = matchedClass?.SubTopics || [];

        // Create an object that tracks subtopic completion status
        const subTopicsStatus = {};
        item.SubTopics.forEach((subTopic) => {
          const completed = completedSubTopics.find(
            (sub) => sub.subTopic === subTopic
          );
          subTopicsStatus[subTopic] = completed?.status || false;
        });

        return {
          ...item,
          videoUrl: matchedClass?.VideoUrl || "",
          locked: matchedClass ? true : false,
          subTopicsStatus,
        };
      });

      setCurriculumData(updatedSyllabus);
      setSubmittedCurriculumIds(
        new Set(classes.map((cls) => cls.CurriculumId))
      );
    } catch (error) {
      console.error("Error fetching syllabus:", error);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [classes, subject, location, batches]);

  // Handle checkbox change for subtopics
  const handleCheckboxChange = (dayOrder, subTopic) => {
    setCheckedSubTopics((prev) => ({
      ...prev,
      [dayOrder]: {
        ...prev[dayOrder],
        [subTopic]: !prev[dayOrder]?.[subTopic],
      },
    }));
  };

  const isValidVideoUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
    const driveRegex = /^(https?:\/\/)?(drive\.google\.com\/)/;
    return youtubeRegex.test(url) || driveRegex.test(url);
  };

  // Utility function to wait for a given ms
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let idCounter = 1;

      // This object tracks the highest subtopic IDs per CurriculumId.
      const idCounters = {};

      // Helper to get the next incremental ID for a given CurriculumId
      const getNextId = (curriculumId) => {
        if (!idCounters[curriculumId]) {
          const matchedClass = classes.find(
            (cls) => cls.CurriculumId === curriculumId
          );

          if (
            !matchedClass ||
            !matchedClass.SubTopics ||
            matchedClass.SubTopics.length === 0
          ) {
            idCounters[curriculumId] = 1; // Start from 1 if no subtopics exist
          } else {
            // Extract numerical parts only to avoid NaN issues
            const validIds = matchedClass.SubTopics.map((sub) =>
              parseInt(sub.Id.split(":")[1])
            ) // Extract number part
              .filter((num) => !isNaN(num)); // Remove NaN values

            const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;

            idCounters[curriculumId] = maxId + 1;
          }
        }

        return idCounters[curriculumId]++;
      };

      // Validate all video URLs before submission
      for (const item of curriculumData) {
        if (item.videoUrl.trim() && !isValidVideoUrl(item.videoUrl.trim())) {
          Swal.fire({
            title: "Invalid Video URL",
            text: "Please enter a valid YouTube or Google Drive link.",
            icon: "error",
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }
      }

      // Build final payload for all new (unsubmitted) DayOrders
      const payloads = curriculumData
        .filter((item) => !submittedCurriculumIds.has(item.id))
        .map((item) => {
          // Gather newly ticked subtopics for the current day
          const selectedSubTopics = Object.entries(
            checkedSubTopics[item.DayOrder] || {}
          )
            .filter(([_, status]) => status)
            .map(([subTopic]) => ({
              subTopic,
              status: true,
              Id: `${item.DayOrder}:${idCounter++}`, // Auto-increment for today’s subtopics
            }));

          // Gather newly ticked subtopics from previous days
          const previousSubTopics = curriculumData
            .filter((prevItem) => {
              return prevItem.DayOrder < item.DayOrder;
            }) // Only previous days
            .flatMap((prevItem) => {
              return Object.entries(checkedSubTopics[prevItem.DayOrder] || {})
                .filter(([subTopic, status]) => {
                  return status && !prevItem.subTopicsStatus[subTopic]; // Exclude already submitted ones
                })
                .map(([subTopic]) => {
                  return {
                    subTopic,
                    status: true,
                    Id: `${prevItem.DayOrder}:${getNextId(prevItem.id)}`, // Get next available Id from classes
                    dayOrder: prevItem.DayOrder, // Store reference to correct DayOrder
                    curriculumId: prevItem.id, // Store Curriculum ID for updating
                  };
                });
            });

          if (selectedSubTopics.length === 0 || item.videoUrl.trim() === "")
            return null;

          return {
            subject,
            batches,
            dayOrder: item.DayOrder,
            topic: item.Topics,
            subTopics: selectedSubTopics,
            previousSubTopics,
            videoUrl: item.videoUrl.trim(),
            location,
            mentorId,
            mentorName,
            curriculumId: item.id,
          };
        })
        .filter((item) => item !== null);

      // Check if there's anything to submit
      if (payloads.length === 0) {
        Swal.fire({
          title: "No Changes",
          text: "Please check subtopics and enter a valid video URL before submitting.",
          icon: "info",
          confirmButtonText: "OK",
        });
        setLoading(false);
        return;
      }

      // ------------------------------------------------------------------
      // For each new day in payloads:
      // 1) POST new day
      // 2) PUT for each previousSubTopic
      // 3) Wait 3 seconds
      // 4) POST store-daily-exam-tags
      // ------------------------------------------------------------------
      for (const payload of payloads) {
        // 1) Submit today's new day
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentorsyllabus`,
          payload
        );

        // 2) Update subtopics for previous days
        for (const prevSub of payload.previousSubTopics) {
          const updateData = {
            location,
            DayOrder: prevSub.dayOrder,
            CurriculumId: prevSub.curriculumId,
            batch: batches,
            SubTopics: [
              {
                subTopic: prevSub.subTopic,
                status: true,
                Id: prevSub.Id,
              },
            ],
          };

          await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentorsyllabus`,
            updateData
          );
        }

        // 3) Delay 3 seconds before the daily exam tags
        await delay(3000);

        // 4) Store daily exam tags only after the POST + PUTs succeed
        const dailyExamPayload = {
          dayOrder: payload.dayOrder,
          mentorId,
          subject,
          batch: batches,
        };

        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/store-daily-exam-tags`,
          dailyExamPayload
        );
      }

      // Re-fetch data after all requests are successful
      await fetchMentorStudents(batches);

      Swal.fire({
        title: "Success",
        text: "Curriculum submitted and Selected Topics are going for Daily Exam!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error submitting curriculum:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to submit curriculum. Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for Video URL
  const handleUpdate = (index, field, value) => {
    setCurriculumData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  return (
    <div className="bg-sky-200 text-black p-6 rounded-lg shadow-lg">
      {curriculumData.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-sky-300">
                <tr>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Day Order
                  </th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">Topic</th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Topics to Cover
                  </th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Video URL
                  </th>
                </tr>
              </thead>
              <tbody>
                {curriculumData.map((item, index) => (
                  <tr
                    key={index}
                    className="odd:bg-sky-100 even:bg-sky-50 hover:bg-sky-200 transition-colors"
                  >
                    <td className="px-4 py-2 border-b border-sky-400">
                      {item.DayOrder}
                    </td>
                    <td className="px-4 py-2 border-b border-sky-400">
                      {item.Topics}
                    </td>
                    <td className="px-4 py-2 border-b border-sky-400">
                      <ul className="pl-0">
                        {item.SubTopics.map((subTopic, subIndex) => (
                          <li
                            key={subIndex}
                            className="list-disc flex items-center gap-2 text-gray-700"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={
                                item.subTopicsStatus[subTopic] ||
                                checkedSubTopics[item.DayOrder]?.[subTopic] ||
                                false
                              }
                              onChange={() =>
                                handleCheckboxChange(item.DayOrder, subTopic)
                              }
                              disabled={item.subTopicsStatus[subTopic]}
                            />
                            <span>{subTopic}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 border-b border-sky-400">
                      {item.locked ? (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {item.videoUrl}
                        </a>
                      ) : (
                        <input
                          type="text"
                          value={item.videoUrl}
                          className="w-full px-3 py-2 bg-white text-black border border-sky-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter video URL"
                          onChange={(e) =>
                            handleUpdate(index, "videoUrl", e.target.value)
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className={`px-6 py-2 rounded-lg shadow text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg">No syllabus data available.</p>
      )}
    </div>
  );
};

export default CurriculumTable;
