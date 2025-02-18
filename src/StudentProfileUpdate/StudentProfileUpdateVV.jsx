import React, { useState,useEffect,useCallback } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';
import { Worker, Viewer } from "@react-pdf-viewer/core"; // ✅ PDF Viewer
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"; // ✅ Layout Plugin
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { useStudent } from "../contexts/StudentProfileContext";
import StudentProfileV from "../StudentProfile/StudentProfileV";
import { useEdit } from "../contexts/EditContext";
import AtsResult from "../Ats/AtsResult";

import {
  FaUserCircle,
  FaGraduationCap,
  FaBriefcase,
  FaFileUpload,
  FaEdit,
} from "react-icons/fa";
import { FcOpenedFolder } from "react-icons/fc";

Modal.setAppElement("#root");


export default function StudentProfileUpdateVV() {
  const { studentDetails,loading } = useStudent();
  const [file, setFile] = useState(null);
  const { edit, setEdit } = useEdit();
  const [resumeUrl, setResumeUrl] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
 const resumeId = localStorage.getItem('id')
 const [modalIsOpen, setModalIsOpen] = useState(false);
 const pdfPlugin = defaultLayoutPlugin();
 const [resumeScore, setResumeScore] = useState(null);
const [scoreLoading, setScoreLoading] = useState(false);
const [updatingResume, setUpdatingResume] = useState(false);
const navigate = useNavigate();
const [scoreModalOpen, setScoreModalOpen] = useState(false); // ✅ State for modal visibility
const [resumeScoreData, setResumeScoreData] = useState(null);


const fetchResumeScore = async () => {
  fetchResume()
  if (!studentDetails?.studentId) {
    Swal.fire({
      icon: "error",
      title: "Student ID Missing",
      text: "Your student ID is not available. Please try again later.",
    });
    return;
  }

  setScoreLoading(true);

  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`, {
      params: { student_id: resumeId },
    });
    // navigate('/ats-result', { state: { analysis: response.data } });


    if (response.status === 200) {
      setResumeScore(response.data.Resume_data.ats_score);
      setResumeScoreData(response.data.Resume_data); // ✅ Store response in state
      setScoreModalOpen(true);
      Swal.fire({
        title: "Resume Score Retrieved",
        text: `Your ATS Resume Score is ${response.data.Resume_data.ats_score}/100`,
        icon: "success",
      });
    }
  } catch (error) {
    console.error("❌ Error fetching resume score:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to Retrieve Score",
      text: "There was an issue fetching your resume score. Please try again later.",
    });
  }

  setScoreLoading(false);
};

  const fetchResume =useCallback( async () => {
    if (!studentDetails || !studentDetails.studentId) { // ✅ Ensure studentDetails exists
      console.error("❌ Student details not available yet.");
      return;
  }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        {
          params: { resumeId: resumeId },
          responseType: "blob", // Get binary PDF
        } 
      );

      const contentType = response.headers["content-type"];

      if (contentType.includes("application/pdf") ) {
        // ✅ pdf received directly, create URL for display

        const pdfUrl = URL.createObjectURL(response.data);
        setResumeUrl(pdfUrl);
    } else {
        console.error("❌ Unsupported file type received:", contentType);
    }
 
    } catch (error) {
      console.error("❌ Error fetching resume:", error);
      setResumeUrl(null); // Reset if no resume is found
    }
  },[resumeId,studentDetails]);


 
  const updateResume = async (e) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: "error",
        title: "No File Selected",
        text: "Please select a file before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("student_id", localStorage.getItem("student_id"));
    setUpdatingResume(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const responseResume = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200 && responseResume.status===200) {
        Swal.fire({
          title: "Resume Updated Successfully",
          icon: "success",
        });
        fetchResume()


        setFile(null);
      e.target.reset(); 
      }
    } catch (error) {
      console.error("Error updating resume:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an issue updating your resume. Please try again later.",
      });
    }finally{
      setUpdatingResume(false);
    }
  };

  /* profile code*/
  const fetchProfilePicture =useCallback(async () => {
    try {
        if (!studentDetails || !studentDetails.studentId){
            console.error("❌ Student ID is missing in studentDetails.");
            return;
        }

        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/pic`,
            {
                params: { student_id: studentDetails.studentId },
                responseType: "blob", // Get binary file
            }
        );



        const contentType = response.headers["content-type"];

        if (contentType.includes("image/png") || contentType.includes("image/jpeg")) {
            // ✅ Image received directly, create URL for display
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePicture(imageUrl);
        } else {
            console.error("❌ Unsupported file type received:", contentType);
        }
    } catch (error) {
        console.error("❌ Error fetching profile picture:", error);
    }
},[studentDetails]);

// ✅ Fetch profile picture once when the component mounts
useEffect(() => {
  if (!studentDetails || !studentDetails.studentId || !resumeId) {
      console.warn("⚠️ Waiting for student details to load...");
      return;
  }
  fetchProfilePicture();
  fetchResume();
}, [studentDetails, fetchProfilePicture, fetchResume, resumeId]);



