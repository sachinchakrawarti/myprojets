import React from "react";
import { weekdaySlots } from "../../data/timeSlots";

const TableHeader = () => {
  return (
    <thead>
      <tr className="bg-red-700 text-white">
        <th className="border border-red-600 px-4 py-3 text-left">DAY/TIME</th>
        <th className="border border-red-600 px-4 py-3 text-left">Branch</th>
        {weekdaySlots.map((slot) => (
          <th
            key={slot}
            className="border border-red-600 px-2 py-3 text-center text-sm"
          >
            {slot}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
