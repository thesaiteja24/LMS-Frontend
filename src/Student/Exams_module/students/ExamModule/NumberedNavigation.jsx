import React from "react";

export const NumberedNavigation = ({ map, currentIndex, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center m-4">
      {map.map((item, index) => {
        let bgColor;
        if (index === currentIndex) {
          // Current active question
          bgColor = "bg-blue-500";
        } else {
          // Color based on the question's status
          switch (item.status) {
            case "answered":
              bgColor = "bg-green-500";
              break;
            case "markedForReview":
              bgColor = "bg-orange-500";
              break;
            case "notAnswered":
            default:
              bgColor = "bg-gray-300";
              break;
          }
        }
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`${bgColor} text-white px-3 py-1 m-1 rounded`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};
