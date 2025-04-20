'use client';

import Header from '../components/Header';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-amber-500">Coffee Shop</h2>
              <p className="text-sm text-gray-300 mt-1">Serving quality coffee since 2023</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
              <a href="#" className="text-gray-300 hover:text-white">About Us</a>
              <a href="#" className="text-gray-300 hover:text-white">Contact</a>
              <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Coffee Shop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 