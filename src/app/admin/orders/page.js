'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../../page-layout';
import { useAuth } from '../../../context/AuthContext';
import { FiArrowLeft, FiFilter, FiCalendar, FiClock, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderManagement() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!user) {
      router.push('/login');
      return;
    } else if (!isAdmin()) {
      router.push('/');
      return;
    }

    fetchOrders();
  }, [user, isAdmin, router, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter 
        ? `/api/orders?status=${statusFilter}`
        : '/api/orders';
      
      console.log('Fetching orders from:', url);
        
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log('Orders data:', data);
      
      // Extract the orders array from the response data
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      console.log('Update status response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating status:', errorText);
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      console.log('Updated order:', updatedOrder);
      
      // Update orders in state by replacing the updated order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast.success(`Order #${orderId} updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
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

  // Calculate total order amount
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
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
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/admin" className="mr-4">
                <FiArrowLeft className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                >
                  <option value="">All Orders</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FiFilter className="h-4 w-4" />
                </div>
              </div>
              <button
                onClick={fetchOrders}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter 
                  ? `No ${statusFilter.toLowerCase()} orders found.` 
                  : 'There are no orders in the system yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div 
                    className="px-4 py-5 sm:px-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mr-3">
                          Order #{order.id}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex flex-col sm:items-end text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <FiClock className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>{formatTime(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex items-center text-sm text-gray-700">
                        <FiUser className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span>
                          {order.user ? `${order.user.name} (${order.user.email})` : 'Customer info not available'}
                        </span>
                      </div>
                      <div className="mt-2 sm:mt-0 font-medium text-lg text-amber-700">
                        Rp {(order.totalPrice * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {expandedOrder === order.id && (
                    <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
                      <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subtotal
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.menuItem.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    Rp {(item.price * 1000).toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.quantity}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    Rp {(item.price * item.quantity * 1000).toLocaleString()}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                          {order.status !== 'PROCESSING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Mark as Processing
                            </button>
                          )}
                          {order.status !== 'COMPLETED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Mark as Completed
                            </button>
                          )}
                          {order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                        <div className="text-base font-medium text-gray-900">
                          Total: <span className="text-lg text-amber-700">Rp {(order.totalPrice * 1000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
} 