export const NumberedNavigation = ({ map, currentIndex, onSelect }) => {
  return (
    <div className="inline-grid grid-flow-col grid-rows-6 gap-2 my-4 mx-2 bg-white rounded-2xl p-4 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      {map.map((item, index) => {
        let bgColor;
        if (index === currentIndex) {
          bgColor = "bg-[#3686FF]";
        } else if (item.markedForReview) {
          bgColor = "bg-[#FF6000]";
        } else if (item.answered) {
          bgColor = "bg-[#129E00]";
        } else {
          bgColor = "bg-[#E1EFFF]";
        }
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`${bgColor} text-white px-3 py-1 m-1 rounded-lg w-[64px] h-[64px]`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};
