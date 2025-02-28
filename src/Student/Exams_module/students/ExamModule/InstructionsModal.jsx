import React from "react";

/**
 * Instructions Modal that pops up when the user clicks "Start Exam".
 * onClose: callback for when user clicks "Close"
 * onAgree: callback for when user clicks "Agree & Proceed"
 */
const InstructionsModal = ({ onClose, onAgree }) => {
  // Check screen size and ask confirmation if on mobile
  const handleAgree = () => {
    if (window.innerWidth < 768) {
      const proceed = window.confirm(
        "This exam is optimized for larger screens. Do you want to proceed on mobile?"
      );
      if (!proceed) return;
    }
    onAgree();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Instructions</h2>
        <p className="mb-2 text-lg">
          Please read carefully and agree to the below:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-lg text-gray-700">
          <li>
            For the best experience, it is recommended to attempt coding
            problems on a larger screen.
          </li>
          <li>
            Ensure you load the latest version of Google Chrome (v60+) or the
            latest version of Firefox.
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
            The test will automatically submit when the time limit is reached.
            Any unanswered questions will be marked incorrect.
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
            onClick={handleAgree}
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
