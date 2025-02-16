import React, { useState } from "react";
import ApplyLeaveRequest from "./ApplyLeaveRequest";
import ViewLeaveRequests from "./ViewLeaveRequests";

const LeaveRequestPage = () => {
  const [activeTab, setActiveTab] = useState("view");


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <header className="bg-blue-600 text-white text-center py-6">
          <h1 className="text-3xl font-bold">Leave Requests</h1>
        </header>

        <div className="flex justify-around bg-gray-100 p-4">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-6 py-2 rounded-lg font-medium text-lg transition ${
              activeTab === "view"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View Applied Requests
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-2 rounded-lg font-medium text-lg transition ${
              activeTab === "new"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Apply New Request
          </button>
        </div>

        <div className="p-6">
          {activeTab === "view" && <ViewLeaveRequests />}
          {activeTab === "new" && <ApplyLeaveRequest />}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestPage;
