import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../AuthModal/AuthModal'; // Import the modal component

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-blue-600">
              Excel Analytics
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition">Dashboard</Link>
              <Link to="/analytics" className="text-gray-700 hover:text-blue-600 transition">Analytics</Link>
              <Link to="/reports" className="text-gray-700 hover:text-blue-600 transition">Reports</Link>
              <Link to="/upload" className="text-gray-700 hover:text-blue-600 transition">Upload</Link>
            </div>

            {/* Auth Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-700  text-white font-semibold rounded-lg hover:bg-indigo-600 transition cursor-pointer"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal */}
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Navbar;
