import React from "react";

/**
 * Instructions Modal that pops up when the user clicks "Start Exam".
 * onClose: callback for when user clicks "Close"
 * onAgree: callback for when user clicks "Agree & Proceed"
 */
const InstructionsModal = ({ onClose, onAgree }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Instructions</h2>
        <p className="mb-2 text-lg">
          Please read carefully and agree to the below:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-lg text-gray-700">
          <li>
            It is not advisable to attempt coding problems from a mobile screen.
            Use a laptop or desktop instead.
          </li>
          <li>
            Ensure you load the latest version of Google Chrome (v60+) or latest
            version of Firefox.
          </li>
          <li>
            Make sure third-party cookies are enabled in your browser settings.
          </li>
          <li>
            Maintain uninterrupted internet connectivity with a minimum download
            &amp; upload speed of 20 Mbps.
          </li>
          <li>
            Set your system clock to IST (India Standard Time) to avoid time
            mismatch.
          </li>
          <li>
            No tab switches are allowed during the test. Switching tabs may
            result in submission of the test.
          </li>
          <li>
            Any notifications or pop-ups during the test will be counted as a
            tab switch. Please ensure they are turned off.
          </li>
          <li>
            The test will automatically submit when time limit is reached. Any
            unanswered questions will be marked incorrect.
          </li>
        </ul>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onAgree}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Agree &amp; Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
