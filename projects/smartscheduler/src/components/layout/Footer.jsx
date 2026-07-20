import React from "react";
import { facultyList } from "../../data/timetableSample";

const Footer = () => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Faculty Details:</h4>
        <div className="text-sm text-gray-600 grid grid-cols-2 gap-1">
          {facultyList.map((faculty, index) => (
            <div key={index}>{faculty}</div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">HOD(CSE)</p>
            <p className="text-sm text-gray-600 mt-2">_________________</p>
          </div>
          <div>
            <p className="font-semibold">Principal(SRGI)</p>
            <p className="text-sm text-gray-600 mt-2">_________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
