import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="w-full px-6 py-5 bg-white shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">OnDoc</h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Docs</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">About</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-blue-700 mb-4">
          OnDoc
        </h2>
        <p className="text-lg md:text-2xl text-gray-600 mb-8">
          your knowledgebase companion.
        </p>
        <a
          href="#"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transition"
        >
          Get Started
        </a>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-inner py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} OnDoc. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
