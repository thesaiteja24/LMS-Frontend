import React, { useContext } from "react";
import SectionSwitcher from "./SectionSwitcher";
import { CodingPanel } from "./CodingPanel";
import OnlineCompiler from "./OnlineCompiler";

export const DisplayCoding = () => {
  return (
    <div className="w-full ml-2 bg-white rounded-xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <SectionSwitcher />
      <div className="flex flex-row">
        <CodingPanel />
        <OnlineCompiler />
      </div>
    </div>
  );
};
