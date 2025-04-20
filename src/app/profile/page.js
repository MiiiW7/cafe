'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../page-layout';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiShoppingBag, FiLogOut, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchRecentOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${user.id}&limit=5`);
        
        if (response.ok) {
          const data = await response.json();
          setRecentOrders(data.slice(0, 5)); // Ensure we only get 5 most recent
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-start md:justify-between">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                  <Link 
                    href="/profile/edit" 
                    className="ml-2 p-1 rounded-full text-amber-700 hover:bg-amber-100"
                  >
                    <FiEdit className="h-5 w-5" />
                    <span className="sr-only">Edit Profile</span>
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col items-center px-4 py-8">
                <div className="h-24 w-24 rounded-full bg-amber-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-700 mt-1">{user.email}</p>
                <div className="mt-3">
                  {isAdmin() && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
                <div className="w-full mt-8 space-y-3">
                  <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">Account Type</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {isAdmin() ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  
                  <Link
                    href="/orders"
                    className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">My Orders</span>
                    </div>
                    <span className="text-sm font-medium text-amber-700">
                      View All
                    </span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 md:pl-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Your most recent orders.</p>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rp {(order.totalPrice * 1000).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/orders/${order.id}`} 
                              className="text-amber-600 hover:text-amber-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FiShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start shopping to place your first order.</p>
                  <Link 
                    href="/menu" 
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Browse Menu
                  </Link>
                </div>
              )}
              
              {recentOrders.length > 0 && (
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
                  <Link 
                    href="/orders" 
                    className="text-sm font-medium text-amber-600 hover:text-amber-500"
                  >
                    View all orders
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 