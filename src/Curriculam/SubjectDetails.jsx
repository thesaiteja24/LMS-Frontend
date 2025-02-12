import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useStudent } from "../contexts/StudentProfileContext";
import { FaCheckCircle, FaBookOpen, FaEdit, FaLock, FaBars, FaTimes, FaStar, FaRegStar,FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./SubjectDetails.css";

const SubjectDetails = () => {
  const { state } = useLocation();
  const { studentDetails } = useStudent();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [mentorSyllabus, setMentorSyllabus] = useState([]);
  const [filteredCurriculum, setFilteredCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (state?.subject?.name) {
      fetchCurriculum(state.subject.name);
      fetchMentorSyllabus(state.subject.name);
    }
  }, [state]);

  useEffect(() => {
    if (curriculum.length > 0 || mentorSyllabus.length > 0) {
      mergeCurriculums(curriculum, mentorSyllabus);
    }
  }, [curriculum, mentorSyllabus]);

  const fetchCurriculum = async (subject) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/stdcurriculum`,
        { params: { location: localStorage.getItem("location"), batchNo: studentDetails.BatchNo, subject } }
      );
      const curriculumData = response.data.std_curiculum || [];
      setCurriculum(curriculumData);
      mergeCurriculums(curriculumData, mentorSyllabus);
    } catch (err) {
      setError("Failed to fetch curriculum. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorSyllabus = async (subject) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentorsyllabus`,
        { params: { subject, location: localStorage.getItem("location"), batches: studentDetails.BatchNo } }
      );
      setMentorSyllabus(response.data.curriculum || []);
      mergeCurriculums(curriculum, response.data.curriculum || []);
    } catch (error) {
      console.error("Error fetching mentor syllabus:", error);
    }
  };

  const mergeCurriculums = (studentCurriculum, mentorCurriculum) => {
    const studentCurriculumIds = new Set(studentCurriculum.map((item) => item.CurriculumId));
    const combinedSyllabus = [...studentCurriculum];

    mentorCurriculum.forEach((mentorTopic) => {
      if (!studentCurriculumIds.has(mentorTopic.id)) {
        combinedSyllabus.push({ ...mentorTopic, locked: true });
      }
    });

    const filtered = filterDuplicateSubTopics(combinedSyllabus);
    setFilteredCurriculum(filtered);

    const firstUnlockedTopic = filtered.find((topic) => !topic.locked);
    if (firstUnlockedTopic) {
      setSelectedTopic(firstUnlockedTopic);
    }
  };

  const filterDuplicateSubTopics = (curriculumData) => {
    const futurePrevSubTopics = new Set();
    const filteredCurriculum = [];

    for (let i = curriculumData.length - 1; i >= 0; i--) {
      const item = curriculumData[i];

      if (item.PreviousSubTopics?.length > 0) {
        item.PreviousSubTopics.forEach((prev) => {
          if (prev.subTopic) {
            futurePrevSubTopics.add(prev.subTopic.trim().toLowerCase());
          }
        });
      }

      const filteredSubTopics = item.SubTopics.filter(
        (sub) => sub.subTopic && !futurePrevSubTopics.has(sub.subTopic.trim().toLowerCase())
      );

      filteredCurriculum.unshift({ ...item, SubTopics: filteredSubTopics });
    }

    return filteredCurriculum;
  };

  const getEmbedUrl = (videoUrl) => {
    try {
      const url = new URL(videoUrl);
      if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${url.searchParams.get("v")}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
      }
      if (url.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${url.pathname.slice(1)}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
      }
      if (url.hostname.includes("drive.google.com")) {
        const fileId = url.pathname.split("/d/")[1]?.split("/")[0];
        return fileId
          ? `https://drive.google.com/file/d/${fileId}/preview?modestbranding=1&rel=0&showinfo=0&fs=0`
          : videoUrl;
      }
      return videoUrl;
    } catch (error) {
      console.error("Invalid video URL:", videoUrl);
      return "";
    }
  };

  const submitRating = () => {
    Swal.fire({
      icon: "success",
      title: `Thank you for rating ${rating} stars!`,
      showConfirmButton: false,
      timer: 1500,
    });
    setRating(0);
    setIsRatingModalOpen(false);
  };

  const handleDiscussionSubmit = (e) => {
    e.preventDefault();
    // Handle discussion submission logic here
  };

  // Auto-close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Keyboard accessibility
  const handleKeyDown = (event, item) => {
    if (event.key === "Enter" && !item.locked) {
      setSelectedTopic(item);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative transition-all duration-500 ease-in-out">
      {/* Sidebar Toggle Button */}

      {!sidebarOpen&&      <button
        className="absolute top-2 left-2 mr-10 text-white bg-gray-900 p-3 rounded-md text-2xl focus:outline-none hover:bg-gray-800 transition-all duration-500 ease-in-out z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
  {!sidebarOpen && <img src="/icon.svg" alt="Menu Icon" />}
  {/* Use SVG as a component */}      
</button>}


      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`scrollable-sidebar  bg-gray-900 text-white h-screen flex flex-col transition-all duration-500 ease-in-out shadow-lg rounded-r-2xl ${sidebarOpen ? "w-80 overflow-y-auto p-4" : "w-0 opacity-0 overflow-hidden"}`}
        style={{ position: sidebarOpen && window.innerWidth <= 768 ? 'fixed'  : 'relative' }} // Adjust position based on screen size
      >
        <div className="flex items-center justify-between mb-4 ">
        <div className="flex justify-end mb-1 ">
        <button
        onClick={() => navigate('/courses')}
        className="flex items-center  gap-2 px-2 py-2 mr-2 text-white bg-indigo-700 rounded-md shadow-md hover:bg-indigo-600 transition-transform transform hover:scale-105"
      >
        <FaArrowLeft className="text-lg" />
      </button>
        </div>
          <h2 className="text-2xl font-bold border-b pb-3 flex-grow text-center">
            {state?.subject?.name} Curriculum
          </h2>
          <button className="text-white text-2xl hover:text-gray-400 focus:outline-none ml-2" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <ul className="space-y-3">
          {filteredCurriculum.map((item, index) => (
            <li
              key={index}
              onClick={() => !item.locked && setSelectedTopic(item)}
              onKeyDown={(event) => handleKeyDown(event, item)}
              tabIndex={0}
              aria-disabled={item.locked}
              className={`flex items-center gap-3 p-3 rounded-lg transition shadow-md 
                ${item.locked ? "bg-gray-700 cursor-not-allowed opacity-50" : ""}
                ${selectedTopic?.Topics === item.Topics ? "bg-indigo-700" : "bg-gray-800 hover:bg-gray-700 cursor-pointer"}
              `}
            >
              {item.locked ? (
                <FaLock className="text-red-400" />
              ) : (
                <FaCheckCircle className="text-green-400" />
              )}
              {item.type === "video" && <FaBookOpen className="text-blue-400" />}
              {item.type === "practice" && <FaEdit className="text-yellow-400" />}
              <div>
                <p className="text-md font-medium text-white">{item.Topics}</p>
                {item.duration && <p className="text-sm text-gray-300">{item.duration}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Content Section */}
      <div className={`flex-1 h-screen overflow-y-auto p-4 lg:p-12 ${sidebarOpen && window.innerWidth > 768 ? "ml-10" : ""}`}>
        {/* Header */}
     

        {/* Topic Title */}
        <h1 className="text-2xl lg:text-4xl ml-10  font-bold text-indigo-800 mb-6 text-center md:text-left">
          {selectedTopic?.Topics || "Select a Topic"}
        </h1>

        {/* Video Section */}
        <div >
          {selectedTopic?.VideoUrl ? (
            <div className="w-full  rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={getEmbedUrl(selectedTopic.VideoUrl)}
                className="w-full h-auto aspect-video rounded-lg"
                allowFullScreen
                loading="lazy"
                sandbox="allow-same-origin allow-scripts allow-forms"
              ></iframe>
            </div>
          ) :  (
            <div className="w-full max-w-3xl flex flex-col items-center justify-center bg-white/20 backdrop-blur-lg shadow-xl rounded-lg p-8 animate-fadeIn border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-indigo-500 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m9-9a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-indigo-600 mt-4">Coming Soon!</h2>
            <p className="text-gray-600 mt-2 text-center max-w-md">
              We're working hard to bring you this content. Stay tuned!
            </p>
          </div>
          
          )}
        </div>

        {/* Subtopics Section */}
        {selectedTopic?.SubTopics?.length > 0 || selectedTopic?.PreviousSubTopics?.length > 0 ? (
          <div className="mt-10 bg-white rounded-2xl shadow-md p-6  w-full">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">SubTopics Covered:</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {selectedTopic?.SubTopics?.map((sub, index) => (
                <li key={index} className="text-lg">{sub.subTopic}</li>
              ))}
              {selectedTopic?.PreviousSubTopics?.map((prev, index) => (
                <li key={`prev-${index}`} className="text-lg text-gray-500">
                  {prev.subTopic} (Previous)
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Rating Modal */}
        {isRatingModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Rate your session</h2>
              <div className="flex justify-center items-center mb-8 space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="text-4xl focus:outline-none transform transition-transform hover:scale-125"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    {star <= (hoverRating || rating) ? (
                      <FaStar className="text-yellow-500" />
                    ) : (
                      <FaRegStar className="text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={submitRating}
                className="w-full px-4 py-3 bg-indigo-700 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-transform transform hover:scale-105"
              >
                Submit Rating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetails;