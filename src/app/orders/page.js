'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../page-layout';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingBag, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    fetchUserOrders();
  }, [user, router, fetchUserOrders]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
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
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <Link
            href="/menu"
            className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Browse Menu
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping to place your first order.</p>
            <Link 
              href="/menu" 
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-amber-700 truncate">Order #{order.id}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <FiChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <FiShoppingBag className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <p className="text-sm text-gray-500">
                          {order.items.slice(0, 2).map((item, index) => (
                            <span key={item.id}>
                              {index > 0 && ', '}
                              {item.menuItem.name} x{item.quantity}
                            </span>
                          ))}
                          {order.items.length > 2 && ', ...'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Rp {(order.totalPrice * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 