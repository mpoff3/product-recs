'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  pathname === '/'
                    ? 'border-[#002B5C] text-[#002B5C]'
                    : 'border-transparent text-gray-500 hover:text-[#002B5C] hover:border-gray-300'
                }`}
              >
                Product Recommendation Engine
              </Link>
              <Link
                href="/lead-generator"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  pathname === '/lead-generator'
                    ? 'border-[#002B5C] text-[#002B5C]'
                    : 'border-transparent text-gray-500 hover:text-[#002B5C] hover:border-gray-300'
                }`}
              >
                Lead Generator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 