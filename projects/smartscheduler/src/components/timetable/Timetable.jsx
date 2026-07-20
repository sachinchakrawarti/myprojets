import React from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { days } from "../../data/timeSlots";

const Timetable = ({ branch, timetableData }) => {
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader />
          <tbody>
            {days.map((day) => (
              <TableRow
                key={day}
                day={day}
                branch={branch}
                timetableData={timetableData[branch][day]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
