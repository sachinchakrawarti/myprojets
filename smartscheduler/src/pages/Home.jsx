import React, { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Timetable from "../components/timetable/Timetable";
import ClassSelector from "../components/controls/ClassSelector";
import Controls from "../components/controls/Controls";
import { timetableData } from "../data/timetableSample";

const Home = () => {
  const [selectedBranch, setSelectedBranch] = useState("CS A");

  const handleExport = () => {
    // Convert timetable to CSV and download
    alert("Export functionality coming soon!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        <ClassSelector
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
        />
        <Controls onExport={handleExport} onPrint={handlePrint} />
        <Timetable branch={selectedBranch} timetableData={timetableData} />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
