import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import Alert from "../Alert";
import { Loader } from "lucide-react";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import { useNavigate } from "react-router-dom";
import { ExamContext } from "./ExamContext";
import ExamCountdownTimer from "./ExamCountDownTimer";
import InstructionsModal from "./InstructionsModal"; // <-- Import Modal
import { decryptData } from "../../../../../cryptoUtils.jsx";

// Import images (adjust the relative path as needed)
import examBlue from "../../../../../public/ExamModule/Exam-blue.png";
import dateIcon from "../../../../../public/ExamModule/Date.png";
import watchIcon from "../../../../../public/ExamModule/Watch.png";
import sandClockIcon from "../../../../../public/ExamModule/Sand-clock.png";
import examCompletedIcon from "../../../../../public/ExamModule/Exam-Completed.png";

const ExamDashboard = () => {
  const { setExamData } = useContext(ExamContext);
  const { studentDetails, loading: studentLoading } = useStudent();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // When user clicks "Start Exam," we need to store the exam data and show the modal
  const [selectedExam, setSelectedExam] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const location = decryptData(localStorage.getItem("location"));
  const studentId = decryptData(localStorage.getItem("student_id"));
  const Id = decryptData(localStorage.getItem("id"));
  const batch = studentDetails?.BatchNo;
  const navigate = useNavigate();

  // 1. Fetch all available exams for the given batch/location using the new response structure
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/get-available-exams?studentId=${Id}`
        );
        // Expect exams under the "Daily-Exam" key
        if (
          response.data.success &&
          response.data.exams &&
          response.data.exams["Daily-Exam"]
        ) {
          setExams(response.data.exams["Daily-Exam"]);
        } else {
          setError(response.data.message || "No exams found.");
        }
      } catch (err) {
        setError("No exams found");
      } finally {
        setLoading(false);
      }
    };

    if (batch && location) {
      fetchExams();
    }
  }, [batch, location, Id]);

  // 2. Categorize exams as active, upcoming, or finished using the exam's startDate, startTime, and totalExamTime
  const categorizeExams = () => {
    const now = new Date();
    const active = [];
    const upcoming = [];
    const finished = [];

    exams.forEach((exam) => {
      const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
      const examEnd = new Date(
        examStart.getTime() + exam.totalExamTime * 60000
      );

      if (now >= examStart && now <= examEnd) {
        active.push(exam);
      } else if (now < examStart) {
        upcoming.push(exam);
      } else {
        finished.push(exam);
      }
    });

    return { active, upcoming, finished };
  };

  const { active, upcoming, finished } = categorizeExams();

  // 3. Show the instructions modal before starting the exam
  const handleShowInstructions = (exam) => {
    setSelectedExam(exam);
    console.log(exam);
    setShowInstructions(true);
  };

  // 4. After agreeing to the instructions, start the exam
  const handleStartExam = async () => {
    if (!selectedExam) return;

    const examId = selectedExam.examId;
    const collectionName = selectedExam["examName"]
      .split("-")
      .slice(0, -1)
      .join("-");
    console.log(examId, collectionName);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/startexam`,
        { examId, collectionName }
      );

      if (response.data.success) {
        console.log(response);
        localStorage.setItem("examData", JSON.stringify(response.data));
        setExamData(response.data);
        navigate("/conduct-exam");
      } else {
        console.error("Failed to start exam:", response.data.message);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
    }
  };

  // Loading and error states
  if (loading || studentLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-3xl text-center">
        <Alert>{error}</Alert>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center text-3xl">
        <Alert>No exams found</Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-[49px]">
      {/* ==================== ACTIVE EXAMS ==================== */}
      {active.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#19216F] mb-3 flex flex-row items-center gap-2 text-xl ">
            <img className="w-8" src={examBlue} alt="Exam Icon" />
            Active Exams
          </h3>
          <div className="flex flex-row ">
            {active.map((exam) => (
              <Card
                key={exam["examId"]}
                className="cursor-pointer hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>Exam: {exam["examName"]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3 p-7 bg-white shadow-md rounded-lg">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <img src={dateIcon} alt="Date" className="w-5 h-5" />
                          <strong className="text-gray-700">Start Date</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={watchIcon}
                            alt="Clock"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Time</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={sandClockIcon}
                            alt="Duration"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">
                            Total Duration
                          </strong>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="text-gray-600">
                          : {exam.startDate}
                        </span>
                        <span className="text-gray-600">
                          : {exam.startTime}
                        </span>
                        <span className="text-gray-600">
                          : {exam.totalExamTime} mins
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShowInstructions(exam)}
                      disabled={exam["attempt-status"]}
                      className={`focus:outline-none text-white font-semibold text-xl rounded-lg px-5 py-2.5
                        ${
                          exam["attempt-status"]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#19216F] hover:bg-[#0f22b4]"
                        }
                      `}
                    >
                      {exam["attempt-status"]
                        ? "Already Attempted"
                        : "Start Exam"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==================== UPCOMING EXAMS ==================== */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#19216F] mb-3 flex flex-row items-center gap-2 text-xl ">
            <img className="w-8" src={examBlue} alt="Exam Icon" />
            Upcoming Exams
          </h3>
          <div className="flex flex-row gap-8">
            {upcoming.map((exam) => (
              <Card key={exam["examId"]}>
                <CardHeader>
                  <CardTitle>Exam: {exam["examName"]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3 p-7 bg-white shadow-md rounded-lg">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                          <img src={dateIcon} alt="Date" className="w-5 h-5" />
                          <strong className="text-gray-700">Start Date</strong>
                        </div>
                        <div className="flex gap-2">
                          <img
                            src={watchIcon}
                            alt="Clock"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Time</strong>
                        </div>
                        <div className="flex gap-2">
                          <img
                            src={sandClockIcon}
                            alt="Duration"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">
                            Total Duration
                          </strong>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="text-gray-600">
                          : {exam.startDate}
                        </span>
                        <span className="text-gray-600">
                          : {exam.startTime}
                        </span>
                        <span className="text-gray-600">
                          : {exam.totalExamTime} mins
                        </span>
                      </div>
                    </div>
                    <ExamCountdownTimer
                      startDate={exam.startDate}
                      startTime={exam.startTime}
                      totalExamTime={exam.totalExamTime}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==================== FINISHED EXAMS ==================== */}
      {finished.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#19216F] mb-3 flex flex-row items-center gap-2 text-xl ">
            <img className="w-8" src={examBlue} alt="Exam Icon" />
            Finished Exams
          </h3>
          <div className="flex flex-row gap-8">
            {finished.map((exam) => (
              <Card key={exam["examId"]}>
                <CardHeader>
                  <CardTitle>Exam: {exam["examName"]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3 p-7 bg-white shadow-md rounded-lg">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <img src={dateIcon} alt="Date" className="w-5 h-5" />
                          <strong className="text-gray-700">Start Date</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={watchIcon}
                            alt="Clock"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Time</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={sandClockIcon}
                            alt="Duration"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">
                            Total Duration
                          </strong>
                        </div>
                        <p className="text-red-600 font-semibold text-center mt-2 text-xl">
                          Exam Completed
                        </p>
                      </div>
                      <div className="flex flex-col justify-center gap-4">
                        <span className="text-gray-600">
                          : {exam.startDate}
                        </span>
                        <span className="text-gray-600">
                          : {exam.startTime}
                        </span>
                        <span className="text-gray-600">
                          : {exam.totalExamTime} mins
                        </span>
                        <img
                          src={examCompletedIcon}
                          alt="Completed"
                          className="w-10 h-8 ml-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==================== INSTRUCTIONS MODAL ==================== */}
      {showInstructions && (
        <InstructionsModal
          onClose={() => setShowInstructions(false)}
          onAgree={handleStartExam}
        />
      )}
    </div>
  );
};

export default ExamDashboard;
