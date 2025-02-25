import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-lg ${className} shadow-md`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => (
  <div className="bg-[#19216F] text-white font-semibold text-xl p-1 rounded-t-lg">
    {children}
  </div>
);

export const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

export const CardContent = ({ children }) => <div>{children}</div>;
