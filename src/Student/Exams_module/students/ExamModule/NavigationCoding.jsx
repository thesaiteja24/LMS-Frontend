import React from "react";
import CountdownTimer from "./CountdownTimer";
import NumberedNavigation from "./NumberedNavigation";

export const NavigationCoding = () => {
  return (
    <div className="rounded-xl flex flex-col mr-2 w-full md:w-auto">
      <CountdownTimer />
      <NumberedNavigation />
    </div>
  );
};


