'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../../page-layout';
import { useAuth } from '../../../context/AuthContext';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!user) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [user, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let url = '/api/users';
      let method = 'POST';
      
      if (selectedUser) {
        url = `/api/users/${selectedUser.id}`;
        method = 'PUT';
      }
      
      // Only include password for new users or if it's changed
      const userData = { ...formData };
      if (selectedUser && !userData.password) {
        delete userData.password;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.success(selectedUser ? 'User updated successfully' : 'User created successfully');
        resetForm();
        fetchUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleEdit = (userData) => {
    setSelectedUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      password: '', // Don't pre-fill password
      role: userData.role
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    // Don't allow deleting yourself
    if (id === user.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CUSTOMER'
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {showForm ? 'Cancel' : (
                <>
                  <FiPlus className="mr-2" />
                  Add New User
                </>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Form for adding/editing users */}
          {showForm && (
            <div className="px-4 py-5 bg-white shadow rounded-lg sm:p-6 mb-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {selectedUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">
                    {selectedUser 
                      ? 'Update user information and permissions' 
                      : 'Create a new user account'}
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-800">
                          Full Name*
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                          Email*
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                          {selectedUser ? 'Password (leave blank to keep current)' : 'Password*'}
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          required={!selectedUser}
                          value={formData.password}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-800">
                          Role*
                        </label>
                        <select
                          id="role"
                          name="role"
                          required
                          value={formData.role}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
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
                        {selectedUser ? 'Update User' : 'Add User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Users list */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                  <span className="text-amber-800 font-medium">
                                    {userData.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                                <div className="text-sm text-gray-500">{userData.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userData.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {userData.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(userData)}
                              className="text-amber-600 hover:text-amber-900 mr-4"
                            >
                              <FiEdit className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(userData.id)}
                              className={`text-red-600 hover:text-red-900 ${
                                userData.id === user.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={userData.id === user.id}
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
                  <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Add New User
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