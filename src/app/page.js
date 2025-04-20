'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from './page-layout';
import { FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await fetch('/api/menu?limit=4');
        if (response.ok) {
          const data = await response.json();
          setFeaturedItems(data.slice(0, 4)); // Limit to 4 items
        }
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative bg-amber-800 text-white">
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <Image 
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" 
            alt="Coffee shop background"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Experience the finest coffee
            </h1>
            <p className="mt-6 text-xl max-w-prose">
              Our carefully selected beans and skilled baristas create the perfect cup every time. 
              Join us for a delightful coffee experience.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/menu" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md bg-white text-amber-800 hover:bg-gray-100">
                Browse Menu
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-amber-700">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-amber-700 font-semibold tracking-wide uppercase">Featured Products</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Customer Favorites
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto">
              Discover our most popular coffee and food items that keep our customers coming back for more.
            </p>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-l-2 border-amber-600"></div>
              </div>
            ) : featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {featuredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48 w-full">
                      {item.imageUrl ? (
                        <Image 
                          src={item.imageUrl} 
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-800 text-2xl font-bold">{item.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-700 line-clamp-2">{item.description || 'No description available'}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-amber-700">Rp {(item.price * 1000).toLocaleString()}</span>
                        <span className="text-sm text-gray-700 capitalize">{item.category.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No featured items available</p>
              </div>
            )}

            <div className="mt-10 text-center">
              <Link href="/menu" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-800">
                View Full Menu
                <FiArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                About Our Coffee Shop
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Our coffee shop is dedicated to providing the highest quality coffee experience. 
                We source our beans from sustainable farms around the world and roast them to perfection.
              </p>
              <div className="mt-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-600 text-white">
                      {/* Icon */}
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg leading-6 font-medium text-gray-900">Quality Ingredients</h4>
                    <p className="mt-2 text-base text-gray-500">
                      We use only the finest ingredients in all our products.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-600 text-white">
                      {/* Icon */}
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg leading-6 font-medium text-gray-900">Fast Service</h4>
                    <p className="mt-2 text-base text-gray-500">
                      We pride ourselves on efficient service without compromising quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1513530176992-0cf39c4cbed4" 
                  alt="Coffee brewing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
