import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import axios from "axios";

export const GrandTestQuestionBank = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { weeklyQuestions, batch } = location.state || {};
  const mentorId = localStorage.getItem("Mentors");

  const [randomQuestions, setRandomQuestions] = useState({
    mcq: [],
    coding: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const contentRef = useRef();

  // Utility to get random questions ensuring at least one per day
  const getRandomQuestions = (questionsByDay, totalQuestions) => {
    const days = Object.keys(questionsByDay);
    const selectedQuestions = [];

    // Ensure at least one question from each day
    days.forEach((day) => {
      const dayQuestions = questionsByDay[day] || [];
      const shuffled = [...dayQuestions].sort(() => 0.5 - Math.random());
      if (shuffled.length > 0) {
        selectedQuestions.push(shuffled[0]);
      }
    });

    // Fill remaining questions randomly
    const allQuestions = days.flatMap((day) => questionsByDay[day] || []);
    const remainingCount = totalQuestions - selectedQuestions.length;
    if (remainingCount > 0) {
      const shuffledAll = [...allQuestions].sort(() => 0.5 - Math.random());
      selectedQuestions.push(...shuffledAll.slice(0, remainingCount));
    }

    return selectedQuestions.slice(0, totalQuestions);
  };

  useEffect(() => {
    if (weeklyQuestions) {
      // Separate MCQs and coding questions by day
      const mcqByDay = {};
      const codingByDay = {};

      Object.keys(weeklyQuestions).forEach((day) => {
        mcqByDay[day] = weeklyQuestions[day]?.mcq || [];
        codingByDay[day] = weeklyQuestions[day]?.coding || [];
      });

      const randomMCQs = getRandomQuestions(mcqByDay, 20);
      const randomCoding = getRandomQuestions(codingByDay, 10);

      setRandomQuestions({ mcq: randomMCQs, coding: randomCoding });
    }
  }, [weeklyQuestions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      mentorId: mentorId,
      batch: batch,
      date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      exam_questions: [...randomQuestions.mcq, ...randomQuestions.coding],
      type: "weekly",
    };
    console.log(payload);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/createweeklyexam`,
        payload
      );
      console.log(response);

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data.message || "Weekly Exam created successfully!",
          confirmButtonColor: "#4CAF50",
        });
        setIsModalOpen(false);
        setFormData({ date: "", startTime: "", endTime: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: response.data.message || "Failed to create exam.",
          confirmButtonColor: "#FF5733",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error.response?.data?.message ||
          "An error occurred. Please check your connection and try again.",
        confirmButtonColor: "#FF5733",
      });
    }
  };

  const handleDownloadPdf = async () => {
    const input = contentRef.current;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4"); // A4 size in portrait orientation
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth; // Fit the width of the page
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
      // Add the current portion of the canvas image to the PDF
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        Math.min(heightLeft, pdfHeight) // Fit within page height
      );
      heightLeft -= pdfHeight;
      if (heightLeft > 0) {
        pdf.addPage();
        position = 0; // Reset position for the new page
      }
    }

    // Save the PDF with a batch-specific name
    pdf.save(`Weekly_Question_Paper_${batch}.pdf`);
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-blue-200 to-white">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-blue-900">
          Weekly Question Paper
        </h1>
        <p className="text-xl text-gray-600">Batch: {batch || "N/A"}</p>
      </header>

      <div className="text-right mb-4">
        <button
          onClick={handleDownloadPdf}
          className="bg-[#35449b] text-white px-4 py-2 rounded-md hover:bg-blue-600 mx-2"
        >
          Download as PDF
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#eb1d3c] text-white px-6 py-2 rounded-md hover:bg-red-500 mx-2"
        >
          Create Exam
        </button>
      </div>

      <div
        ref={contentRef}
        className="p-6 bg-white rounded-lg shadow-lg border border-gray-300"
      >
        <h2 className="text-xl font-bold mb-2 text-left text-[#eb1d3c]">
          Selected Questions
        </h2>

        {randomQuestions.mcq.length > 0 || randomQuestions.coding.length > 0 ? (
          <>
            <h3 className="text-lg font-bold mb-4 text-left text-[#35449b]">
              MCQs
            </h3>
            {randomQuestions.mcq.map((mcq, idx) => (
              <div key={idx} className="mb-8">
                <p className="text-gray-800">
                  <strong>Q{idx + 1}: </strong>
                  {mcq.description}
                </p>
                <ul className="mt-2 ml-6 list-disc">
                  {Object.entries(mcq.options || {}).map(([key, value]) => (
                    <li key={key} className="text-gray-700">
                      {value}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-green-600">
                  <strong>Answer:</strong> {mcq.answer}
                </p>
              </div>
            ))}

            <h3 className="text-lg font-bold mb-4 text-left text-[#35449b]">
              Coding Questions
            </h3>
            {randomQuestions.coding.map((code, idx) => (
              <div key={idx} className="mb-8">
                <p className="text-gray-800">
                  <strong>Q{idx + 1}: </strong>
                  {code.description}
                </p>
                <p className="mt-2 text-gray-600">
                  <strong>Sample Input:</strong> {code.sample_input}
                </p>
                <p className="mt-2 text-gray-600">
                  <strong>Sample Output:</strong> {code.sample_output}
                </p>
              </div>
            ))}
          </>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No questions available.
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Create Exam</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
