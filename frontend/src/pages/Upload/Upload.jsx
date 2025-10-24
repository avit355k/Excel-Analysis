import React, { useState } from "react";
import FileDropzone from "../../components/FileDropzone";
import { LuFileSpreadsheet } from "react-icons/lu";
import { AiFillThunderbolt } from "react-icons/ai";
import { BiBarChartAlt2 } from "react-icons/bi";
import { RiBarChartGroupedLine } from "react-icons/ri";
import { PiBrainFill } from "react-icons/pi";
import { BsClockHistory } from "react-icons/bs";

const Upload = () => {
  const [activeTab, setActiveTab] = useState("upload");

  const navItems = [
    { id: "upload", label: "Upload", icon: <LuFileSpreadsheet /> },
    { id: "charts2d", label: "2D Charts", icon: <BiBarChartAlt2 /> },
    { id: "views3d", label: "3D Views", icon: <RiBarChartGroupedLine /> },
    { id: "ai", label: "AI Insights", icon: <PiBrainFill /> },
    { id: "history", label: "History", icon: <BsClockHistory /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* ===== Top Navigation Buttons ===== */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-5 text-center shadow-sm rounded-lg overflow-hidden border border-gray-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex justify-center items-center gap-2 py-3 text-sm font-medium transition-all
                ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Smart Excel File Upload */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="flex items-center bg-blue-600 rounded-t-lg p-5 gap-2">
            <LuFileSpreadsheet className="text-white text-2xl" />
            <h2 className="text-xl font-semibold text-white">
              Smart Excel File Upload
            </h2>
          </div>
          <div className="m-6">
            <FileDropzone />
          </div>
        </div>

        {/* Quick Analysis Preview */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="flex items-center bg-green-600 rounded-t-lg p-5 gap-2">
            <AiFillThunderbolt className="text-white text-2xl" />
            <h2 className="text-xl font-semibold text-white">
              Quick Analysis Preview
            </h2>
          </div>

          <div className="m-6 space-y-5">
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-3 text-center text-sm font-semibold text-gray-800">
              <div className="bg-blue-100 p-4 rounded-md shadow-sm">
                <p className="text-blue-700 text-lg font-bold">12</p>
                <p>Total Records</p>
              </div>
              <div className="bg-green-100 p-4 rounded-md shadow-sm">
                <p className="text-green-700 text-lg font-bold">100%</p>
                <p>Data Quality</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-md shadow-sm">
                <p className="text-purple-700 text-lg font-bold">4</p>
                <p>Numeric Columns</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-md shadow-sm">
                <p className="text-orange-700 text-lg font-bold">100%</p>
                <p>Completeness</p>
              </div>
            </div>

            {/* Key Insights box */}
            <div className="bg-green-50 border border-green-100 rounded-md p-5">
              <h3 className="text-green-800 font-semibold text-lg mb-3">
                Key Insights
              </h3>
              <ul className="space-y-2 text-gray-800 text-sm">
                <li>💰 <strong>Total Sales ($):</strong> $769,000</li>
                <li>📉 <strong>Average Sales ($):</strong> $64,083</li>
                <li>🚀 <strong>Peak Sales ($):</strong> $85,000</li>
                <li>✅ <strong>Data Quality Score:</strong> 100%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
