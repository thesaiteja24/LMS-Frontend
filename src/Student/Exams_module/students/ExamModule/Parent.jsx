import React, { useEffect, useContext, useRef } from "react";
import { ExamProvider, ExamContext } from "./ExamContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QNavigation from "./QNavigation";
import { ExamLegend } from "./ExamLegend";
import { DisplayMCQ } from "./DisplayMCQ";
import { DisplayCoding } from "./DisplayCoding";
import { NavigationMCq } from "./NavigationMCQ";
import { NavigationCoding } from "./NavigationCoding";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import { FaUserCircle } from "react-icons/fa";

const ExamContent = () => {
  const {
    selectedMCQ,
    codingQuestions,
    handleSubmit,
    studentName,
    studentExamId,
    totalScore,
    isSubmitting,
    examType,
  } = useContext(ExamContext);
  const { profilePicture } = useStudent();
  const navigate = useNavigate();
  const submitted = useRef(false); // Prevent multiple submissions

  // ✅ Safe submission function ensuring completion before navigation
  const safeSubmit = async () => {
    if (!submitted.current) {
      submitted.current = true;

      try {
        console.log("🔄 Auto-submitting exam... Fetching latest answers.");
        
        await new Promise((resolve) => setTimeout(resolve, 100)); // ⏳ Small delay to ensure state updates
        await handleSubmit(); // ✅ Ensure submission is completed before navigating
        
        console.log("✅ Exam successfully submitted. Navigating to Exam Dashboard.");
      } catch (error) {
        console.error("❌ Error during auto-submission:", error);
        toast.error("Exam submission failed! Please try again.");
        submitted.current = false; // Allow retry if submission fails
      }
    }
  };

  useEffect(() => {
    // ✅ Disable Right-Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warn("Right-click is disabled!");
    };
    document.addEventListener("contextmenu", handleContextMenu);
  
    // ✅ Disable Copy/Cut/Paste
    const handleCopy = (e) => {
      e.preventDefault();
      toast.warn("Copy is disabled!");
    };
    const handleCut = (e) => {
      e.preventDefault();
      toast.warn("Cut is disabled!");
    };
    const handlePaste = (e) => {
      e.preventDefault();
      toast.warn("Paste is disabled!");
    };
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
  
    // ✅ Block DevTools, Reload, and Auto-Submit on Escape Key
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "esc") {
        e.preventDefault();
        toast.error("Full screen exited or Escape pressed. Auto-submitting exam.");
        safeSubmit();
        return;
      }
  
      if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")) {
        e.preventDefault();
        toast.error("Reload is disabled during the exam!");
      }
  
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
        safeSubmit();
      }
  
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
        safeSubmit();
      }
  
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast.error("Screenshots are not allowed!");
      }
      if (e.metaKey && e.shiftKey) {
        e.preventDefault();
        toast.error("Screenshots are not allowed!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
  
    // ✅ Warn on Tab Switch / Visibility Change (Triggers Safe Submit)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("Tab switch detected. Auto-submitting exam.");
        safeSubmit();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    // ✅ Prevent Back Navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error("Navigating back is disabled!");
    };
    window.addEventListener("popstate", handlePopState);
  
    // ✅ Prevent Page Unload (Closing Tab, etc.)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    // ✅ Auto-Submit on Fullscreen Exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.error("Full screen mode exited. Auto-submitting exam.");
        safeSubmit();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  
    // ✅ Detect DevTools Opening Using Polling
    let devtoolsOpen = false;
    const threshold = 160; // Pixels difference to detect DevTools
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const isOpen = widthThreshold || heightThreshold;
  
      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        toast.error("DevTools are open! Auto-submitting exam.");
        safeSubmit();
      } else if (!isOpen && devtoolsOpen) {
        devtoolsOpen = false;
      }
    };
    const devtoolsInterval = setInterval(checkDevTools, 500);
  
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearInterval(devtoolsInterval);
    };
  }, [handleSubmit, navigate]);
  

  return (
    <div className="min-h-screen h-full parent bg-[#E1EFFF] flex flex-col justify-between overflow-hidden">
      <div>
        <div className="stuent-n-exam-details">
          <div className="flex flex-row justify-evenly">
            <div className="flex flex-row justify-evenly items-center test-details bg-white w-3/4 mt-2 ml-2 mr-0.5 MCQ_Stats rounded-2xl text-center p-0.5 text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
              <span>
                <img className="w-44" src="ExamModule/Logo.png" alt="" />
              </span>
              <span className="flex flex-row gap-4 items-center">
                <img src="ExamModule/Exam.png" alt="" /> <span>{examType}</span>
              </span>
              <span>
                <span className="text-[#19216F] font-semibold">Marks:</span>
                <span>{totalScore}</span>
              </span>
            </div>
            <div className="p-2 student-details flex flex-row justify-evenly items-center bg-white w-full mt-2 mr-2 ml-0.5 MCQ_Stats rounded-2xl text-center text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 "
                />
              ) : (
                <FaUserCircle className="w-20 bg-gray-100 rounded-full flex items-center justify-center text-blue-500 text-5xl" />
              )}
              <div className="flex flex-col justify-start items-start">
                <div>{studentName}</div>
                <div className="text-sm">
                  <b>Exam Id: &nbsp;</b>
                  {studentExamId}
                </div>
              </div>
              <div className="flex flex-row gap-4 justify-evenly items-center answered">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting} // disable button when submitting
                  className={`text-white w-48 h-12 rounded-lg font-normal text-xl ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed" // styling when disabled
                      : "bg-[#ED1334]"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Test"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mcq-n-coding-section flex flex-col h-full mt-2">
          {!selectedMCQ && codingQuestions.length > 0 ? (
            <div className="flex flex-row gap-2">
              <DisplayCoding />
              <NavigationCoding />
            </div>
          ) : (
            <div className="flex flex-row gap-2">
              <DisplayMCQ />
              <NavigationMCq />
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="nav-n-legend flex flex-col items-center px-2">
          <QNavigation />
          <ExamLegend />
        </div>
      </div>
    </div>
  );
};

export const Parent = () => {
  return (
    <ExamProvider>
      <ExamContent />
    </ExamProvider>
  );
};

export default Parent;
