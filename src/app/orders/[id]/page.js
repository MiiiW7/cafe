'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '../../page-layout';
import { useAuth } from '../../../context/AuthContext';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderDetail({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = params.id;

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    fetchOrderDetails();
  }, [user, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details for ID:', orderId);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      console.log('Order details received:', data);
      
      // Verify the order belongs to the current user
      if (data.userId !== user.id && user.role !== 'ADMIN') {
        toast.error('You do not have permission to view this order');
        router.push('/orders');
        return;
      }
      
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
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
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
          >
            <FiArrowLeft className="mr-1 h-4 w-4" />
            Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Order #{orderId}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
          </div>
        ) : !order ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
            <p className="mt-1 text-sm text-gray-500">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link 
              href="/orders" 
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Back to Orders
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Order Summary */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order Summary</h3>
                <div className="mt-1 text-sm text-gray-500 flex items-center flex-wrap">
                  <div className="flex items-center mr-4 mb-1">
                    <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="flex items-center mr-4 mb-1">
                    <FiClock className="mr-1.5 h-4 w-4 text-gray-400" />
                    {formatTime(order.createdAt)}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </span>
            </div>

            {/* Order Items */}
            <div className="border-b border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Items</h4>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div className="font-medium text-gray-900">{item.menuItem.name}</div>
                            <div className="text-gray-500 capitalize">{item.menuItem.category.toLowerCase()}</div>
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            Rp {(item.price * 1000).toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            Rp {(item.price * item.quantity * 1000).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <th scope="row" colSpan="3" className="px-2 sm:px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Total
                        </th>
                        <td className="px-2 sm:px-6 py-3 text-right text-sm font-medium text-amber-700">
                          Rp {(order.totalPrice * 1000).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {order.deliveryAddress && (
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Delivery Information</h4>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                  <div className="flex items-start">
                    <FiMapPin className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="ml-3 text-sm text-gray-500">
                      <span className="font-medium text-gray-900 block">Delivery Address</span>
                      {order.deliveryAddress}
                    </div>
                  </div>
                  {order.contactPhone && (
                    <div className="flex items-start">
                      <FiPhone className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 text-sm text-gray-500">
                        <span className="font-medium text-gray-900 block">Contact Phone</span>
                        {order.contactPhone}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
} 