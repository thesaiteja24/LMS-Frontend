import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-modal";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { useStudent } from "../contexts/StudentProfileContext";
import { useEdit } from "../contexts/EditContext";
import StudentProfileV from "../StudentProfile/StudentProfileV";
import AtsResult from "../Ats/AtsResult";
import { decryptData } from '../../cryptoUtils.jsx';


import { FaUserCircle, FaEdit, FaUserAlt, FaGraduationCap,FaFileUpload,FaFileAlt  } from "react-icons/fa";  

// For accessibility (required by react-modal)
Modal.setAppElement("#root");

export default function StudentProfileUpdateVV() {
  const { studentDetails, loading, profilePicture } = useStudent();
  const { edit, setEdit } = useEdit();

  // Resume states
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [updatingResume, setUpdatingResume] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();

  // ATS Score states
  const [resumeScore, setResumeScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [resumeScoreData, setResumeScoreData] = useState(null);

  // Modal states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  // For convenience
  const resumeId = decryptData(localStorage.getItem("id"));

  // 1) Fetch Resume
  const fetchResume = useCallback(async () => {
    if (!studentDetails?.studentId) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        {
          params: { resumeId },
          responseType: "blob",
        }
      );
      const contentType = response.headers["content-type"];
      if (contentType.includes("application/pdf")) {
        const pdfUrl = URL.createObjectURL(response.data);
        setResumeUrl(pdfUrl);
      } else {
        console.error("Unsupported file type:", contentType);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      setResumeUrl(null);
    }
  }, [resumeId, studentDetails]);

  // 2) Update Resume
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
    formData.append("student_id", decryptData(localStorage.getItem("student_id")));

    setUpdatingResume(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

     

      if (response.status === 200) {
        Swal.fire({
          title: "Resume Updated Successfully",
          icon: "success",
        });
        fetchResume();
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
    } finally {
      setUpdatingResume(false);
    }
  };

  // 3) Fetch Resume Score
  const fetchResumeScore = async () => {
    // Ensure the resume is fetched first
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
      console.error("Error fetching resume score:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Retrieve Score",
        text: "There was an issue fetching your resume score. Please try again later.",
      });
    } finally {
      setScoreLoading(false);
    }
  };

  // 4) On Mount => Fetch Resume
  useEffect(() => {
    if (studentDetails?.studentId && resumeId) {
      fetchResume();
    }
  }, [studentDetails, resumeId, fetchResume]);

  // Loading or Edit mode
  if (!studentDetails || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading student details...</p>
      </div>
    );
  }
  if (edit) {
    return <StudentProfileV />;
  }

  // 5) Render
  return (
    <div className=" bg-[#F4F4F4] p-4 flex flex-col items-center justify-center">
      {/* ===================== MAIN CARD ===================== */}
      <div className="w-full bg-white rounded-md shadow-md p-6 max-w-7xl justify-center items-center" style={{ boxShadow: "0px 4px 4px 0px #00000040" }}>
      {/* Top row: Title + Edit button */}
      <div className="flex items-center justify-end mb-6">
       
        <button
          onClick={() => setEdit(true)}
          className="bg-[#19216f] text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-transform hover:scale-105"
        >
          <FaEdit className="inline mr-2" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
        <div className="flex flex-col items-center">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="
              rounded-full 
              object-cover 
              border-2 
              border-[#19216f] 
              mb-3
              w-32 h-32        /* Base size for small devices */
              sm:w-40 sm:h-40  /* Increase size on small+ screens */
              md:w-48 md:h-48  /* Increase size further on medium+ screens */
            "
          />
        ) : (
          <FaUserCircle 
            className="
              text-gray-300 
              mb-3 
              w-32 h-32 
              sm:w-40 sm:h-40 
              md:w-48 md:h-48
            " 
          />
        )}
        <h1 className="text-xl  text-black font-bold">
          {studentDetails?.name || "No Name"}
        </h1>
        <p className="text-black font-bold">
          ID: {studentDetails?.studentId || "N/A"}
        </p>
        
            </div>


        {/* Center: Personal Information */}
        <div className="space-y-4">
      {/* Heading with icon */}
      <div className="text-2xl font-bold text-[#19216f] flex items-center gap-2">
        <FaUserAlt className="text-[#19216f]" />
        <span>Personal Information</span>
      </div>

      {/* Table with Label : Value layout */}
      <table className="text-gray-700">
      <tbody>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Student ID</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.studentId || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Batch No</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.BatchNo || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Email ID</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.email || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Age</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.age || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">State</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.state || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Phone</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.studentPhNumber || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Github</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">
        {studentDetails?.githubLink ? (
          <a
            href={studentDetails.githubLink}
            className="text-blue-500 hover:underline"
          >
            {studentDetails.githubLink}
          </a>
        ) : (
          "N/A"
        )}
      </div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Skills</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">
        {studentDetails?.githubLink ? (
          <p
            className="text-black "
          >
            {studentDetails.studentSkills.join(',')}
          </p>
        ) : (
          "N/A"
        )}
      </div>
    </td>
  </tr>
  {/* Optional: Arrears fields */}
  {studentDetails?.arrears === "true" && (
    <tr>
      <td className="font-semibold pr-3">
        <div className="mb-2">Arrears</div>
      </td>
      <td className="pr-3">
        <div className="mb-2">:</div>
      </td>
      <td>
        <div className="mb-2">Yes</div>
      </td>
    </tr>
  )}
  {studentDetails?.arrears === "true" && (
    <tr>
      <td className="font-semibold pr-3">
        <div className="mb-2">Arrears Count</div>
      </td>
      <td className="pr-3">
        <div className="mb-2">:</div>
      </td>
      <td>
        <div className="mb-2">{studentDetails?.ArrearsCount || "N/A"}</div>
      </td>
    </tr>
    
  )}
