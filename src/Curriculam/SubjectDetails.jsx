import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useStudent } from "../contexts/StudentProfileContext";
import { FaCheckCircle, FaBookOpen, FaLock, FaTimes, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./SubjectDetails.css";

const SubjectDetails = () => {
  const { state } = useLocation();
  const { studentDetails } = useStudent();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (state?.subject?.name) {
      fetchCurriculum(state.subject.name);
    }
  }, [state]);

  const fetchCurriculum = async (subject) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
        { params: { location: localStorage.getItem("location"), batchNo: studentDetails.BatchNo, subject } }
      );
      const curriculumData = response.data.std_curiculum || [];
      const curriculumTable = curriculumData.map(item => {
        const topics = Object.values(item.curriculumTable);
        return topics.map(topic => {
          // Add locked property for subtopics where status is 'false'
          topic.SubTopics = topic.SubTopics.map(sub => ({
            ...sub,
            locked: sub.status === "false"  // Lock subtopic if status is false
          }));
  
          // Lock the topic if any subtopic is locked
          topic.locked = topic.SubTopics.some(sub => sub.locked);
  
          // Ensure `videoUrl` is part of the topic object
          topic.videoUrl = topic.videoUrl || "";  // Fallback if videoUrl is missing
  
          return topic;
        });
      }).flat();
      setCurriculum(curriculumTable);
    } catch (err) {
      console.error("Failed to fetch curriculum:", err);
    }
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

  const videoUrls = Array.isArray(selectedTopic?.videoUrl)
  ? selectedTopic.videoUrl
  : [selectedTopic?.videoUrl];  // Correct the property name to 'videoUrl'


  return (
    <div className="flex min-h-screen bg-gray-100 relative transition-all duration-500 ease-in-out">
      {/* Sidebar Toggle Button */}
      {!sidebarOpen && (
        <button
          className="absolute top-2 left-2 mr-10 text-white bg-gray-900 p-3 rounded-md text-2xl focus:outline-none hover:bg-gray-800 transition-all duration-500 ease-in-out z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <img src="/icon.svg" alt="Menu Icon" />
        </button>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`scrollable-sidebar fixed lg:relative bg-gray-900 text-white h-screen flex flex-col transition-all duration-500 ease-in-out shadow-lg rounded-r-2xl 
          ${sidebarOpen ? "w-80 overflow-y-auto p-4" : "w-0 opacity-0 overflow-hidden"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 px-2 py-2 mr-2 text-white bg-indigo-700 rounded-md shadow-md hover:bg-indigo-600 transition-transform transform hover:scale-105"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <h2 className="text-2xl font-bold border-b pb-3 flex-grow text-center">
            {state?.subject?.name} Curriculum
          </h2>
          <button
            className="text-white text-2xl hover:text-gray-400 focus:outline-none ml-2"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <ul className="space-y-3">
          {curriculum.map((item, index) => (
            <li
              key={index}
              onClick={() => !item.locked && setSelectedTopic(item)}
              onKeyDown={(event) => handleKeyDown(event, item)}
              tabIndex={0}
              aria-disabled={item.locked}
              className={`flex items-center gap-3 p-3 rounded-lg transition shadow-md 
                ${item.locked ? "bg-gray-700 cursor-not-allowed opacity-50" : ""} 
                ${selectedTopic?.Topics === item.Topics ? "bg-indigo-700" : "bg-gray-800 hover:bg-gray-700 cursor-pointer"}`}
            >
              {item.locked ? <FaLock className="text-red-400" /> : <FaCheckCircle className="text-green-400" />}
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

      <div
        className={`flex-1 h-screen overflow-y-auto p-10 transition-all duration-500 
          ${sidebarOpen ? "lg:ml-[50px]" : "lg:ml-0"}`}
      >
        <h1 className="text-2xl lg:text-4xl font-bold text-indigo-800 mb-6 text-center md:text-left">
          {selectedTopic?.Topics || "Select a Topic"}
        </h1>
        <div className="bg-[#F5F5F5]">
          <div className="flex w-[90%] gap-6 md:gap-10 lg:gap-6 flex-col md:flex-col lg:flex-row">
            <div className="w-full md:w-full lg:w-[70%] bg-white shadow-lg rounded-md overflow-hidden">
            {videoUrls[0] ? (
  <div className="flex flex-col gap-4">
    {videoUrls.map((url, idx) => (
      <iframe
        key={idx}
        className="w-full aspect-video rounded-md"
        src={getEmbedUrl(url)}  // Ensure the getEmbedUrl function is correctly formatting the URL
        title={`Video ${idx + 1}`}
        frameBorder="0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms"
      ></iframe>
    ))}
  </div>
) : (
  <div className="w-full flex flex-col items-center justify-center bg-white/20 shadow-xl rounded-lg animate-fadeIn border border-gray-200 py-10">
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

            <div className="w-full md:w-full lg:w-[30%] bg-white shadow-lg rounded-md flex flex-col">
              <div className="bg-[#0C1BAA] text-white text-center font-bold py-4 rounded-t-md text-lg">
                Subtopics Covered
              </div>
              <div className="p-5 flex-1">
                <ul className="space-y-3 text-black font-inter text-[16px] leading-[19px]">
                  {selectedTopic?.SubTopics?.map((sub, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-700 text-lg mr-2 flex justify-center items-center font-bold">•</span> {sub.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
