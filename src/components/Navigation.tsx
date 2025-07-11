'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full z-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/bbl-logo.png"
                    alt="Bangkok Bank Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-[#002B5C] text-lg font-medium tracking-tight hidden sm:inline">Bangkok Bank</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden xl:flex space-x-1 -ml-32">
              <Link
                href="/lead-generator"
                className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 relative group ${
                  pathname === '/lead-generator'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
              >
                <span className="relative z-10">1. Find Leads</span>
              </Link>
              <Link
                href="/qualify-leads"
                className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 relative group ${
                  pathname === '/qualify-leads'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
              >
                <span className="relative z-10">2. Qualify Leads</span>
              </Link>
              <Link
                href="/"
                className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 relative group ${
                  pathname === '/'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
              >
                <span className="relative z-10">3. Get Product Recommendations</span>
              </Link>
              <Link
                href="/product-chatbot"
                className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 relative group ${
                  pathname === '/product-chatbot'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
              >
                <span className="relative z-10">4. Ask Followup Questions</span>
              </Link>
            </div>

            {/* Hamburger for mobile */}
            <div className="flex xl:hidden items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-[#002B5C] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#002B5C]"
                aria-label="Open main menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            <div className="w-10 hidden xl:block">{/* Placeholder for spacing */}</div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white shadow-md border-t border-gray-100">
            <div className="flex flex-col px-4 py-2 space-y-1">
              <Link
                href="/lead-generator"
                className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  pathname === '/lead-generator'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                1. Find Leads
              </Link>
              <Link
                href="/qualify-leads"
                className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  pathname === '/qualify-leads'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                2. Qualify Leads
              </Link>
              <Link
                href="/"
                className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  pathname === '/'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                3. Get Product Recommendations
              </Link>
              <Link
                href="/product-chatbot"
                className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  pathname === '/product-chatbot'
                    ? 'text-[#002B5C] bg-gray-100'
                    : 'text-gray-600 hover:text-[#002B5C] hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                4. Ask Followup Questions
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 