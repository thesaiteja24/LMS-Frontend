import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaBars,
  FaChevronLeft,
  FaUser,
  FaSignOutAlt,
  FaPlusSquare,
  FaLayerGroup,
  FaSearch,
  FaUsers,
  FaSchool,
  FaBook,
  FaClipboard,
  FaMicrophoneAlt,
  FaChartBar,
  FaBriefcase,
  FaFileAlt,
  FaChalkboardTeacher,
  FaBookOpen,
  FaTachometerAlt,
  FaChartLine,
  FaCode 
} from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";
import { TbReportAnalytics } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { MdOutlineRequestQuote } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useStudent } from "../contexts/StudentProfileContext";
import { decryptData } from '../../cryptoUtils.jsx';


export const SidebarV = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1) Use our context to get student info + pic
  const { studentDetails,  profilePicture } = useStudent();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const userType = decryptData(localStorage.getItem("userType"));
  const profileStatus = localStorage.getItem("profileStatus");

  // 2) Navigation with check for "incomplete profile"
  const handleNavigation = (path) => {
    const restrictedPaths = [
      "/jobslist",
      "/courses",
      "/exam-dashboard",
      "/exam-repors",
     "/exam-reports-dashboard",
      "/mock-interviews",
      "/leave-request-page",
    ];
    if (profileStatus === "false" && restrictedPaths.includes(path)) {
      Swal.fire({
        title: "Profile Incomplete!",
        text: "Please update your profile first to access this feature.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const roleDisplayNames = {
    student_login_details: "STUDENT",
    Mentors: "MENTOR",
    BDE_data: "BDE",
    Manager: "MANAGER",
    admin: "ADMIN",
    superAdmin: "ADMIN",
  };

  // 3) We no longer need local fetchProfilePicture or effect,
  //    because the context handles that.

  // We do create a local "userProfile" object for convenience
  const userProfile = {
    avatarUrl: profilePicture,
    name: studentDetails?.name,
    id: studentDetails?.studentId,
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsLoggedOut(true);
    navigate("/", { replace: true });
  };

  const getMenuItems = (userType, handleLogout) => {
    switch (userType) {
      case "student_login_details":
        return [
          { label: "Profile", path: "/student-profile", icon: FaUser },
          { label: "Jobs List", path: "/jobslist", icon: FaBook },
          { label: "Course", path: "/courses", icon: FaClipboard },
          { label: "Exams", path: "/exam-dashboard", icon: FaFileAlt },
          // { label: "Reports", path: "/exam-repors", icon: PiExam },
          {
            label: "Exam Reports",
            path: "/exam-reports-dashboard",
            icon: FaChartLine,
          },
          {
            label: "Mock Interviews",
            path: "/mock-interviews",
            icon: FaMicrophoneAlt,
          },
          {
            label: "Code Playground",
            path: "/codeplayground",
            icon: FaCode,
          },
          {
            label: "Leave Request",
            path: "/leave-request-page",
            icon: MdOutlineRequestQuote,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      case "super":
        return [
          {
            label: "Admin Dashboard",
            path: "/admin-dashboard",
            icon: FaChartBar,
          },
          {
            label: "Manager Dashboard",
            path: "/manager-dashboard",
            icon: FaTachometerAlt,
          },
          { label: "Manage Jobs List", path: "/jobs-dashboard", icon: FaBook },
          { label: "Students List", path: "/studentslist", icon: FaUsers },
          { label: "Student Search", path: "/studentsearch", icon: FaSearch },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      case "superAdmin":
        return [
          {
            label: "Admin Dashboard",
            path: "/admin-dashboard",
            icon: FaChartBar,
          },
          {
            label: "Manager Dashboard",
            path: "/manager-dashboard",
            icon: FaTachometerAlt,
          },
          { label: "Manage BDEs", path: "/bdes", icon: FaBriefcase },
          {
            label: "Manage Mentors",
            path: "/mentors",
            icon: FaChalkboardTeacher,
          },
          {
            label: "Manage Program Managers",
            path: "/program-managers",
            icon: FaSchool,
          },
          { label: "Students List", path: "/studentslist", icon: FaUsers },
          { label: "Student Search", path: "/studentsearch", icon: FaSearch },
          { label: "Curriculum", path: "/curriculum", icon: FaBookOpen },
          {
            label: "Manage Jobs List",
            path: "/jobs-dashboard",
            icon: FaLayerGroup,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      case "BDE_data":
        return [
          { label: "Add Job", path: "/addjob", icon: FaPlusSquare },
          {
            label: "Students List",
            path: "/managestudentslist",
            icon: FaUsers,
          },
          { label: "Student Data", path: "/studentdata", icon: FaSearch },
          {
            label: "Manage Jobs List",
            path: "/jobs-dashboard",
            icon: FaLayerGroup,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      case "Mentors":
        return [
          {
            label: "Mentor Dashboard",
            path: "/mentor-dashboard",
            icon: FaTachometerAlt,
          },
          { label: "Courses", path: "/course", icon: FaChalkboardTeacher },
          { label: "Attendance", path: "/attendance", icon: FaClipboard },
          { label: "Student List", path: "/mentorstudentslist", icon: FaUsers },
          {
            label: "Upload Questions",
            path: "/upload-questions",
            icon: IoMdCloudUpload,
          },
          {
            label: "Code Playground",
            path: "/codeplayground",
            icon: FaCode,
          },
          {
            label: "Test Case Compiler",
            path: "/testcasecompiler",
            icon: FaCode,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      case "Manager":
        return [
          {
            label: "Manager Dashboard",
            path: "/manager-dashboard",
            icon: FaTachometerAlt,
          },
          {
            label: "Students List",
            path: "/managestudentslist",
            icon: FaUsers,
          },
          { label: "Student Data", path: "/studentdata", icon: FaSearch },
          {
            label: "Manage Jobs List",
            path: "/jobs-dashboard",
            icon: FaLayerGroup,
          },
          {
            label: "Student Enrollment",
            path: "/student-enroll",
            icon: FaSchool,
          },
          {
            label: "Student Attendance",
            path: "/studentattendance",
            icon: FaClipboard,
          },
          { label: "Batch Schedule", path: "/batchschedule", icon: FaUsers },
          { label: "Create Batch", path: "/createbatch", icon: FaPlusSquare },
          { label: "Scheduling Exam", path: "/create-exam", icon: PiExam },
          {
            label: "Students Perfomance",
            path: "/students-performance",
            icon: FaChartLine,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      default:
        return [];
    }
  };

  const allMenuItems = getMenuItems(userType, handleLogout);
  const menuItems = allMenuItems.filter((item) => item.label !== "Logout");
  const logoutItem = allMenuItems.find((item) => item.label === "Logout");

  const isLoggedIn = !!decryptData(localStorage.getItem("userType")) && !isLoggedOut;
  if (!isLoggedIn) {
    // Not logged in => show top bar with login button
    return (
      <div>
        <div className="w-full h-16 bg-white flex items-center justify-between px-4">
          <img
            src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
            alt="Codegnan Logo"
            className="logo cursor-pointer"
            width="150"
            height="150"
            onClick={() => navigate("/")}
          />
          <button
            className="p-1 bg-pink-500 text-white ml-1 font-serif font-medium text-md rounded-lg shadow-lg hover:bg-pink-600 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Reusable sub-menu component
  const MenuItem = ({ icon: Icon, label, path, action, subItems }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const isActive = location.pathname === path;

    return (
      <>
        <button
          className={classNames(
            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors w-full",
            {
              "bg-[#ffffff] text-[#19216F] font-semibold rounded-md": isActive,
              "text-[#ffffff] hover:bg-[#ffffff] hover:text-[#19216F] font-semibold":
                !isActive,
            }
          )}
          onClick={() => {
            if (action) {
              action();
            } else if (subItems) {
              setIsSubMenuOpen((prev) => !prev);
            } else {
              handleNavigation(path);
            }
          }}
        >
          <Icon size={18} />
          <span
            className={classNames({
              hidden: isCollapsed,
              block: !isCollapsed,
            })}
          >
            {label}
          </span>
          {subItems && (
            <FaChevronLeft
              className={classNames("ml-auto transition-transform", {
                "rotate-90": isSubMenuOpen,
              })}
              size={16}
            />
          )}
        </button>

        {/* If there are sub-items, expand them */}
        {subItems && isSubMenuOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {subItems.map((subItem, subIndex) => (
              <button
                key={subIndex}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#ffffff] rounded-md hover:bg-[#ffffff] hover:text-[#0C1BAA] transition-colors w-full"
                onClick={() => handleNavigation(subItem.path)}
              >
                <subItem.icon size={16} />
                <span>{subItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* TOP BAR */}
      <nav className="flex items-center px-4 bg-[#ffffff] text-black">
        <button
          className="p-2 rounded-md bg-black text-[#ffffff] mr-2"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle sidebar"
        >
          <FaBars size={20} />
        </button>
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
          alt="Codegnan Logo"
          className="max-w-[200px] max-h-[90px] object-contain"
        />
      </nav>

      {/* SIDEBAR CONTAINER */}
      <div
        className={classNames(
          "fixed inset-y-0 left-0 z-40 bg-[#19216F] text-[#ffffff] font-bold transition-transform duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          {
            "translate-x-0": isMobileMenuOpen,
            "-translate-x-full": !isMobileMenuOpen,
          }
        )}
      >
        {/* COLLAPSE BUTTON */}
        <button
          className="mt-4 mb-2 flex items-center justify-center text-white focus:outline-none"
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {!isCollapsed && (
            <span className="mr-2 text-xl font-bold">
              {roleDisplayNames[userType]}
            </span>
          )}
          <FaChevronLeft
            className={classNames("transition-transform", {
              "rotate-180": !isCollapsed,
            })}
            size={24}
          />
        </button>

        {/* STUDENT-ONLY PROFILE SECTION */}
        {userType === "student_login_details" && (
          <div className="flex flex-col items-center justify-center w-full py-4 px-2 bg-[#19216F]">
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full" />
            )}

            {!isCollapsed && (
              <div className="mt-2 text-center">
                <h2 className="font-semibold text-base">{userProfile.name}</h2>
                <p className="text-sm opacity-90">ID: {userProfile.id}</p>
              </div>
            )}
          </div>
        )}

        {/* MENU LINKS */}
        <div className="flex-grow flex flex-col space-y-2 w-full mt-2 px-2">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              action={item.action}
              subItems={item.subItems}
            />
          ))}
        </div>

        {/* LOGOUT */}
        {logoutItem && (
          <div className="px-2 pb-4 mt-auto">
            <button
              className={classNames(
                "flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full",
                "bg-[#19216F] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#0C1BAA]"
              )}
              onClick={logoutItem.action}
            >
              <logoutItem.icon size={18} />
              <span
                className={classNames({
                  hidden: isCollapsed,
                  block: !isCollapsed,
                })}
              >
                {logoutItem.label}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY for MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
