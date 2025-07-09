'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed w-full z-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <img
                    src="/bbl-logo.png"
                    alt="Bangkok Bank Logo"
                    className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-[#002B5C] text-lg font-medium tracking-tight">Bangkok Bank</span>
              </Link>
            </div>

            <div className="flex space-x-1 -ml-32">
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

            <div className="w-10">
              {/* Placeholder for spacing */}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
} 