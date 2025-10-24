import React, { useState } from 'react';
import { LuUpload } from "react-icons/lu";

const FileDropzone = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert('Invalid file type. Please upload .xlsx, .xls, or .csv files.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
        }`}
    >
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <span className='bg-blue-200 p-3 rounded-full inline-block mb-4'>
        <LuUpload className='text-4xl font-bold text-blue-600' />
      </span>
      <h1 className='text-2xl font-bold'>Upload Your Excel File</h1>
      <p className="text-sm text-gray-500 mt-2">
        Drag and drop your Excel file here, or click to browse. We support .xlsx, .xls, and .csv formats.
      </p>
      <label htmlFor="file-upload" className="block text-gray-600 mt-2">
        <button className="bg-blue-600 text-white font-medium rounded-md p-2 cursor-pointer">Choose File</button>
      </label>
      {selectedFile && (
        <div className="mt-4 text-sm text-green-700">
          ✅ <strong>{selectedFile.name}</strong> selected
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
