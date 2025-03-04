import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProgramManagerSignup from "./Signup/ProgramManagerSignup/ProgramManagerSignup.jsx";
import StudentSearch from "./StudentSearch/StudentSearch.jsx";
import NotFound from "./NotFound.jsx";
import Home from "./Home/Home.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import StudentLogin from "./Login/StudentLogin.jsx";
import Admin from "./Login/Admin.jsx";
import AddJob from "./AddJob/AddJob.jsx";
import BDEDashboard from "./BDEDashboard/BDEDashboard.jsx";
import JobsList from "./JobsList/JobsList.jsx";
import StudentsApplied from "./StudentsApplied/StudentsApplied.jsx";
import BDEStudentsAppliedJobsList from "./BDEStudentsAppliedJobsList/BDEStudentsAppliedJobsList.jsx";
import StudentsList from "./StudentsList/StudentsList.jsx";
import EmailApplyJob from "./EmailApplyJob/EmailApplyJob.jsx";
import ForgotPassword from "./ForgotPassword/ForgotPassword.jsx";
import { SidebarV } from "./Student/SidebarV.jsx";
import StudentProfileUpdateVV from "./StudentProfileUpdate/StudentProfileUpdateVV.jsx";
import Bdemanagement from "./Admin/Bdemanagement.jsx";
import ProgramManagement from "./Admin/ProgramManagement.jsx";
import StudentAttendanceData from "./programManager/StudentAttendanceData.jsx";
import MentorManagement from "./Admin/MentorManagement.jsx";
import Reports from "./Admin/Reports.jsx";
import AtsUpload from "./Ats/AtsUpload.jsx";
import AtsResult from "./Ats/AtsResult.jsx";
import AttendanceSystem from "./Mentor/AttendanceSystem.jsx";
import CompilerHome from "./Compiler/CompilerHome.jsx";
import MockInterviewHome from "./MockInterview/MockInterviewHome.jsx";
import CurriculumManagement from "./programManager/CurriculumManagement.jsx";
import Course from "./Mentor/Course.jsx";
import AttendanceTable from "./Mentor/AttendanceTable.jsx";
import MainReport from "./SuperAdmin/AttendanceReport/MainReport.jsx";
import StudentCurriculum from "./Curriculam/StudentCurriculum.jsx";
import ManageStudentsList from "./programManager/ManageStudentsList.jsx";
import MentorStudentData from "./Mentor/MentorStudentData.jsx";
import BatchScheduler from "./programManager/BatchScheduler.jsx";
import BatchForm from "./programManager/BatchForm.jsx";
import StudentDashboard from "./StudentProfile/StudentDashboard.jsx";
import ViewBatch from "./programManager/ViewBatch.jsx";
import MentorDashboard from "./Mentor/MentorDashboard.jsx";
import ProgramManagerDashboard from "./programManager/ProgramManagerDashboard.jsx";
import LeaveRequest from "./programManager/LeaveRequest.jsx";
import LiveClasses from "./programManager/LiveClasses.jsx";
import InstructorCompletion from "./programManager/InstructorCompletion.jsx";
import StudentLocationWise from "./programManager/StudentLocationWise.jsx";
import LeaveRequestPage from "./StudentProfile/LeaveRequestPage.jsx";
import MentorExamDashboard from "./Mentor/MentorExamDashboard.jsx";
import ExamDashboard from "./Student/Exams_module/students/ExamModule/ExamDashboard.jsx";
import MentorBatches from "./Mentor/MentorBatches.jsx";
import LogoWrapper from "./Mentor/LogoWrapper.jsx";
import EnquiryForm from "./RequestForm/EnquiryForm.jsx";
import SubjectDetails from "./Curriculam/SubjectDetails.jsx";
import { ManagerExamDashboard } from "./programManager/Exams/ManagerExamDashboard.jsx";
import { SetExam } from "./programManager/Exams/SetExam.jsx";
import ExamSecurityWrapper from "./Student/Exams_module/students/ExamModule/ExamSecurityWrapper.jsx";
import { ExamAnalysis } from "./Student/Exams_module/students/ExamAnalysis/ExamAnalysis";
import { DailyQuestionBank } from "./Mentor/ManageExams/QuestionBanks/DailyQuestionBank.jsx";
import UploadQuestions from "./Mentor/ManageExams/UploadQuestions.jsx";
import { Parent } from "./Student/Exams_module/students/ExamModule/Parent.jsx";
import { useLocation } from "react-router-dom";
import { ExamProvider } from "./Student/Exams_module/students/ExamModule/ExamContext.jsx";
import { ToastContainer } from "react-toastify";
import { Dashboard } from "./programManager/Performance/Dashboard.jsx";
import DailyPerformance from "./programManager/Performance/DailyPerformance.jsx";
import { classNames } from "@react-pdf-viewer/core";
import { ExamReportsDashboard } from "./Student/ExamReportsDashboard.jsx";
import CodePlayground from "./Student/Codeplayground.jsx";
import { decryptData } from '../cryptoUtils.jsx';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const userType = decryptData(localStorage.getItem("userType"));

  if (!userType) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!decryptData(localStorage.getItem("userType"))
  );
  // const navigate = useNavigate();

  useEffect(() => {
    // Listen for changes in localStorage
    const checkAuth = () => {
      setIsAuthenticated(!!decryptData(localStorage.getItem("userType")));
    };

    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const Location = ({ children }) => {
    const location = useLocation();
    const hideHeader = location.pathname == "/conduct-exam";
    return (
      <div>
        {!hideHeader && <SidebarV setIsAuthenticated={setIsAuthenticated} />}
      </div>
    );
  };

  return (
    <div
      style={{ overflow: "auto", height: "100vh", backgroundColor: "#f4f4f4" }}
      className="no-scrollbar"
    >
      <Location />
      <ScrollToTop />
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
      <div>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    {
                      student_login_details: "/student-profile",
                      Mentors: "/mentor-dashboard",
                      BDE_data: "/jobs-dashboard",
                      Manager: "/manager-dashboard",
                      superAdmin: "/admin-dashboard",
                      super: "/admin-dashboard",
                    }[decryptData(localStorage.getItem("userType"))] || "/not-found"
                  }
                  replace
                />
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    {
                      student_login_details: "/student-profile",
                      Mentors: "/mentor-dashboard",
                      BDE_data: "/jobs-dashboard",
                      Manager: "/manager-dashboard",
                      superAdmin: "/admin-dashboard",
                      super: "/admin-dashboard",
                    }[decryptData(localStorage.getItem("userType"))] || "/not-found"
                  }
                  replace
                />
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    {
                      student_login_details: "/student-profile",
                      Mentors: "/mentor-dashboard",
                      BDE_data: "/jobs-dashboard",
                      Manager: "/manager-dashboard",
                      superAdmin: "/admin-dashboard",
                      super: "/admin-dashboard",
                    }[decryptData(localStorage.getItem("userType"))] || "/not-found"
                  }
                  replace
                />
              ) : (
                <StudentLogin setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />

          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    {
                      student_login_details: "/student-profile",
                      Mentors: "/mentor-dashboard",
                      BDE_data: "/jobs-dashboard",
                      Manager: "/manager-dashboard",
                      superAdmin: "/reports",
                      super: "/admin-dashboard",
                    }[decryptData(localStorage.getItem("userType"))] || "/not-found"
                  }
                  replace
                />
              ) : (
                <Admin />
              )
            }
          />

          <Route
            path="/forgotPassword"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    {
                      student_login_details: "/student-profile",
                      Mentors: "/mentor-dashboard",
                      BDE_data: "/jobs-dashboard",
                      Manager: "/manager-dashboard",
                      superAdmin: "/reports",
                      super: "/admin-dashboard",
                    }[decryptData(localStorage.getItem("userType"))] || "/not-found"
                  }
                  replace
                />
              ) : (
                <ForgotPassword />
              )
            }
          />

          {/* <Route path="/login" element={<StudentLogin />} />
          <Route path="/superadmin" element={<SuperAdmin />} /> */}

          {/* <Route path='/forgotPassword' element={<ForgotPassword/>}/> */}
          {/* <Route path='/bdeforgotPassword' element={<BdeForgotPassword/>}/> */}
          <Route path="/request-form" element={<EnquiryForm />} />

          <Route
            path="/addjob"
            element={
              <ProtectedRoute allowedRoles={["BDE_data", "company", "Manager"]}>
                <AddJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <ProgramManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-request"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <LeaveRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/live-classes"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <LiveClasses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course-completion"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <InstructorCompletion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/studentsearch"
            element={
              <ProtectedRoute allowedRoles={["super", "superAdmin"]}>
                <StudentSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studentdata"
            element={
              <ProtectedRoute allowedRoles={["Manager", "BDE_data", "Mentors"]}>
                <StudentLocationWise />
              </ProtectedRoute>
            }
          />

          <Route
            path="/set-exam"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <SetExam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bdes"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "admin"]}>
                <Bdemanagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentors"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "admin"]}>
                <MentorManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <AttendanceSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <Course />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-batches"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <MentorBatches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendancedata"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <AttendanceTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/studentattendance"
            element={
              <ProtectedRoute
                allowedRoles={["Manager", "BDE_data", "super", "superAdmin"]}
              >
                <StudentAttendanceData />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-enroll"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "Manager", "admin"]}>
                <ProgramManagerSignup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curriculum"
            element={
              <ProtectedRoute allowedRoles={["super", "superAdmin"]}>
                <CurriculumManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/program-managers"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "admin"]}>
                <ProgramManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "admin", "super"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance-report"
            element={
              <ProtectedRoute allowedRoles={["super", "superAdmin"]}>
                <MainReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "BDE_data",
                  "company",
                  "Manager",
                  "super",
                  "superAdmin",
                ]}
              >
                <BDEDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobslist"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <JobsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <StudentCurriculum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject/:subjectName"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <SubjectDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-request-page"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <LeaveRequestPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <ExamProvider>
                  <ExamDashboard />
                </ExamProvider>
              </ProtectedRoute>
            }
          />
           <Route
            path="/codeplayground"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <CodePlayground />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conduct-exam"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <ExamProvider>
                  <ExamSecurityWrapper>
                    <Parent />
                  </ExamSecurityWrapper>
                </ExamProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam-analysis"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <LogoWrapper>
                  <ExamAnalysis />
                </LogoWrapper>
              </ProtectedRoute>
            }
          />

          {/* end student online exams scheduling */}

          <Route
            path="/compiler"
            element={
              <ProtectedRoute
                allowedRoles={["student_login_details", "Mentors", "super"]}
              >
                <CompilerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interviews"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <MockInterviewHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam-reports-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <ExamReportsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studentsapplied"
            element={
              <ProtectedRoute
                allowedRoles={["company", "BDE_data", "Manager", "super"]}
              >
                <StudentsApplied />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bdestudentsappliedjoblist/:jobId"
            element={
              <ProtectedRoute
                allowedRoles={["BDE_data", "Manager", "super", "superAdmin"]}
              >
                <BDEStudentsAppliedJobsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managestudentslist"
            element={
              <ProtectedRoute allowedRoles={["Manager", "BDE_data"]}>
                <ManageStudentsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentorstudentslist"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <MentorStudentData />
              </ProtectedRoute>
            }
          />

          {/* mentor online exams scheduling */}

          <Route
            path="/mentor-exam-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <MentorExamDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-questions"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <LogoWrapper>
                  <UploadQuestions />
                </LogoWrapper>
              </ProtectedRoute>
            }
          />

          {/* Exam Creating Routes */}
          <Route
            path="/daily-exams"
            element={
              <ProtectedRoute allowedRoles={["Mentors"]}>
                <LogoWrapper>
                  <DailyQuestionBank />
                </LogoWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/batchschedule"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <BatchScheduler />
              </ProtectedRoute>
            }
          />

          <Route
            path="/createbatch"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <BatchForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-exam"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <ManagerExamDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students-performance"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students-performance/daily"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <DailyPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewbatch"
            element={
              <ProtectedRoute allowedRoles={["Manager", "super", "superAdmin"]}>
                <ViewBatch />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={['student_login_details']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/online-exams"
            element={
              <ProtectedRoute allowedRoles={['student_login_details']}>
                <StudentDailyExam />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <StudentProfileUpdateVV />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ats-upload"
            element={
              <ProtectedRoute allowedRoles={["student_login_details", "super"]}>
                <AtsUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ats-result"
            element={
              <ProtectedRoute allowedRoles={["student_login_details", "super"]}>
                <AtsResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studentslist"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "BDE_data",
                  "Manager",
                  "Mentors",
                  "super",
                  "superAdmin",
                ]}
              >
                <StudentsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/directapply/:student_id/:job_id"
            element={
              <ProtectedRoute allowedRoles={["student_login_details"]}>
                <EmailApplyJob />
              </ProtectedRoute>
            }
          />

          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
