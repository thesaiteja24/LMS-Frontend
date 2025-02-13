import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

export const SetExam = () => {
  const location = useLocation();
  const managerId = localStorage.getItem("Manager");
  const managerLocation = localStorage.getItem("location");
  const { examData, batch } = location.state || {}; // Data from ManagerExamDashboard

  // **🔹 New State Variables**
  const [dayOrder, setDayOrder] = useState("");
  const [availableDayOrders, setAvailableDayOrders] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [subject, setSubject] = useState("");

  const [selectedMCQs, setSelectedMCQs] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [selectedCoding, setSelectedCoding] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [totalMCQs, setTotalMCQs] = useState({ easy: 0, medium: 0, hard: 0 });
  const [totalCoding, setTotalCoding] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [examTopics, setExamTopics] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]); // Stores questions for multiple subjects

  // Keep date/time in state but do NOT reset them when editing
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isTimeCollapsed, setIsTimeCollapsed] = useState(true);

  // **🔹 Extract unique Day Orders from examData & Filter by valid day orders**
  useEffect(() => {
    const batchValue = batch?.Batch || "";
    const fetchValidDayOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/validate-daily-dayorder?batch=${batchValue}&managerId=${managerId}&managerLocation=${managerLocation}`
        );

        if (examData?.data) {
          // Collect all dayOrders from the examData
          const uniqueDayOrders = [
            ...new Set(
              Object.values(examData.data).flatMap((subjects) =>
                subjects.map((item) => item.dayOrder)
              )
            ),
          ];

          // If API call is successful, filter day orders
          if (response.data.success) {
            const validDayOrders = response.data.dayOrders;
            // dayOrders that are already used up by some logic on the server
            const filteredDayOrders = uniqueDayOrders.filter(
              (order) => !validDayOrders.includes(order)
            );
            setAvailableDayOrders(filteredDayOrders);
          } else {
            // If API fails, keep all unique day orders
            setAvailableDayOrders(uniqueDayOrders);
          }
        }
      } catch (error) {
        console.error("Error fetching valid day orders:", error);
        // If API request fails, retain all available day orders
        if (examData?.data) {
          const uniqueDayOrders = [
            ...new Set(
              Object.values(examData.data).flatMap((subjects) =>
                subjects.map((item) => item.dayOrder)
              )
            ),
          ];
          setAvailableDayOrders(uniqueDayOrders);
        }
      }
    };

    fetchValidDayOrders();
  }, [examData, batch, managerId, managerLocation]);

  // **🔹 Handle Day Order Change**
  const handleDayOrderChange = (e) => {
    const selectedOrder = e.target.value;
    setDayOrder(selectedOrder);
    setSubject(""); // Reset subject each time we pick a new day order

    if (examData?.data) {
      // Step 1: Get all subjects that belong to this day order
      let filteredSubjects = Object.keys(examData.data).filter((sub) =>
        examData.data[sub].some((item) => item.dayOrder === selectedOrder)
      );

      // Step 2: Exclude subjects that are already used for this dayOrder
      // (unless we are editing that specific subject)
      if (!isEditing) {
        const usedSubjectsForSelectedOrder = examQuestions
          .filter((q) => q.dayOrder === selectedOrder)
          .map((q) => q.subject);

        filteredSubjects = filteredSubjects.filter(
          (sub) => !usedSubjectsForSelectedOrder.includes(sub)
        );
      }

      setAvailableSubjects(filteredSubjects);
    }
  };

  // **🔹 Handle Subject Change**
  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSubject(newSubject);

    if (examData?.data?.[newSubject]) {
      const subjectData = examData.data[newSubject].find(
        (item) => item.dayOrder === dayOrder
      );
      if (subjectData) {
        setTotalMCQs(subjectData.MCQ_Stats || { easy: 0, medium: 0, hard: 0 });
        setTotalCoding(
          subjectData.Coding_Stats || { easy: 0, medium: 0, hard: 0 }
        );
        setExamTopics([
          ...subjectData.subTopics,
          ...subjectData.previousSubTopics,
        ]);
      } else {
        setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
        setTotalCoding({ easy: 0, medium: 0, hard: 0 });
        setExamTopics([]);
      }
    } else {
      setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
      setTotalCoding({ easy: 0, medium: 0, hard: 0 });
      setExamTopics([]);
    }
  };

  // **🔹 Handle MCQ Input Change**
  const handleMCQInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);

    // Ensure it's between 0 and the total available
    const safeValue = Math.min(
      Math.max(0, isNaN(parsedValue) ? 0 : parsedValue),
      totalMCQs[name]
    );

    setSelectedMCQs({
      ...selectedMCQs,
      [name]: safeValue,
    });
  };

  // **🔹 Handle Coding Input Change**
  const handleCodingInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);

    // Ensure it's between 0 and the total available
    const safeValue = Math.min(
      Math.max(0, isNaN(parsedValue) ? 0 : parsedValue),
      totalCoding[name]
    );

    setSelectedCoding({
      ...selectedCoding,
      [name]: safeValue,
    });
  };

  // **🔹 Set or Update Questions for Exam**
  const handleSetQuestions = () => {
    if (!subject || !dayOrder) {
      toast.error("Please select a subject and day order.");
      return;
    }

    const existingIndex = examQuestions.findIndex(
      (q) => q.subject === subject && q.dayOrder === dayOrder
    );
    const subjectData = examData?.data?.[subject]?.find(
      (s) => s.dayOrder === dayOrder
    );
    const tags = subjectData?.Tags || [];

    // Calculate MCQ and Coding time constraints
    const mcqTime =
      (selectedMCQs.easy + selectedMCQs.medium + selectedMCQs.hard) * 1;
    const codingTime =
      selectedCoding.easy * 5 +
      selectedCoding.medium * 10 +
      selectedCoding.hard * 15;
    const totalTime = mcqTime + codingTime;

    const newSubjectData = {
      subject,
      dayOrder,
      selectedMCQs,
      selectedCoding,
      Tags: tags,
      timeConstraints: {
        MCQs: {
          easy: selectedMCQs.easy,
          medium: selectedMCQs.medium,
          hard: selectedMCQs.hard,
          total: mcqTime,
        },
        Coding: {
          easy: selectedCoding.easy * 5,
          medium: selectedCoding.medium * 10,
          hard: selectedCoding.hard * 15,
          total: codingTime,
        },
        totalTime,
      },
    };

    if (existingIndex !== -1) {
      // Update existing
      setExamQuestions((prev) =>
        prev.map((q, idx) => (idx === existingIndex ? newSubjectData : q))
      );
      toast.success(`Updated questions for ${subject} - ${dayOrder}!`);
    } else {
      // Add new
      setExamQuestions((prev) => [...prev, newSubjectData]);
      toast.success(`Questions set for ${subject} - ${dayOrder}!`);
    }

    resetFormAfterSet();
  };

  // **🔹 Create Exam**
  const handleCreateExam = async () => {
    if (!startDate || !startTime || examQuestions.length === 0) {
      toast.error("Please complete all exam details.");
      return;
    }

    const overallTotalTime = examQuestions.reduce(
      (sum, subject) => sum + subject.timeConstraints.totalTime,
      0
    );
    const newExam = {
      batch: batch?.Batch,
      subjects: examQuestions,
      totalExamTime: overallTotalTime,
      dayOrder, // This could be relevant if your endpoint uses a single dayOrder or all dayOrders
      startDate,
      startTime,
      managerId,
      managerLocation,
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/generate-exam-paper`,
        newExam,
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(
        `Exam Created Successfully! Total Duration: ${overallTotalTime} mins`
      );

      // Clear everything for the next exam creation, if needed
      setExamQuestions([]);
      setDayOrder("");
      setSubject("");
      setSelectedMCQs({ easy: 0, medium: 0, hard: 0 });
      setSelectedCoding({ easy: 0, medium: 0, hard: 0 });
      setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
      setTotalCoding({ easy: 0, medium: 0, hard: 0 });
      setExamTopics([]);
      setIsEditing(false);
      // If you want to preserve date/time for multiple exam setups, remove these lines:
      setStartDate("");
      setStartTime("");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred!");
    }
  };

  // **Reset only the selection fields** (subject, MCQ, coding, etc.)
  // but do NOT reset startDate or startTime so user doesn't lose them.
  const resetFormAfterSet = () => {
    setSubject("");
    setSelectedMCQs({ easy: 0, medium: 0, hard: 0 });
    setSelectedCoding({ easy: 0, medium: 0, hard: 0 });
    setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
    setTotalCoding({ easy: 0, medium: 0, hard: 0 });
    setExamTopics([]);
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Only reset the form fields; keep the date/time
    resetFormAfterSet();
  };

  // **🔹 Edit previously-set Questions**
  const handleEditQuestions = (subjectToEdit, dayOrderToEdit) => {
    setDayOrder(dayOrderToEdit);
    setSubject(subjectToEdit);
    setIsEditing(true);

    // Pre-fill the fields for the user
    const existingSubject = examQuestions.find(
      (q) => q.subject === subjectToEdit && q.dayOrder === dayOrderToEdit
    );

    if (existingSubject) {
      setSelectedMCQs(existingSubject.selectedMCQs);
      setSelectedCoding(existingSubject.selectedCoding);

      // Also load topic details from examData if needed
      const subjectData = examData?.data?.[subjectToEdit]?.find(
        (s) => s.dayOrder === dayOrderToEdit
      );
      if (subjectData) {
        setTotalMCQs(subjectData.MCQ_Stats || { easy: 0, medium: 0, hard: 0 });
        setTotalCoding(
          subjectData.Coding_Stats || { easy: 0, medium: 0, hard: 0 }
        );
        setExamTopics([
          ...subjectData.subTopics,
          ...subjectData.previousSubTopics,
        ]);
      }
    }
  };

  // **🔹 Delete a subject's questions**
  const handleDeleteQuestion = (subjectToDelete, dayOrderToDelete) => {
    setExamQuestions((prev) =>
      prev.filter(
        (q) =>
          !(q.subject === subjectToDelete && q.dayOrder === dayOrderToDelete)
      )
    );
    toast.success(
      `Deleted questions for ${subjectToDelete} - ${dayOrderToDelete}`
    );
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="flex flex-col lg:flex-row lg:w-[90%] mx-auto gap-6 justify-center">
        {/* Left Panel - Setting up questions */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full lg:w-[60%]">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Set Questions for{" "}
            <span className="bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text">
              {batch?.Batch}
            </span>
          </h2>

          {/* Day Order Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Select Day Order:
            </label>
            <select
              value={dayOrder}
              onChange={handleDayOrderChange}
              disabled={isEditing} // Disable while editing
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 ${
                isEditing ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            >
              <option value="">-- Select Day Order --</option>
              {availableDayOrders.map((order) => (
                <option key={order} value={order}>
                  {order}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          {dayOrder && (
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Subject:
              </label>
              <select
                value={subject}
                onChange={handleSubjectChange}
                disabled={isEditing} // Disable while editing
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 ${
                  isEditing ? "bg-gray-200 cursor-not-allowed" : ""
                }`}
              >
                <option value="">-- Select Subject --</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam Topics */}
          {dayOrder && subject && (
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Exam Topics
              </h3>
              {examTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {examTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No topics available for this subject.
                </p>
              )}
            </div>
          )}

          {/* MCQ Questions */}
          {subject &&
            totalMCQs.easy + totalMCQs.medium + totalMCQs.hard > 0 && (
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  MCQ Questions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {["easy", "medium", "hard"].map((level) => {
                    if (totalMCQs[level] > 0) {
                      return (
                        <div key={level} className="flex flex-col">
                          <label className="mb-2 font-medium text-gray-600">
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </label>
                          <span className="text-sm text-gray-500">
                            Total: {totalMCQs[level]}
                          </span>
                          <input
                            type="number"
                            name={level}
                            value={
                              selectedMCQs[level] === 0
                                ? ""
                                : selectedMCQs[level]
                            }
                            onChange={handleMCQInputChange}
                            placeholder="Enter count"
                            min="0"
                            max={totalMCQs[level]} // Prevent entering higher values
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

          {/* Coding Questions */}
          {subject &&
            totalCoding.easy + totalCoding.medium + totalCoding.hard > 0 && (
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Coding Questions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {["easy", "medium", "hard"].map((level) => {
                    if (totalCoding[level] > 0) {
                      return (
                        <div key={level} className="flex flex-col">
                          <label className="mb-2 font-medium text-gray-600">
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </label>
                          <span className="text-sm text-gray-500">
                            Total: {totalCoding[level]}
                          </span>
                          <input
                            type="number"
                            name={level}
                            value={
                              selectedCoding[level] === 0
                                ? ""
                                : selectedCoding[level]
                            }
                            onChange={handleCodingInputChange}
                            placeholder="Enter count"
                            min="0"
                            max={totalCoding[level]} // Prevent entering higher values
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

          {/* Set Questions / Update Questions Button */}
          {(totalMCQs.easy + totalMCQs.medium + totalMCQs.hard > 0 ||
            totalCoding.easy + totalCoding.medium + totalCoding.hard > 0) && (
            <>
              <button
                onClick={handleSetQuestions}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-md font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
              >
                <span className="relative p-4 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  {isEditing ? "Update Questions" : "Set Questions"}
                </span>
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
                >
                  <span className="relative p-4 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                    Cancel Editing
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Summary & Creation */}
        {examQuestions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md w-full lg:w-[40%]">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Exam Summary (Total Time:{" "}
              {examQuestions.reduce(
                (sum, subject) => sum + subject.timeConstraints.totalTime,
                0
              )}{" "}
              mins)
            </h3>
            <ul className="space-y-3">
              {examQuestions.map((exam, index) => (
                <li
                  key={index}
                  className="p-4 border rounded-lg bg-gray-100 shadow-md flex flex-col space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-semibold text-gray-800">
                        {exam.subject.charAt(0).toUpperCase() +
                          exam.subject.slice(1)}{" "}
                        -{" "}
                        <span className="text-blue-500">
                          {exam.dayOrder.charAt(0).toUpperCase() +
                            exam.dayOrder.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      {/* Edit Button */}
                      <button
                        onClick={() =>
                          handleEditQuestions(exam.subject, exam.dayOrder)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() =>
                          handleDeleteQuestion(exam.subject, exam.dayOrder)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-row gap-1 text-gray-700">
                    <p>
                      <strong>MCQs:</strong> Easy ({exam.selectedMCQs.easy}),{" "}
                      Medium ({exam.selectedMCQs.medium}), Hard (
                      {exam.selectedMCQs.hard})
                    </p>
                    <p>
                      <strong>Coding:</strong> Easy ({exam.selectedCoding.easy}
                      ), Medium ({exam.selectedCoding.medium}), Hard (
                      {exam.selectedCoding.hard})
                    </p>
                  </div>

                  {/* Time Constraints Display */}
                  <div className="bg-blue-50 p-3 rounded-lg mt-2 text-sm text-blue-800">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsTimeCollapsed(!isTimeCollapsed)}
                    >
                      <span className="font-semibold">
                        ⏳ Time Constraints: {exam.timeConstraints.totalTime}{" "}
                        mins
                      </span>
                      <span>{isTimeCollapsed ? "▼" : "▲"}</span>
                    </div>

                    {!isTimeCollapsed && (
                      <ul className="mt-1 space-y-1">
                        <li>
                          <strong>MCQs Time:</strong>{" "}
                          {exam.timeConstraints.MCQs.total} mins
                        </li>
                        <li>
                          <strong>Coding Time:</strong>{" "}
                          {exam.timeConstraints.Coding.total} mins
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Date and Time Selection */}
            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                min={new Date().toISOString().split("T")[0]} // Prevents past dates
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Start Time:
              </label>
              <input
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                min={
                  startDate === new Date().toISOString().split("T")[0]
                    ? new Date().toTimeString().slice(0, 5)
                    : ""
                } // Restricts past time if today
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Create Exam Button */}
            <button
              onClick={handleCreateExam}
              className="mt-4 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-md font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
            >
              <span className="relative p-4 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                Create Exam
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
