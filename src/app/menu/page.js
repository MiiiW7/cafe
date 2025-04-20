'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '../page-layout';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function MenuPage() {
  const { user, isAdmin } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from localStorage on component mount
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }

    const fetchMenuItems = async () => {
      try {
        const url = selectedCategory 
          ? `/api/menu?category=${selectedCategory}`
          : '/api/menu';
        
        const response = await fetch(url);
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

    fetchMenuItems();
  }, [selectedCategory]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else if (cart.length === 0 && localStorage.getItem('cart')) {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (existingItem) {
        // Update quantity if item exists
        return prevCart.map((cartItem) => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    
    toast.success(`Added ${item.name} to cart`);
  };

  const categories = ['DRINK', 'FOOD', 'DESSERT', 'SNACK'];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Menu</h1>
          <p className="mt-4 text-xl text-gray-700">
            Browse our selection of handcrafted coffee and delicious food items.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === '' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
            </div>
          ) : menuItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {menuItems.map((item) => (
                <div key={item.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-60 w-full overflow-hidden">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="group-hover:opacity-75 transition-opacity duration-300 object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-800 text-4xl font-bold">{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{item.description || 'No description available'}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-700">Rp {(item.price * 1000).toLocaleString()}</span>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded-full capitalize">
                        {item.category.toLowerCase()}
                      </span>
                    </div>
                    {user && !isAdmin() && (
                      <button
                        onClick={() => addToCart(item)}
                        className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Add to Cart
                      </button>
                    )}
                    {user && isAdmin() && (
                      <div className="mt-4 text-center py-2 text-sm text-gray-500">
                        Admin accounts cannot place orders
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-700">No menu items found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 