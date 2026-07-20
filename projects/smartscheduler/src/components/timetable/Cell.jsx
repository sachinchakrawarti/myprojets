import React from "react";
import { getCellStyle, formatSubject } from "../../utils/format";

const Cell = ({ subject }) => {
  const cellStyle = getCellStyle(subject);
  const formattedSubject = formatSubject(subject);

  return (
    <td
      className={`border border-gray-300 px-2 py-3 text-center text-sm ${cellStyle}`}
    >
      {formattedSubject}
    </td>
  );
};

export default Cell;
