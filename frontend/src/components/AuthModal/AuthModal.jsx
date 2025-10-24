import React, { useState } from 'react';

const AuthModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('signup');

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-100">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <h1 className='mb-4 text-2xl text-center text-blue-400 font-bold '>Welcome to Excel Analysis</h1>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl cursor-pointer"
        >
          &times;
        </button>

        {/* Tabs */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 rounded ${activeTab === 'login'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-4 py-2 rounded ${activeTab === 'signup'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {activeTab === 'signup' && (
            <>
              <input type="text" placeholder="Enter your full name" aria-label="Full name" className="w-full border p-2 rounded" required />
            </>
          )}
          <input type="email" placeholder="Enter your email" aria-label="Email" className="w-full border p-2 rounded" required />
          <input type="password" placeholder="Create a password" aria-label="Password" className="w-full border p-2 rounded" required />
          {activeTab === 'signup' && (
            <input type="password" placeholder="Confirm your password" aria-label="Confirm password" className="w-full border p-2 rounded" required />
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {activeTab === 'signup' ? 'Sign Up' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
