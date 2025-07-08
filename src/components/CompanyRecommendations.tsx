'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { parseFiles } from '../utils/parseFiles';

export default function CompanyRecommendations() {
  const [companyName, setCompanyName] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }
    setIsLoading(true);
    setError('');
    setRecommendations('');
    let docs = '';
    if (files.length > 0) {
      try {
        docs = await parseFiles(files);
      } catch (err) {
        setError('Error parsing uploaded files.');
        setIsLoading(false);
        return;
      }
    }
    try {
      const response = await fetch('https://mpoff3.app.n8n.cloud/webhook/product-recs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName, docs }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();
      let displayText = data;
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object' && parsed.output) {
          displayText = parsed.output;
        }
      } catch (err) {
        // Not JSON, use as-is
      }
      setRecommendations(displayText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-white font-sans relative" style={{ backgroundColor: '#0047AB' }}>
      <div className="w-full max-w-5xl flex flex-col items-center px-2 pt-12 pb-8 mx-auto">
        <div className="mb-8 flex flex-col items-center">
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white text-center drop-shadow-lg">BBL Product Recommendation Engine</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl shadow-2xl flex flex-col items-stretch px-12 py-10 gap-6 max-w-4xl mx-auto">
            <label htmlFor="companyName" className="text-lg font-semibold text-[#1A237E] mb-2">Company Name</label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full text-[#1A237E] bg-blue-50 border border-blue-200 rounded-xl py-4 px-6 text-xl font-medium focus:ring-2 focus:ring-[#3949AB] focus:border-[#3949AB] outline-none transition-colors placeholder-blue-300 shadow-sm"
              disabled={isLoading}
              autoFocus
              aria-label="Company Name"
              onKeyDown={e => { if (e.key === 'Enter') { handleSubmit(); } }}
            />
            <label htmlFor="docs" className="text-lg font-semibold text-[#1A237E] mt-4">Upload Documents (Word, PDF, Excel)</label>
            <input
              type="file"
              id="docs"
              accept=".pdf,.docx,.xlsx"
              multiple
              onChange={handleFileChange}
              className="w-full text-[#1A237E] bg-blue-50 border border-blue-200 rounded-xl py-2 px-4 text-base focus:ring-2 focus:ring-[#3949AB] focus:border-[#3949AB] outline-none transition-colors placeholder-blue-300 shadow-sm"
              disabled={isLoading}
            />
            {files.length > 0 && (
              <div className="text-[#1A237E] text-sm mt-2">
                <strong>Files:</strong> {files.map(f => f.name).join(', ')}
              </div>
            )}
            {error && (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-center text-base font-medium shadow-sm animate-pulse mt-2">
                {error}
              </div>
            )}
          </div>
        </form>
        {recommendations && (
          <div className="w-full mt-8 bg-white/90 border border-blue-200 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1A237E] mb-6 text-center">Recommended Products</h2>
            <div className="text-[#1A237E] text-left">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-[#1A237E]">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6 text-[#1A237E]">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-[#1A237E]">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 text-[#1A237E] leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-[#1A237E]">{children}</strong>,
                  em: ({ children }) => <em className="italic text-[#1A237E]">{children}</em>,
                }}
              >
                {recommendations}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !companyName.trim()}
        className="fixed z-50 bottom-8 right-8 flex items-center gap-2 bg-[#1A237E] hover:bg-[#283593] text-white py-4 px-10 rounded-2xl font-bold text-xl shadow-2xl focus:ring-2 focus:ring-[#3949AB] focus:ring-offset-2 disabled:bg-blue-200 disabled:cursor-not-allowed transition-all"
        style={{ minWidth: '240px' }}
      >
        {isLoading && (
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {isLoading ? 'Loading...' : 'Get Recommendations'}
      </button>
    </div>
  );
} 