import React, { useEffect, useContext } from "react";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ExamContext } from "./ExamModule/ExamContext";
import { useNavigate } from "react-router-dom";

const ExamSecurityWrapper = ({ children }) => {
  const { handleSubmit } = useContext(ExamContext);
  const navigate = useNavigate();

  useEffect(() => {
    // --- Kiosk-like Fullscreen Behavior ---
    // Function to request fullscreen across all major browsers/OS
    const requestFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err) =>
          toast.error("Error entering fullscreen: " + err.message)
        );
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    };

    // Immediately request fullscreen mode
    requestFullscreen();

    // Re-enter fullscreen if the user exits it
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        toast.warn("Exiting fullscreen is not allowed. Re-entering kiosk mode.");
        requestFullscreen();
      }
    };

    // Listen for fullscreen changes (vendor prefixes added for cross-browser support)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // --- Basic Deterrents (Same as before) ---

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

    // 3) Block DevTools, Reload, and Screenshot Attempts
    const handleKeyDown = (e) => {
      // Block reload: F5, Ctrl+R, or Cmd+R
      if (
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        toast.error("Reload is disabled during the exam!");
      }
      // Prevent exiting fullscreen with Escape key
      if (e.key === "Escape") {
        e.preventDefault();
        toast.error("Exiting fullscreen is not allowed!");
        requestFullscreen();
      }
      // Block DevTools: F12, Ctrl+Shift+I/J, or Cmd+Shift+I/J
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["i", "j"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
      }
      // Block additional combinations (Cmd+Option+I / Ctrl+Alt+I)
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
      }
      // Block PrintScreen key (common on Windows)
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast.error("Screenshots are not allowed!");
      }
      // Block common Mac screenshot shortcuts (Cmd+Shift+3/5)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "5")) {
        e.preventDefault();
        toast.error("Screenshots are not allowed!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // 4) Warn on Tab Switch / Visibility Change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        let warnCount = parseInt(localStorage.getItem("warnCount") || "0", 10);
        warnCount++;
        localStorage.setItem("warnCount", warnCount);
        if (warnCount < 3) {
          toast.error(
            `Warning: You switched tabs ${warnCount} time${warnCount > 1 ? "s" : ""}!`
          );
        } else {
          toast.error(
            "You have switched tabs too many times. Your exam will now be submitted."
          );
          handleSubmit();
          navigate("/exam-dashboard");
        }
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

    return () => {
      // Remove fullscreen listeners
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);

      // Remove other event listeners
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleSubmit, navigate]);

  return (
    <>
      
      {children}
    </>
  );
};

export default ExamSecurityWrapper;
