import React, { useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ExamContext } from "./ExamContext";
import { useNavigate } from "react-router-dom";

const ExamSecurityWrapper = ({ children }) => {
  const { handleSubmit } = useContext(ExamContext);
  const navigate = useNavigate();
  // Use a ref to keep track if the exam is already submitted
  const submitted = useRef(false);

  // Helper function to safely submit only once
  const safeSubmit = () => {
    if (!submitted.current) {
      submitted.current = true;
      handleSubmit();
      navigate("/exam-dashboard");
    }
  };

  useEffect(() => {
    // 1) Disable Right-Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warn("Right-click is disabled!");
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2) Disable Copy/Cut/Paste
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

    // 3) Block DevTools, Reload, and auto submit on Escape key
    const handleKeyDown = (e) => {
      // Auto submit on Escape key press (or "Esc")
      if (e.key === "Escape" || e.key.toLowerCase() === "esc") {
        e.preventDefault();
        toast.error(
          "Full screen exited or Escape pressed. Exam will be submitted."
        );
        safeSubmit();
        return;
      }

      // Block reload: F5 or Ctrl/Cmd + R
      if (
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        toast.error("Reload is disabled during the exam!");
      }

      // Block DevTools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Cmd+Shift+I/J
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["i", "j"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
      }

      // Also block Cmd+Option+I or Ctrl+Alt+I
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
      }

      // Block screenshots (Windows PrintScreen and Mac shortcuts)
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

    // 4) Warn on Tab Switch / Visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        safeSubmit();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5) Prevent back navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error("Navigating back is disabled!");
    };
    window.addEventListener("popstate", handlePopState);

    // 6) Prevent page unload (closing tab, etc.)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 7) Auto submit when exiting fullscreen mode
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.error("Full screen mode exited. Exam will be submitted.");
        safeSubmit();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // 8) Check if DevTools is already open using a polling method
    let devtoolsOpen = false;
    const threshold = 160; // pixels difference to detect DevTools
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;
      const isOpen = widthThreshold || heightThreshold;
      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        toast.error("DevTools are open! Exam will be submitted.");
        // Optionally, you can submit here by calling safeSubmit();
        // safeSubmit();
      } else if (!isOpen && devtoolsOpen) {
        devtoolsOpen = false;
      }
    };
    const intervalId = setInterval(checkDevTools, 500);

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

      clearInterval(intervalId);
    };
  }, [handleSubmit, navigate]);

  return <>{children}</>;
};

export default ExamSecurityWrapper;
