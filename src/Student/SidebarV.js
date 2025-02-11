import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";
import { TbReportAnalytics } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { MdOutlineRequestQuote } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";

export const SidebarV = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userType = localStorage.getItem("userType") || "null";
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const roleDisplayNames = {
    student_login_details: "Student",
    Mentors: "Mentor",
    BDE_data: "Business Development Executive",
    Manager: "Program Manager",
    admin: "Admin",
    superAdmin: "Admin",
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.clear(); // Clear user data
    setIsAuthenticated(false); // Update state
    setIsLoggedOut(true);
    navigate("/", { replace: true }); // Redirect to home
  };

  const handleNavigation = (path) => {
    console.log("Navigating to:", path); // ✅ Debugging Log
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getMenuItems = (userType, handleLogout) => {
    switch (userType) {
      case "student_login_details":
        return [
          { label: "Profile", path: "/student-profile", icon: FaUser },
          { label: "Jobs List", path: "/jobslist", icon: FaBook },
          { label: "Course", path: "/courses", icon: FaClipboard },
          { label: "Exams", path: "/exam-dashboard", icon: FaFileAlt },
          { label: "ATS", path: "/ats-upload", icon: FaLayerGroup },
          {
            label: "Mock Interviews",
            path: "/mock-interviews",
            icon: FaMicrophoneAlt,
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
            label: "Reports",
            path: "/mentor-reports",
            icon: TbReportAnalytics,
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
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems(userType, handleLogout);

  // const menuItems = userType
  //   ? userType === "student_login_details"
  //     ? [
  //       // { label: "Dashboard", path: "/student-dashboard", icon: FaTachometerAlt },
  //         { label: "Profile", path: "/student-profile", icon: FaUser },
  //         { label: "Jobs List", path: "/jobslist", icon: FaBook },
  //         { label: "Course", path: "/courses", icon: FaClipboard },
  //         // { label: "Exams", path: "/exam-dashboard", icon: FaFileAlt },
  //         // { label: "Compiler", path: "/compiler", icon: FaTerminal },
  //         { label: "ATS", path: "/ats-upload", icon: FaLayerGroup },
  //         { label: "Mock Interviews", path: "/mock-interviews", icon: FaMicrophoneAlt },
  //         { label: "Leave Request", path: "/leave-request-page", icon: MdOutlineRequestQuote },
  //         { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
  //       ]
  //       :userType === "super"
  //       ? [
  //         { label: "Admin Dashboard", path: "/admin-dashboard", icon: FaChartBar },
  //         { label: "Manager Dashboard", path: "/manager-dashboard", icon: FaTachometerAlt },
  //         { label: "Manage Jobs List", path: "/jobs-dashboard", icon: FaBook },
  //         { label: "Students List", path: "/studentslist", icon: FaUsers },
  //         { label: "Student Search", path: "/studentsearch", icon: FaSearch },
  //           { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
  //         ]
  //       :userType === 'superAdmin'
  //     ? [
  //       { label: "Admin Dashboard", path: "/admin-dashboard", icon: FaChartBar },
  //       { label: "Manager Dashboard", path: "/manager-dashboard", icon: FaTachometerAlt },
  //         { label: 'Manage BDEs', path: '/bdes', icon: FaBriefcase },
  //         { label: 'Manage Mentors', path: '/mentors', icon: FaChalkboardTeacher },
  //         { label: 'Manage Program Managers', path: '/program-managers', icon: FaSchool },
  //         { label: 'Students List', path: '/studentslist', icon: FaUsers },
  //         { label: "Student Search", path: "/studentsearch", icon: FaSearch },
  //         {
  //           label: "Curriculum",
  //           path: "/curriculum",
  //           icon: FaBookOpen,
  //         },
  //         { label: "Manage Jobs List", path: "/jobs-dashboard", icon: FaLayerGroup },

  //         { label: 'Logout', action: handleLogout, icon: FaSignOutAlt },
  //       ]
  //        :userType === 'BDE_data'
  //             ? [
  //                 { label: 'Add Job', path: '/addjob', icon: FaPlusSquare },
  //                 { label: 'Students List', path: '/managestudentslist', icon: FaUsers },
  //                 { label: 'Student Data', path: '/studentdata', icon: FaSearch },
  //                 { label: 'Manage Jobs List', path: '/jobs-dashboard', icon: FaLayerGroup },
  //                 { label: 'Logout', action: handleLogout, icon: FaSignOutAlt },
  //               ]

  //     : userType === "Mentors"
  //     ? [
  //       { label: "Mentor Dashboard", path: "/mentor-dashboard", icon: FaTachometerAlt },
  //         { label: "Courses", path: "/course", icon: FaChalkboardTeacher },
  //         { label: "Attendance", path: "/attendance", icon: FaClipboard },
  //         { label: "Student List", path: "/mentorstudentslist", icon: FaUsers },
  //         // { label: 'Student Data', path: '/studentdata', icon: FaSearch },
  //         // {
  //         //   label: "Online Exam",
  //         //   icon: FaFileAlt,
  //         //   subItems: [
  //         //     { label: "Manage Exams", path: "/manage-exams", icon: FaFileAlt },
  //         //     { label: "Reports", path: "/mentor-reports", icon: FaClipboard },
  //         //   ],
  //         // },
  //       // { label: "Coding Platform", path: "/compiler", icon: FaTerminal },
  //         { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
  //       ]
  //     : userType === "Manager"
  //     ? [
  //       { label: "Manager Dashboard", path: "/manager-dashboard", icon: FaTachometerAlt },
  //       { label: 'Students List', path: '/managestudentslist', icon: FaUsers },
  //       { label: 'Student Data', path: '/studentdata', icon: FaSearch },
  //         { label: "Manage Jobs List", path: "/jobs-dashboard", icon: FaLayerGroup },
  //         { label: "Student Enrollment", path: "/student-enroll", icon: FaSchool },
  //         { label: "Student Attendance", path: "/studentattendance", icon: FaClipboard },
  //         { label: 'Batch Schedule', path: '/batchschedule', icon: FaUsers },
  //         { label: "Create Batch", path: "/createbatch", icon: FaPlusSquare },
  //         { label: "Logout", action: handleLogout, icon: FaSignOutAlt },

  //       ]
  //     : []
  //   : [];

  const isLoggedIn = !!localStorage.getItem("userType") && !isLoggedOut;
  if (!isLoggedIn) {
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
  const MenuItem = ({ icon: Icon, label, path, action, subItems }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const isActive = location.pathname === path;

    return (
      <>
        <button
          className={classNames(
            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors w-full",
            {
              "bg-indigo-600 text-white": isActive,
              "text-white hover:bg-indigo-700 hover:text-white": !isActive,
            }
          )}
          onClick={() => {
            if (action) {
              action(); // ✅ Executes handleLogout if it's the Logout button
            } else if (subItems) {
              setIsSubMenuOpen((prev) => !prev);
            } else {
              handleNavigation(path);
            }
          }}
        >
          <Icon size={18} />
          <span
            className={classNames({ hidden: isCollapsed, block: !isCollapsed })}
          >
            {label}
          </span>
          {subItems && (
            <FaChevronLeft
              className={classNames("ml-auto transition-transform", {
                "rotate-90": isSubMenuOpen,
              })}
            />
          )}
        </button>
        {subItems && isSubMenuOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {subItems.map((subItem, subIndex) => (
              <button
                key={subIndex}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-indigo-700 transition-colors w-full"
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
      <div className="flex justify-between items-center  px-4  bg-white text-white">
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
          alt="Codegnan Logo"
          className="max-w-[200px] max-h-[90px] object-contain"
        />

        <button
          className="p-2 rounded-md bg-black text-white"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle sidebar"
        >
          <FaBars size={20} />
        </button>
      </div>
      <div
        className={classNames(
          "fixed inset-y-0 right-0 z-40 bg-gray-900 text-white transition-transform duration-300 w-64 overflow-y-auto", // Changed left-0 to right-0
          {
            "translate-x-0": isMobileMenuOpen, // Sidebar visible
            "translate-x-full": !isMobileMenuOpen, // Sidebar hidden offscreen
          }
        )}
      >
        <div className="p-4">
          <button
            className="flex items-center justify-between w-full text-white"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <span>{roleDisplayNames[userType]}</span>
            <FaChevronLeft
              className={classNames("transition-transform", {
                "rotate-180": !isCollapsed,
              })}
            />
          </button>
        </div>
        <div className="mt-6 space-y-2">
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
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
