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

const ExamDashboard = () => {
  const { setExamData } = useContext(ExamContext);
  const { studentDetails, loading: studentLoading } = useStudent();

  const [exams, setExams] = useState([]);
  // Keep track of completed exam IDs (use a Set for quick lookup)
  const [completedExams, setCompletedExams] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");

  // When user clicks "Start Exam," we need to store the exam data and show the modal
  const [selectedExam, setSelectedExam] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // These values might come from localStorage or your context
  const location = localStorage.getItem("location");
  const studentId = localStorage.getItem("student_id");
  const batch = studentDetails?.BatchNo;
  const navigate = useNavigate();

  // 1. Fetch all available exams for the given batch/location
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/get-available-exams?batch=${batch}&location=${location}`
        );
        if (response.data.success) {
          setExams(response.data.exams);
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
  }, [batch, location]);

  // 2. Fetch the user’s exam status to mark which exam(s) have been completed
  useEffect(() => {
    const fetchExamStatus = async () => {
      try {
        setStatusLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/exam-status?studentId=${studentId}&batch=${batch}&location=${location}`
        );
        if (response.data.success && response.data.completedExamIds) {
          setCompletedExams(new Set(response.data.completedExamIds));
        }
      } catch (err) {
        console.error("Error fetching exam status:", err);
      } finally {
        setStatusLoading(false);
      }
    };

    if (studentId && batch && location) {
      fetchExamStatus();
    }
  }, [studentId, batch, location]);

  // 3. Categorize exams as active, upcoming, or finished
  const categorizeExams = () => {
    const now = new Date();
    const active = [];
    const upcoming = [];
    const finished = [];

    exams.forEach((exam) => {
      // Convert the exam date/time to a JS Date object
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

  // 4. Show the instructions modal before starting the exam
  const handleShowInstructions = (exam) => {
    setSelectedExam(exam);
    setShowInstructions(true);
  };

  // 5. After agreeing to the instructions, start the exam
  const handleStartExam = async () => {
    if (!selectedExam) return;
    const { examId, type, dayOrder } = selectedExam;

    try {
      // Request fullscreen mode for the exam
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // Hit your "start exam" endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/startexam`,
        { examId, batch, studentId, location, type, dayOrder }
      );

      if (response.data.success) {
        // Save exam data to local storage/context
        localStorage.setItem("examData", JSON.stringify(response.data));
        setExamData(response.data);

        // Navigate user to the exam page
        navigate("/conduct-exam");
      } else {
        console.error("Failed to start exam:", response.data.message);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
    }
  };

  // Loading states
  if (loading || studentLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-3xl text-center">
        <Alert>{error}</Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col m-4">
      {/* ==================== ACTIVE EXAMS ==================== */}
      {active.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#132EE0] mb-3 flex flex-row items-center gap-2 text-xl border-b">
            <img className="w-8" src="ExamModule/Exam-blue.png" alt="" />
            Active Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {active.map((exam) => (
              <Card
                key={exam.examId}
                className="cursor-pointer hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>Batch: {exam.batch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3 p-4 bg-white shadow-md rounded-lg">
                    <div className="flex flex-row justify-between">
                      <strong>Start Date:</strong>
                      <span>{exam.startDate}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <strong>Start Time:</strong>
                      <span>{exam.startTime}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <strong>Duration:</strong>
                      <span>{exam.totalExamTime} mins</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShowInstructions(exam)}
                      disabled={completedExams.has(exam.examId)}
                      className={`focus:outline-none text-white font-semibold text-xl rounded-lg px-5 py-2.5
                        ${
                          completedExams.has(exam.examId)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#132EE0] hover:bg-[#0f22b4]"
                        }
                      `}
                    >
                      {completedExams.has(exam.examId)
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
          <h3 className="font-semibold text-[#132EE0] mb-3 flex flex-row items-center gap-2 text-xl border-b">
            <img className="w-8" src="ExamModule/Exam-blue.png" alt="" />
            Upcoming Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {upcoming.map((exam) => (
              <Card key={exam.examId}>
                <CardHeader>
                  <CardTitle>Batch: {exam.batch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3 p-4 bg-white shadow-md rounded-lg">
                    <div className="flex flex-row justify-between">
                      <strong>Start Date:</strong>
                      <span>{exam.startDate}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <strong>Start Time:</strong>
                      <span>{exam.startTime}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <strong>Duration:</strong>
                      <span>{exam.totalExamTime} mins</span>
                    </div>
                    {/* Countdown for upcoming exam */}
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
          <h3 className="font-semibold text-[#132EE0] mb-3 flex flex-row items-center gap-2 text-xl border-b">
            <img className="w-8" src="ExamModule/Exam-blue.png" alt="" />
            Finished Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {finished.map((exam) => (
              <Card key={exam.examId}>
                <CardHeader>
                  <CardTitle>Batch: {exam.batch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3 p-4 bg-white shadow-md rounded-lg">
                    <div className="flex flex-row justify-between">
                      <strong>Start Date:</strong>
                      <span>{exam.startDate}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <strong>Start Time:</strong>
                      <span>{exam.startTime}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <strong>Duration:</strong>
                      <span>{exam.totalExamTime} mins</span>
                    </div>
                    <p className="text-red-600 font-semibold text-center mt-2 text-xl">
                      Exam Completed
                    </p>
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
