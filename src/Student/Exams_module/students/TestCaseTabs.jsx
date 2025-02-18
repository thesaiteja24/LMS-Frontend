import React, { useState } from "react";

const TestCaseTabs = ({ testCases }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (testCases.length === 0) {
    return <div>No test cases to display.</div>;
  }

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="rounded-md overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-800 px-4 py-2">
        {testCases.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`text-sm px-4 py-1 mr-2 rounded-t 
              ${
                activeTab === index
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300"
              }
            `}
          >
            Case {index + 1}
          </button>
        ))}
        {/* If you want the "+" button exactly like the screenshot */}
        <button className="bg-gray-900 text-gray-300 text-sm px-4 py-1 rounded-t">
          +
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="bg-gray-700 p-4 text-white">
        {testCases[activeTab].type === "hidden" ? (
          <h4 className="mb-2 font-semibold">
            Hidden Test Case {activeTab + 1}: {testCases[activeTab].status}
          </h4>
        ) : (
          <div className="flex flex-row gap-4">
            <h4 className="mb-2 font-semibold">
              Test Case {activeTab + 1}: {testCases[activeTab].status}
            </h4>
            <p className="mb-1">
              <strong>Input:</strong> {testCases[activeTab].input}
            </p>
            <p className="mb-1">
              <strong>Expected Output:</strong>{" "}
              {testCases[activeTab].expected_output}
            </p>
            <p className="mb-1">
              <strong>Your Output:</strong> {testCases[activeTab].actual_output}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseTabs;
