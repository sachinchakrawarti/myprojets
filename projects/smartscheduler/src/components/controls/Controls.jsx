import React from "react";

const Controls = ({ onExport, onPrint }) => {
  return (
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={onExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm"
      >
        📥 Export Timetable
      </button>
      <button
        onClick={onPrint}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm"
      >
        🖨️ Print Timetable
      </button>
    </div>
  );
};

export default Controls;
