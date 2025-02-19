import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import Alert from "../Alert";
import { Loader } from "lucide-react";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import { useNavigate } from "react-router-dom";
import { ExamContext } from "./ExamContext";
import ExamCountdownTimer from "./ExamCountDownTimer";

const ExamDashboard = () => {
  const { setExamData } = useContext(ExamContext);
  const { studentDetails, loading: studentLoading } = useStudent();

  const [exams, setExams] = useState([]);
  // Use a Set to track exam IDs that are already completed
  const [completedExams, setCompletedExams] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");

  // Assume these values are stored in localStorage or provided via context
  const location = localStorage.getItem("location");
  const studentId = localStorage.getItem("student_id");
  const batch = studentDetails?.BatchNo;
  const navigate = useNavigate();

  // 1. Fetch available exams from the backend
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

  // 2. Fetch exam status (completed exam IDs) from the backend
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
        console.error("Error fetching exam status", err);
      } finally {
        setStatusLoading(false);
      }
    };

    if (studentId && batch && location) {
      fetchExamStatus();
    }
  }, [studentId, batch, location]);

  // 3. Categorize exams based on current time
  const categorizeExams = () => {
    const now = new Date();
    const active = [];
    const upcoming = [];
    const finished = [];

    exams.forEach((exam) => {
      // Assume exam.startDate is in "YYYY-MM-DD" format and exam.startTime is in "HH:MM"
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

  // 4. Tracking effect to reload the page if an exam's time window changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let shouldReload = false;

      // Check if any upcoming exam has started
      for (const exam of upcoming) {
        const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
        if (now >= examStart) {
          shouldReload = true;
          break;
        }
      }

      // Check if any active exam has ended
      if (!shouldReload) {
        for (const exam of active) {
          const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
          const examEnd = new Date(
            examStart.getTime() + exam.totalExamTime * 60000
          );
          if (now >= examEnd) {
            shouldReload = true;
            break;
          }
        }
      }

      if (shouldReload) {
        clearInterval(interval);
        // This will reload the entire /exam-dashboard page
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [active, upcoming]);

  // 5. Handler to start the exam – requests fullscreen and calls your start exam API
  const handleStartExam = async (examId, type) => {
    console.log(type);
    try {
      // Request fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // Call the start exam API
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/startexam`,
        { examId, batch, studentId, location, type }
      );

      if (response.data.success) {
        localStorage.setItem("examData", JSON.stringify(response.data));
        setExamData(response.data);
        navigate("/conduct-exam");
      } else {
        console.error("Failed to start exam.");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
    }
  };

  if (loading || studentLoading || statusLoading) {
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

  window.addEventListener("popstate", () => {
    window.location.reload();
  });

  return (
    <div className="flex flex-col m-4">
      <div className="h-full">
        {/* Active Exams Section */}
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
                      <div className="flex flex-row justify-evenly">
                        <div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Date.png"
                              alt="Date"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Start Date
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Watch.png"
                              alt="Clock"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Start Time
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Sand-clock.png"
                              alt="Duration"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Total Duration
                            </strong>
                          </div>
                        </div>
                        <div className="flex flex-col">
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
                        onClick={() => handleStartExam(exam.examId, exam.type)}
                        disabled={completedExams.has(exam.examId)}
                        className={`focus:outline-none text-white font-semibold text-xl rounded-lg px-5 py-2.5 me-2 mb-2 ${
                          completedExams.has(exam.examId)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#132EE0]"
                        }`}
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
      </div>
      <div className="h-full">
        {/* Upcoming Exams Section */}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#132EE0] mb-3 flex flex-row items-center gap-2 text-xl border-b">
              <img className="w-8" src="ExamModule/Exam-blue.png" alt="" />
              Upcoming Exams
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {upcoming.map((exam) => (
                <Card key={exam.examId}>
                  <CardHeader>
                    <CardTitle>Batch: {exam.batch}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-3 p-4 bg-white shadow-md rounded-lg">
                      <div className="flex flex-row justify-evenly">
                        <div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Date.png"
                              alt="Date"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Start Date
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Watch.png"
                              alt="Clock"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Start Time
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Sand-clock.png"
                              alt="Duration"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Total Duration
                            </strong>
                          </div>
                        </div>
                        <div className="flex flex-col">
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
      </div>
      <div className="h-full">
        {/* Finished Exams Section */}
        {finished.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#132EE0] mb-3 flex flex-row items-center gap-2 text-xl border-b">
              <img className="w-8" src="ExamModule/Exam-blue.png" alt="" />
              Finished Exams
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {finished.map((exam) => (
                <Card key={exam.examId}>
                  <CardHeader>
                    <CardTitle>Batch: {exam.batch}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-3 p-4 bg-white shadow-md rounded-lg">
                      <div className="flex flex-row justify-evenly">
                        <div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Date.png"
                              alt="Date"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Start Date
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Watch.png"
                              alt="Clock"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Start Time
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src="ExamModule/Sand-clock.png"
                              alt="Duration"
                              className="w-5 h-5"
                            />
                            <strong className="text-gray-700">
                              Total Duration
                            </strong>
                          </div>
                        </div>
                        <div className="flex flex-col">
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
      </div>
    </div>
  );
};

export default ExamDashboard;
