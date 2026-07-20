import React from "react";
import Cell from "./Cell";
import { weekdaySlots, saturdaySlots } from "../../data/timeSlots";

const TableRow = ({ day, branch, timetableData }) => {
  const isSaturday = day === "Saturday";
  const timeSlots = isSaturday ? saturdaySlots : weekdaySlots;

  if (isSaturday) {
    return (
      <tr className="bg-gray-50">
        <td className="border border-gray-300 px-4 py-3 font-semibold bg-gray-100">
          {day}
        </td>
        <td className="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
          {branch}
        </td>
        {timeSlots.map((slot) => {
          const subject = timetableData[day]?.[slot] || "";
          return <Cell key={slot} subject={subject} />;
        })}
        {Array(3)
          .fill()
          .map((_, i) => (
            <td
              key={`empty-${i}`}
              className="border border-gray-300 px-2 py-3 bg-gray-50"
            >
              {" "}
            </td>
          ))}
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="border border-gray-300 px-4 py-3 font-semibold bg-gray-100">
        {day}
      </td>
      <td className="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
        {branch}
      </td>
      {timeSlots.map((slot) => {
        const subject = timetableData[day]?.[slot] || "";
        return <Cell key={slot} subject={subject} />;
      })}
    </tr>
  );
};

export default TableRow;
