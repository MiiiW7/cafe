'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '../../page-layout';
import { useAuth } from '../../../context/AuthContext';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MenuManagement() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'DRINK',
    imageUrl: '',
    isAvailable: true
  });

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!user) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/');
    } else {
      fetchMenuItems();
    }
  }, [user, isAdmin, router]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = selectedItem 
        ? `/api/menu/${selectedItem.id}` 
        : '/api/menu';
      
      const method = selectedItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (response.ok) {
        toast.success(selectedItem ? 'Item updated successfully' : 'Item created successfully');
        resetForm();
        fetchMenuItems();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        fetchMenuItems();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'DRINK',
      imageUrl: '',
      isAvailable: true
    });
    setShowForm(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {showForm ? 'Cancel' : (
                <>
                  <FiPlus className="mr-2" />
                  Add New Item
                </>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Form for adding/editing menu items */}
          {showForm && (
            <div className="px-4 py-5 bg-white shadow rounded-lg sm:p-6 mb-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">
                    {selectedItem 
                      ? 'Update the details of this menu item' 
                      : 'Create a new menu item for your coffee shop'}
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-800">
                          Item Name*
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-800">
                          Price*
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                          </div>
                          <input
                            type="number"
                            name="price"
                            id="price"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-9 pr-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-800">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-800">
                          Category*
                        </label>
                        <select
                          id="category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        >
                          <option value="DRINK">Drink</option>
                          <option value="FOOD">Food</option>
                          <option value="DESSERT">Dessert</option>
                          <option value="SNACK">Snack</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-800">
                          Image URL
                        </label>
                        <input
                          type="text"
                          name="imageUrl"
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="col-span-6">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="isAvailable"
                              name="isAvailable"
                              type="checkbox"
                              checked={formData.isAvailable}
                              onChange={handleChange}
                              className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="isAvailable" className="font-medium text-gray-800">
                              Available
                            </label>
                            <p className="text-gray-700">Mark this item as available on the menu</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        {selectedItem ? 'Update Item' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Menu items list */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Menu Items</h3>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
                </div>
              ) : menuItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 relative">
                                {item.imageUrl ? (
                                  <Image 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    fill
                                    sizes="40px"
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <span className="text-amber-800 font-medium">
                                      {item.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {item.description || 'No description'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                              {item.category.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rp {(item.price * 1000).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.isAvailable ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Unavailable
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-amber-600 hover:text-amber-900 mr-4"
                            >
                              <FiEdit className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-5 w-5" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu item.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Add New Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
} 