// ✅ Call once when the component mounts
useEffect(() => {
    if (studentDetails?.studentId) {
        fetchProfilePicture();
    } 
}, [studentDetails,fetchProfilePicture]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const maxSize = 100 * 1024; // 100 KB

    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "The uploaded file must be less than 100 KB.",
        });
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  return (
    <>
    {(!studentDetails || loading) ? (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading student details...</p>
      </div>
    ) :(
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4 py-6">
      {edit ? (
        <StudentProfileV />
      ) : (
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 lg:p-10">
          {loading ? (
            <p className="text-lg text-gray-500 text-center">Loading...</p>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
                <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                <div className="flex flex-col items-center mb-4">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-blue-500 text-5xl" />
                )}
              </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {studentDetails?.name || "No Name"}
                    </h1>
                    <p className="text-gray-500">Student Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setEdit(!edit)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                >
                  <FaEdit className="inline mr-2" /> Edit Profile
                </button>
              </div>

              {/* Profile Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    <FaUserCircle className="inline mr-2 text-blue-500" /> Personal Information
                  </h2>
                  <p className="text-gray-700">
                    <strong>Student Id:</strong> {studentDetails?.studentId || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Batch No:</strong> {studentDetails?.BatchNo || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> {studentDetails?.email || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Age:</strong> {studentDetails?.age || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Gender:</strong> {studentDetails?.gender || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>City:</strong> {studentDetails?.city || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>State:</strong> {studentDetails?.state || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> {studentDetails?.studentPhNumber || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Github:</strong>{" "}
                    <a
                      href={studentDetails?.githubLink || "#"}
                      className="text-blue-500 hover:underline"
                    >
                      {studentDetails?.githubLink || "N/A"}
                    </a>
                  </p>
                </div>

                {/* Academic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    <FaGraduationCap className="inline mr-2 text-purple-500" /> Academic Information
                  </h2>
                  <p className="text-gray-700">
                    <strong>College:</strong> {studentDetails?.collegeName || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>USN:</strong> {studentDetails?.collegeUSNNumber || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Department:</strong> {studentDetails?.department || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Qualification:</strong> {studentDetails?.qualification || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Graduation %:</strong>{" "}
                    {studentDetails?.highestGraduationpercentage || "N/A"}%
                  </p>
                  <p className="text-gray-700">
                    <strong>Year of Passing:</strong> {studentDetails?.yearOfPassing || "N/A"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  <FaBriefcase className="inline mr-2 text-green-500" /> Skills
                </h2>
                <p className="text-gray-700">
                  {studentDetails?.studentSkills?.length > 0
                    ? studentDetails.studentSkills.join(", ")
                    : "N/A"}
                </p>
              </div>

              {resumeUrl ? (
                <div className="flex flex-col md:flex-row  items-center space-y-4 md:space-y-0 md:space-x-4 mt-3">
                  <h2 className="text-xl font-semibold text-gray-700 ">
                    <FcOpenedFolder className="text-3xl inline mr-1 text-red-500 " /> Your Resume
                  </h2>
                  {/* Button to Open Modal */}
                  <button
                    onClick={() => setModalIsOpen(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                  >
                    View Resume
                  </button>
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-3">
                <button
                  onClick={fetchResumeScore}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                  disabled={scoreLoading}
                >
                  {scoreLoading ? "Fetching Score..." : "View Resume Score"}
                </button>

                {/* Show Resume Score if Available */}
                {resumeScore !== null && (
                  <p className="text-lg font-semibold text-gray-700">
                    🎯 ATS Resume Score: <span className="text-blue-600">{resumeScore}/100</span>
                  </p>
                )}
              </div>
                </div>
              ) : (
                <p className="text-gray-500">No resume found.</p>
              )}

           

              {/* ✅ Resume Modal */}
              <Modal
              isOpen={modalIsOpen}
              onRequestClose={() => setModalIsOpen(false)}
              className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-auto"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Resume Preview</h2>
                <button
                  onClick={() => setModalIsOpen(false)}
                  className="text-red-500 text-xl font-bold"
                >
                  ✖
                </button>
              </div>

              {/* Center the PDF Viewer and Make Scrollable */}
              <div
                className="h-[70vh] overflow-auto border rounded-md shadow-lg"
                style={{ maxHeight: "70vh" }}
              >
                {resumeUrl && (
                  <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}>
                  <Viewer
                      fileUrl={resumeUrl}
                      plugins={[pdfPlugin]}
                      style={{
                        height: "100%",
                        width: "100%",
                      }}
                    />
                  </Worker>
                )}
              </div>
            </Modal>

            <Modal
            isOpen={scoreModalOpen}
            onRequestClose={() => setScoreModalOpen(false)}
            className="bg-white p-8 rounded-xl shadow-2xl max-w-5xl w-full mx-auto overflow-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Resume Score Analysis</h2>
              <button
                onClick={() => setScoreModalOpen(false)}
                className="text-red-500 text-2xl font-bold hover:scale-110 transition-transform"
              >
                ✖
              </button>
            </div>

            {/* ✅ Render AtsResult component inside the modal */}
            <div className="overflow-y-auto max-h-[75vh] p-4">
              {resumeScoreData ? (
                <AtsResult analysis={resumeScoreData} />
              ) : (
                <p className="text-center text-gray-500">No resume score data available.</p>
              )}
            </div>
          </Modal>



               {/* View Resume Score Button */}
            

              {/* Resume Upload */}
              <form encType="multipart/form-data" onSubmit={updateResume} className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  <FaFileUpload className="inline mr-2 text-indigo-500" /> Update Resume
                </h2>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                  <input
                    className="w-full md:w-auto text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none p-2"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <button
                    type="submit"
                    disabled={updatingResume} // ✅ Disable while uploading
                    className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 ${
                      updatingResume ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {updatingResume ? "Updating..." : "Update Resume"} {/* ✅ Show loading text */}
                  </button>

                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>)}
    </>
  );
}