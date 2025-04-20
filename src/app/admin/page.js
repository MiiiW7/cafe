'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../page-layout';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiUsers, FiShoppingBag, FiSettings, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { name: 'Total Orders', value: '0', icon: FiShoppingBag },
    { name: 'Total Customers', value: '0', icon: FiUsers },
    { name: 'Menu Items', value: '0', icon: FiMenu },
    { name: 'Revenue', value: '$0', icon: FiBarChart2 },
  ]);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!user) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/');
    } else {
      fetchStats();
    }
  }, [user, isAdmin, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      
      // Update stats with real data
      setStats([
        { name: 'Total Orders', value: data.totalOrders.toString(), icon: FiShoppingBag },
        { name: 'Total Customers', value: data.totalCustomers.toString(), icon: FiUsers },
        { name: 'Menu Items', value: data.totalMenuItems.toString(), icon: FiMenu },
        { name: 'Revenue', value: `$${data.totalRevenue}`, icon: FiBarChart2 },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Dashboard Stats */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                          <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-700 truncate">{stat.name}</dt>
                            <dd>
                              {loading ? (
                                <div className="h-6 w-16 animate-pulse bg-gray-200 rounded"></div>
                              ) : (
                                <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                              )}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Management Options */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Management</h3>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                            <FiMenu className="h-6 w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">Menu Management</h3>
                            <p className="mt-1 text-sm text-gray-700">
                              Add, edit, or remove menu items
                            </p>
                            <div className="mt-3">
                              <Link
                                href="/admin/menu"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                              >
                                Manage Menu
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                            <FiUsers className="h-6 w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                            <p className="mt-1 text-sm text-gray-700">
                              Manage users and permissions
                            </p>
                            <div className="mt-3">
                              <Link
                                href="/admin/users"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                              >
                                Manage Users
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                            <FiShoppingBag className="h-6 w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
                            <p className="mt-1 text-sm text-gray-700">
                              View and manage customer orders
                            </p>
                            <div className="mt-3">
                              <Link
                                href="/admin/orders"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                              >
                                Manage Orders
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
} 