'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiPackage } from 'react-icons/fi';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-amber-600">Coffee Shop</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-500 text-sm font-medium text-gray-800 hover:text-amber-600">
                Home
              </Link>
              <Link href="/menu" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-500 text-sm font-medium text-gray-800 hover:text-amber-600">
                Menu
              </Link>
              {user && !isAdmin() && (
                <Link href="/orders" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-500 text-sm font-medium text-gray-800 hover:text-amber-600">
                  My Orders
                </Link>
              )}
              {isAdmin() && (
                <Link href="/admin" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-500 text-sm font-medium text-gray-800 hover:text-amber-600">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link href="/cart" className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="h-6 w-6" />
                </Link>
                <Link href="/orders" className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100">
                  <FiPackage className="h-6 w-6" />
                </Link>
                <Link href="/profile" className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100">
                  <FiUser className="h-6 w-6" />
                </Link>
                <button 
                  onClick={logout} 
                  className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100"
                  aria-label="Logout"
                >
                  <FiLogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700">
                  Login
                </Link>
                <Link href="/register" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50">
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-gray-50 hover:border-amber-500 text-base font-medium text-gray-800 hover:text-amber-600">
              Home
            </Link>
            <Link href="/menu" className="block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-gray-50 hover:border-amber-500 text-base font-medium text-gray-800 hover:text-amber-600">
              Menu
            </Link>
            {user && !isAdmin() && (
              <Link href="/orders" className="block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-gray-50 hover:border-amber-500 text-base font-medium text-gray-800 hover:text-amber-600">
                My Orders
              </Link>
            )}
            {isAdmin() && (
              <Link href="/admin" className="block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-gray-50 hover:border-amber-500 text-base font-medium text-gray-800 hover:text-amber-600">
                Admin
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center text-white">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-700">{user.email}</div>
                </div>
                <div className="ml-auto flex space-x-2">
                  <Link href="/cart" className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100">
                    <FiShoppingCart className="h-6 w-6" />
                  </Link>
                  <Link href="/orders" className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100">
                    <FiPackage className="h-6 w-6" />
                  </Link>
                  <Link href="/profile" className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100">
                    <FiUser className="h-6 w-6" />
                  </Link>
                  <button 
                    onClick={logout} 
                    className="p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-gray-100"
                  >
                    <FiLogOut className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-4">
                <Link href="/login" className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700">
                  Login
                </Link>
                <Link href="/register" className="block text-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 