</tbody>

      </table>
    </div>

        {/* Right: Academic Information */}
        <div className="space-y-4 text-gray-700">
      {/* Heading with icon */}
      <div className="text-2xl font-bold text-[#19216f] flex items-center gap-2">
        <FaGraduationCap className="text-[#19216f]" />
        <span>Academic Information</span>
      </div>

      {/* Table layout for label : value */}
      <table>
      <tbody>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">College</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.collegeName || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">USN</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.collegeUSNNumber || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Department</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.department || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Qualification</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.qualification || "N/A"}</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">10th Percentage</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.tenthStandard || "N/A"}%</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">12th Percentage</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.twelfthStandard || "N/A"}%</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Graduation %</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.highestGraduationpercentage || "N/A"}%</div>
    </td>
  </tr>
  <tr>
    <td className="font-semibold pr-3">
      <div className="mb-2">Passout Year</div>
    </td>
    <td className="pr-3">
      <div className="mb-2">:</div>
    </td>
    <td>
      <div className="mb-2">{studentDetails?.yearOfPassing || "N/A"}</div>
    </td>
  </tr>
</tbody>

      </table>
    </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl w-full mx-auto mt-6">
    <div className="bg-white shadow-md p-5 flex flex-col w-full">
  {/* Heading with icon */}
  <div className="flex items-center gap-2 mb-4">
    <FaFileUpload className="text-[#19216f] text-xl" />
    <h3 className="text-lg font-semibold text-[#19216f]">Upload Resume</h3>
  </div>

  {/* Form with file input and upload button */}
  <form onSubmit={updateResume} className="flex flex-col sm:flex-row gap-2">
    {/* File Input */}
    <input
      type="file"
      className="flex-1 text-sm text-gray-700 border border-gray-300 bg-gray-50 p-2 cursor-pointer"
      onChange={(e) => setFile(e.target.files[0])}
    />

    {/* Upload Button */}
    <button
      type="submit"
      disabled={updatingResume}
      className={`flex items-center justify-center gap-2 bg-[#19216f] text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-transform hover:scale-105 ${
        updatingResume ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <FaFileUpload />
      {updatingResume ? "Updating..." : "Upload"}
    </button>
  </form>
</div>

  <div className="lg:col-span-2 flex flex-col md:flex-row gap-0">
    {/* Card 2: Your Resume */}
    <div className="bg-white  shadow-md p-5 flex flex-col md:flex-row items-start md:items-center w-full md:w-2/3">
      {/* Icon + Title */}
      <div className="flex items-center gap-2">
        <FaFileAlt className="text-[#19216f] text-2xl" />
        <h3 className="text-lg font-semibold text-black">Your Resume</h3>
      </div>

      {/* Two outline buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0 sm:ml-6">
        <button
          onClick={() => setModalIsOpen(true)}
          disabled={!resumeUrl}
          className={`border border-[#19216f] text-[#19216f] font-semibold px-4 py-2 rounded-md 
            hover:bg-[#19216f] hover:text-white transition-transform hover:scale-105 
            ${resumeUrl ? "" : "opacity-50 cursor-not-allowed"}`}
        >
          View Resume
        </button>

        <button
          onClick={fetchResumeScore}
          className={`border border-[#19216f] text-[#19216f] font-semibold px-4 py-2 rounded-md 
            hover:bg-[#19216f] hover:text-white transition-transform hover:scale-105 
            ${scoreLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {scoreLoading ? "Fetching..." : "View Resume Score"}
        </button>
      </div>
    </div>

    {/* Card 3: ATS Resume Score */}
    <div className="bg-[#19216f] text-white  shadow-md p-5 flex flex-col items-center justify-center w-full md:w-1/3 md:rounded-l-none md:rounded-r-md">
      <span className="font-semibold text-2xl">ATS Resume Score</span>
      <span className="text-xl font-bold">
        {resumeScore !== null ? `${resumeScore}/100` : "Check Your resume Score"}
      </span>
    </div>
  </div>
</div>


      {/* =============== Resume Preview Modal =============== */}
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
    </div>
  );
}
