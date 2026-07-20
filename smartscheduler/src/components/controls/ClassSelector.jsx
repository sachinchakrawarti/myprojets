import React from "react";

const ClassSelector = ({ selectedBranch, onBranchChange }) => {
  const branches = ["CS A", "CS B", "AIDS"];

  return (
    <div className="mb-6 flex justify-center gap-4">
      {branches.map((branch) => (
        <button
          key={branch}
          onClick={() => onBranchChange(branch)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            selectedBranch === branch
              ? "bg-red-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {branch} Section
        </button>
      ))}
    </div>
  );
};

export default ClassSelector;
