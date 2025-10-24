import React from 'react';

const Hero = () => {
  return (
    <section className="bg-neutral-50 py-5">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <span className="text-sm uppercase tracking-wider text-blue-600 font-semibold">
          AI-Powered Analytics Platform
        </span>

        <h1 className="text-2xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Transform Excel Data into Insights
        </h1>

        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Upload Excel files and unlock the power of advanced analytics with
          AI-driven insights, interactive 2D/3D visualizations, and professional reports.
          Experience the future of data analysis.
        </p>

        <a
          href="#features"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Explore Features
        </a>
      </div>
    </section>
  );
};

export default Hero;
