import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core"; 
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"; 
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { useStudent } from "../contexts/StudentProfileContext";
import { useEdit } from "../contexts/EditContext";
import AtsResult from "../Ats/AtsResult";
import StudentProfileV from "../StudentProfile/StudentProfileV";

import {
  FaUserCircle,
  FaGraduationCap,
  FaBriefcase,
  FaFileUpload,
  FaEdit,
} from "react-icons/fa";
import { FcOpenedFolder } from "react-icons/fc";

// For accessibility (required by react-modal)
Modal.setAppElement("#root");

export default function StudentProfileUpdateVV() {
  // --- Consume from context ---
  const { studentDetails, loading, profilePicture } = useStudent();
  const { edit, setEdit } = useEdit();
  const navigate = useNavigate();

  // ---- Resume states ----
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [updatingResume, setUpdatingResume] = useState(false);

  // PDF plugin
  const pdfPlugin = defaultLayoutPlugin();

  // ---- Resume ATS Score states ----
  const [resumeScore, setResumeScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [resumeScoreData, setResumeScoreData] = useState(null);

  // ---- Modal open state for "View Resume" ----
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // For convenience, or as needed
  const resumeId = localStorage.getItem("id");

  // ----------------------------------------------------------------
  // 1) FETCH RESUME
  // ----------------------------------------------------------------
  const fetchResume = useCallback(async () => {
    if (!studentDetails?.studentId) {
      console.error("❌ Student details not loaded yet.");
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        {
          params: { resumeId },
          responseType: "blob", // Get binary PDF
        }
      );

      const contentType = response.headers["content-type"];
      if (contentType.includes("application/pdf")) {
        const pdfUrl = URL.createObjectURL(response.data);
        setResumeUrl(pdfUrl);
      } else {
        console.error("❌ Unsupported file type received:", contentType);
      }
    } catch (error) {
      console.error("❌ Error fetching resume:", error);
      setResumeUrl(null); 
    }
  }, [resumeId, studentDetails]);

  // ----------------------------------------------------------------
  // 2) UPDATE RESUME
  // ----------------------------------------------------------------
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
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Optionally do an ATS check right after uploading
      const responseResume = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 && responseResume.status === 200) {
        Swal.fire({
          title: "Resume Updated Successfully",
          icon: "success",
        });
        // Re-fetch the resume
        fetchResume();
        setFile(null);
        e.target.reset();
      }
    } catch (error) {
      console.error("❌ Error updating resume:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an issue updating your resume. Please try again later.",
      });
    } finally {
      setUpdatingResume(false);
    }
  };

  // ----------------------------------------------------------------
  // 3) FETCH RESUME SCORE
  // ----------------------------------------------------------------
  const fetchResumeScore = async () => {
    // Ensure the resume is fetched
    await fetchResume(); 

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
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
        {
          params: { student_id: resumeId },
        }
      );

      if (response.status === 200) {
        const score = response.data.Resume_data.ats_score;
        setResumeScore(score);
        setResumeScoreData(response.data.Resume_data);
        setScoreModalOpen(true);

        Swal.fire({
          title: "Resume Score Retrieved",
          text: `Your ATS Resume Score is ${score}/100`,
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
    } finally {
      setScoreLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 4) ON MOUNT => fetch resume
  // ----------------------------------------------------------------
  useEffect(() => {
    if (studentDetails?.studentId && resumeId) {
      // We rely on the context to fetch the profile picture,
      // so we ONLY fetch the resume here:
      fetchResume();
    }
  }, [studentDetails, resumeId, fetchResume]);

  // ----------------------------------------------------------------
  // 5) RENDER
  // ----------------------------------------------------------------
  if (!studentDetails || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading student details...</p>
      </div>
    );
  }

  // If user is in edit mode => show StudentProfileV
  if (edit) {
    return <StudentProfileV />;
  }

  // Otherwise, read-only profile
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4 py-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 lg:p-10">
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

          {/* Edit button toggles edit mode => StudentProfileV */}
          <button
            onClick={() => setEdit(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <FaEdit className="inline mr-2" /> Edit Profile
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              <FaUserCircle className="inline mr-2 text-blue-500" /> Personal
              Information
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
              <strong>Date of Birth:</strong> {studentDetails?.DOB || "N/A"}
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
              <strong>Phone:</strong>{" "}
              {studentDetails?.studentPhNumber || "N/A"}
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
            <p className="text-gray-700">
              <strong>Arrears:</strong>{" "}
              {studentDetails?.arrears ? "Yes" : "No"}
            </p>
            {studentDetails?.arrears && (
              <p className="text-gray-700">
                <strong>Arrears Count:</strong>{" "}
                {studentDetails?.ArrearsCount || "N/A"}
              </p>
            )}
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              <FaGraduationCap className="inline mr-2 text-purple-500" /> Academic
              Information
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
              <strong>Qualification:</strong>{" "}
              {studentDetails?.qualification || "N/A"}
            </p>

            {/* 10th Details */}
            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              10th Standard
            </h3>
            <p className="text-gray-700">
              <strong>10th Percentage:</strong>{" "}
              {studentDetails?.tenthStandard || "N/A"}%
            </p>
            <p className="text-gray-700">
              <strong>10th Passout Year:</strong>{" "}
              {studentDetails?.TenthPassoutYear || "N/A"}
            </p>

            {/* 12th Details */}
            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              Intermediate / 12th
            </h3>
            <p className="text-gray-700">
              <strong>Intermediate Percentage:</strong>{" "}
              {studentDetails?.twelfthStandard || "N/A"}%
            </p>
            <p className="text-gray-700">
              <strong>Intermediate Passout Year:</strong>{" "}
              {studentDetails?.TwelfthPassoutYear || "N/A"}
            </p>

            {/* Graduation */}
            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              Graduation
            </h3>
            <p className="text-gray-700">
              <strong>Graduation Percentage:</strong>{" "}
              {studentDetails?.highestGraduationpercentage || "N/A"}%
            </p>
            <p className="text-gray-700">
              <strong>Graduation Passout Year:</strong>{" "}
              {studentDetails?.yearOfPassing || "N/A"}
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

        {/* Resume Section */}
        {resumeUrl ? (
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-3">
            <h2 className="text-xl font-semibold text-gray-700">
              <FcOpenedFolder className="text-3xl inline mr-1" /> Your Resume
            </h2>
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
              {resumeScore !== null && (
                <p className="text-lg font-semibold text-gray-700">
                  🎯 ATS Resume Score:{" "}
                  <span className="text-blue-600">{resumeScore}/100</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No resume found.</p>
        )}

        {/* Resume Preview Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Resume Preview
            </h2>
            <button
              onClick={() => setModalIsOpen(false)}
              className="text-red-500 text-xl font-bold"
            >
              ✖
            </button>
          </div>
          <div
            className="h-[70vh] overflow-auto border rounded-md shadow-lg"
            style={{ maxHeight: "70vh" }}
          >
            {resumeUrl && (
              <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
                <Viewer fileUrl={resumeUrl} plugins={[pdfPlugin]} />
              </Worker>
            )}
          </div>
        </Modal>

        {/* Score Modal */}
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
            <h2 className="text-2xl font-bold text-gray-800">
              Resume Score Analysis
            </h2>
            <button
              onClick={() => setScoreModalOpen(false)}
              className="text-red-500 text-2xl font-bold hover:scale-110 transition-transform"
            >
              ✖
            </button>
          </div>
          <div className="overflow-y-auto max-h-[75vh] p-4">
            {resumeScoreData ? (
              <AtsResult analysis={resumeScoreData} />
            ) : (
              <p className="text-center text-gray-500">
                No resume score data available.
              </p>
            )}
          </div>
        </Modal>

        {/* Resume Upload Form */}
        <form
          encType="multipart/form-data"
          onSubmit={updateResume}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            <FaFileUpload className="inline mr-2 text-indigo-500" /> Update Resume
          </h2>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <input
              className="w-full md:w-auto text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none p-2"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              type="submit"
              disabled={updatingResume}
              className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 ${
                updatingResume ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {updatingResume ? "Updating..." : "Update Resume"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import Modal from "react-modal";
// import { useNavigate } from "react-router-dom";
// import { Worker, Viewer } from "@react-pdf-viewer/core"; 
// import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// import "@react-pdf-viewer/core/lib/styles/index.css";
// import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// import Swal from "sweetalert2/dist/sweetalert2.min.js";
// import { useStudent } from "../contexts/StudentProfileContext";
// import { useEdit } from "../contexts/EditContext";
// import AtsResult from "../Ats/AtsResult";
// import StudentProfileV from "../StudentProfile/StudentProfileV"; // your edit form if needed

// import {
//   FaUserCircle,
//   FaGraduationCap,
//   FaBriefcase,
//   FaFileUpload,
//   FaEdit,
// } from "react-icons/fa";
// import { FcOpenedFolder } from "react-icons/fc";

// // For accessibility with react-modal
// Modal.setAppElement("#root");

// export default function StudentProfileUpdateVV() {
//   const { studentDetails, loading } = useStudent();
//   const { edit, setEdit } = useEdit();
//   const navigate = useNavigate();

//   // ---- Resume states ----
//   const [file, setFile] = useState(null);
//   const [resumeUrl, setResumeUrl] = useState(null);
//   const [updatingResume, setUpdatingResume] = useState(false);

//   // PDF plugin
//   const pdfPlugin = defaultLayoutPlugin();

//   // ---- Resume ATS Score ----
//   const [resumeScore, setResumeScore] = useState(null);
//   const [scoreLoading, setScoreLoading] = useState(false);
//   const [scoreModalOpen, setScoreModalOpen] = useState(false);
//   const [resumeScoreData, setResumeScoreData] = useState(null);

//   // ---- Profile picture ----
//   const [profilePicture, setProfilePicture] = useState(null);

//   // If you want a “live preview” of the newly selected picture (optional)
//   const [newProfilePicPreview, setNewProfilePicPreview] = useState(null);

//   // Modal for “View Resume”
//   const [modalIsOpen, setModalIsOpen] = useState(false);

//   // For convenience, or as needed
//   const resumeId = localStorage.getItem("id");

//   // -----------------------------
//   // 1) FETCH PROFILE PICTURE
//   // -----------------------------
//   const fetchProfilePicture = useCallback(async () => {
//     try {
//       if (!studentDetails || !studentDetails.studentId) {
//         console.error("❌ Student ID is missing in studentDetails.");
//         return;
//       }
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/v1/pic`,
//         {
//           params: { student_id: studentDetails.studentId },
//           responseType: "blob", // get binary file
//         }
//       );

//       const contentType = response.headers["content-type"];
//       if (contentType.includes("image/png") || contentType.includes("image/jpeg")) {
//         const imageUrl = URL.createObjectURL(response.data);
//         setProfilePicture(imageUrl);
//       } else {
//         console.error("❌ Unsupported file type received:", contentType);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching profile picture:", error);
//     }
//   }, [studentDetails]);

//   // -----------------------------
//   // 2) FETCH RESUME
//   // -----------------------------
//   const fetchResume = useCallback(async () => {
//     if (!studentDetails?.studentId) {
//       console.error("❌ Student details not loaded yet.");
//       return;
//     }
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
//         {
//           params: { resumeId: resumeId },
//           responseType: "blob", // PDF
//         }
//       );
//       const contentType = response.headers["content-type"];
//       if (contentType.includes("application/pdf")) {
//         const pdfUrl = URL.createObjectURL(response.data);
//         setResumeUrl(pdfUrl);
//       } else {
//         console.error("❌ Unsupported file type received:", contentType);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching resume:", error);
//       setResumeUrl(null);
//     }
//   }, [resumeId, studentDetails]);

//   // -----------------------------
//   // 3) UPDATE RESUME
//   // -----------------------------
//   const updateResume = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       Swal.fire({
//         icon: "error",
//         title: "No File Selected",
//         text: "Please select a file before submitting.",
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("resume", file);
//     formData.append("student_id", localStorage.getItem("student_id"));

//     setUpdatingResume(true);
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       // Optionally do ATS check
//       const atsResponse = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       if (response.status === 200 && atsResponse.status === 200) {
//         Swal.fire({
//           title: "Resume Updated Successfully",
//           icon: "success",
//         });
//         // refresh
//         fetchResume();
//         setFile(null);
//         e.target.reset();
//       }
//     } catch (error) {
//       console.error("❌ Error updating resume:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Update Failed",
//         text: "There was an issue updating your resume. Please try again later.",
//       });
//     } finally {
//       setUpdatingResume(false);
//     }
//   };

//   // -----------------------------
//   // 4) FETCH ATS RESUME SCORE
//   // -----------------------------
//   const fetchResumeScore = async () => {
//     await fetchResume(); 
//     if (!studentDetails?.studentId) {
//       Swal.fire({
//         icon: "error",
//         title: "Student ID Missing",
//         text: "Your student ID is not available. Please try again later.",
//       });
//       return;
//     }

//     setScoreLoading(true);
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
//         {
//           params: { student_id: resumeId },
//         }
//       );

//       if (response.status === 200) {
//         setResumeScore(response.data.Resume_data.ats_score);
//         setResumeScoreData(response.data.Resume_data);
//         setScoreModalOpen(true);

//         Swal.fire({
//           title: "Resume Score Retrieved",
//           text: `Your ATS Resume Score is ${response.data.Resume_data.ats_score}/100`,
//           icon: "success",
//         });
//       }
//     } catch (error) {
//       console.error("❌ Error fetching resume score:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Failed to Retrieve Score",
//         text: "There was an issue fetching your resume score. Please try again later.",
//       });
//     } finally {
//       setScoreLoading(false);
//     }
//   };

//   // -----------------------------
//   // 5) ON MOUNT => fetch picture & resume
//   // -----------------------------
//   useEffect(() => {
//     if (studentDetails?.studentId && resumeId) {
//       fetchProfilePicture();
//       fetchResume();
//     }
//   }, [studentDetails, resumeId, fetchProfilePicture, fetchResume]);

//   // -----------------------------
//   // 6) “EDIT PIC” OVERLAY - EVENT
//   // -----------------------------
//   const handleEditPicClick = () => {
//     // Just trigger our hidden file input
//     document.getElementById("profilePicInput")?.click();
//   };

//   // If user picks a new profile pic (for a live preview)
//   const handleProfilePicInput = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     // For a quick preview
//     const imageUrl = URL.createObjectURL(selectedFile);
//     setNewProfilePicPreview(imageUrl);

//     // Then you'd do the actual upload to server if you want immediate upload,
//     // or store it in state for an “edit mode” approach.
//     // For demonstration, let's just do a quick upload:
//     uploadNewProfilePic(selectedFile);
//   };

//   // Example: upload new pic once chosen
//   const uploadNewProfilePic = async (newPicFile) => {
//     try {
//       const formData = new FormData();
//       formData.append("profilePic", newPicFile);
//       formData.append("student_id", localStorage.getItem("student_id"));

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/v1/profilepic`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       if (response.status === 200) {
//         Swal.fire({
//           title: "Profile Picture Updated",
//           icon: "success",
//         });
//         // Re-fetch the updated pic from the server
//         fetchProfilePicture();
//       }
//     } catch (error) {
//       console.error("Error uploading new profile picture:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Upload Failed",
//         text: "Unable to update profile picture. Please try again.",
//       });
//     }
//   };

//   // -----------------------------
//   // 7) RENDER
//   // -----------------------------
//   if (!studentDetails || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500 text-lg">Loading student details...</p>
//       </div>
//     );
//   }

//   // If in “edit” mode => show the separate component (like StudentProfileV)
//   if (edit) {
//     return <StudentProfileV />;
//   }

//   // Otherwise, read-only mode
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4 py-6">
//       <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 lg:p-10">
//         {/* Profile Header */}
//         <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
//           <div className="flex items-center space-x-6 mb-4 lg:mb-0">
//             {/* ------------- “EDIT PIC” Overlay Section ------------- */}
//             <div className="relative w-24 h-24">
//               {newProfilePicPreview ? (
//                 // If user has just selected a new pic, show the preview
//                 <img
//                   src={newProfilePicPreview}
//                   alt="Preview"
//                   className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
//                 />
//               ) : profilePicture ? (
//                 // Otherwise show existing
//                 <img
//                   src={profilePicture}
//                   alt="Profile"
//                   className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
//                 />
//               ) : (
//                 // fallback icon
//                 <FaUserCircle className="w-24 h-24 bg-gray-100 text-blue-500 rounded-full" />
//               )}

//               {/* Overlaid edit button (bottom-right) */}
//               <button
//                 type="button"
//                 onClick={handleEditPicClick}
//                 className="absolute bottom-0 right-0 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow border hover:scale-105 transform transition"
//               >
//                 <FaEdit className="text-green-500" />
//               </button>

//               {/* Hidden file input for picking a new pic */}
//               <input
//                 id="profilePicInput"
//                 type="file"
//                 accept="image/*"
//                 style={{ display: "none" }}
//                 onChange={handleProfilePicInput}
//               />
//             </div>

//             {/* Name and other info */}
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">
//                 {studentDetails?.name || "No Name"}
//               </h1>
//               <p className="text-gray-500">Student Profile</p>
//             </div>
//           </div>

//           {/* The “Edit Profile” button => toggles edit = true */}
//           <button
//             onClick={() => setEdit(true)}
//             className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
//           >
//             <FaEdit className="inline mr-2" /> Edit Profile
//           </button>
//         </div>

//         {/* Profile sections below... */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Personal Information */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">
//               <FaUserCircle className="inline mr-2 text-blue-500" /> Personal
//               Information
//             </h2>
//             <p className="text-gray-700">
//               <strong>Student Id:</strong> {studentDetails?.studentId || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Batch No:</strong> {studentDetails?.BatchNo || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Email:</strong> {studentDetails?.email || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Date of Birth:</strong> {studentDetails?.DOB || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Age:</strong> {studentDetails?.age || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Gender:</strong> {studentDetails?.gender || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>City:</strong> {studentDetails?.city || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>State:</strong> {studentDetails?.state || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Phone:</strong>{" "}
//               {studentDetails?.studentPhNumber || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Github:</strong>{" "}
//               <a
//                 href={studentDetails?.githubLink || "#"}
//                 className="text-blue-500 hover:underline"
//               >
//                 {studentDetails?.githubLink || "N/A"}
//               </a>
//             </p>
//             <p className="text-gray-700">
//               <strong>Arrears:</strong>{" "}
//               {studentDetails?.arrears ? "Yes" : "No"}
//             </p>
//             {studentDetails?.arrears && (
//               <p className="text-gray-700">
//                 <strong>Arrears Count:</strong>{" "}
//                 {studentDetails?.ArrearsCount || "N/A"}
//               </p>
//             )}
//           </div>

//           {/* Academic Information */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">
//               <FaGraduationCap className="inline mr-2 text-purple-500" /> Academic
//               Information
//             </h2>
//             <p className="text-gray-700">
//               <strong>College:</strong> {studentDetails?.collegeName || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>USN:</strong> {studentDetails?.collegeUSNNumber || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Department:</strong>{" "}
//               {studentDetails?.department || "N/A"}
//             </p>
//             <p className="text-gray-700">
//               <strong>Qualification:</strong>{" "}
//               {studentDetails?.qualification || "N/A"}
//             </p>

//             {/* 10th Details */}
//             <h3 className="text-lg font-semibold text-gray-700 mt-4">
//               10th Standard
//             </h3>
//             <p className="text-gray-700">
//               <strong>10th Percentage:</strong>{" "}
//               {studentDetails?.tenthStandard || "N/A"}%
//             </p>
//             <p className="text-gray-700">
//               <strong>10th Passout Year:</strong>{" "}
//               {studentDetails?.TenthPassoutYear || "N/A"}
//             </p>

//             {/* 12th Details */}
//             <h3 className="text-lg font-semibold text-gray-700 mt-4">
//               Intermediate / 12th
//             </h3>
//             <p className="text-gray-700">
//               <strong>Intermediate Percentage:</strong>{" "}
//               {studentDetails?.twelfthStandard || "N/A"}%
//             </p>
//             <p className="text-gray-700">
//               <strong>Intermediate Passout Year:</strong>{" "}
//               {studentDetails?.TwelfthPassoutYear || "N/A"}
//             </p>

//             {/* Graduation */}
//             <h3 className="text-lg font-semibold text-gray-700 mt-4">
//               Graduation
//             </h3>
//             <p className="text-gray-700">
//               <strong>Graduation Percentage:</strong>{" "}
//               {studentDetails?.highestGraduationpercentage || "N/A"}%
//             </p>
//             <p className="text-gray-700">
//               <strong>Graduation Passout Year:</strong>{" "}
//               {studentDetails?.yearOfPassing || "N/A"}
//             </p>
//           </div>
//         </div>

//         {/* Skills */}
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4">
//             <FaBriefcase className="inline mr-2 text-green-500" /> Skills
//           </h2>
//           <p className="text-gray-700">
//             {studentDetails?.studentSkills?.length > 0
//               ? studentDetails.studentSkills.join(", ")
//               : "N/A"}
//           </p>
//         </div>

//         {/* Resume Section */}
//         {resumeUrl ? (
//           <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-3">
//             <h2 className="text-xl font-semibold text-gray-700">
//               <FcOpenedFolder className="text-3xl inline mr-1" /> Your Resume
//             </h2>
//             <button
//               onClick={() => setModalIsOpen(true)}
//               className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
//             >
//               View Resume
//             </button>
//             <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-3">
//               <button
//                 onClick={fetchResumeScore}
//                 className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
//                 disabled={scoreLoading}
//               >
//                 {scoreLoading ? "Fetching Score..." : "View Resume Score"}
//               </button>
//               {resumeScore !== null && (
//                 <p className="text-lg font-semibold text-gray-700">
//                   🎯 ATS Resume Score:{" "}
//                   <span className="text-blue-600">{resumeScore}/100</span>
//                 </p>
//               )}
//             </div>
//           </div>
//         ) : (
//           <p className="text-gray-500">No resume found.</p>
//         )}

//         {/* Resume Preview Modal */}
//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={() => setModalIsOpen(false)}
//           className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-auto"
//           overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold text-gray-700">
//               Resume Preview
//             </h2>
//             <button
//               onClick={() => setModalIsOpen(false)}
//               className="text-red-500 text-xl font-bold"
//             >
//               ✖
//             </button>
//           </div>
//           <div
//             className="h-[70vh] overflow-auto border rounded-md shadow-lg"
//             style={{ maxHeight: "70vh" }}
//           >
//             {resumeUrl && (
//               <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
//                 <Viewer fileUrl={resumeUrl} plugins={[pdfPlugin]} />
//               </Worker>
//             )}
//           </div>
//         </Modal>

//         {/* Score Modal */}
//         <Modal
//           isOpen={scoreModalOpen}
//           onRequestClose={() => setScoreModalOpen(false)}
//           className="bg-white p-8 rounded-xl shadow-2xl max-w-5xl w-full mx-auto overflow-auto"
//           overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
//           style={{
//             maxHeight: "90vh",
//             overflowY: "auto",
//             borderRadius: "12px",
//             padding: "20px",
//           }}
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">
//               Resume Score Analysis
//             </h2>
//             <button
//               onClick={() => setScoreModalOpen(false)}
//               className="text-red-500 text-2xl font-bold hover:scale-110 transition-transform"
//             >
//               ✖
//             </button>
//           </div>
//           <div className="overflow-y-auto max-h-[75vh] p-4">
//             {resumeScoreData ? (
//               <AtsResult analysis={resumeScoreData} />
//             ) : (
//               <p className="text-center text-gray-500">
//                 No resume score data available.
//               </p>
//             )}
//           </div>
//         </Modal>

//         {/* Update Resume Form */}
//         <form encType="multipart/form-data" onSubmit={updateResume} className="mt-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4">
//             <FaFileUpload className="inline mr-2 text-indigo-500" /> Update Resume
//           </h2>
//           <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
//             <input
//               className="w-full md:w-auto text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none p-2"
//               type="file"
//               onChange={(e) => setFile(e.target.files[0])}
//             />
//             <button
//               type="submit"
//               disabled={updatingResume}
//               className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 ${
//                 updatingResume ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {updatingResume ? "Updating..." : "Update Resume"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }






