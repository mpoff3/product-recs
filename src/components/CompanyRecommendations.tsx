'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { parseFiles } from '../utils/parseFiles';

export default function CompanyRecommendations() {
  const [companyName, setCompanyName] = useState('');
  const [recommendations, setRecommendations] = useState<{ output_EN: string; output_TH: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isThaiLanguage, setIsThaiLanguage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setFiles(prevFiles => {
        const newFiles = Array.from(fileList);
        // Avoid duplicates by file name
        const existingNames = new Set(prevFiles.map(f => f.name));
        const filteredNewFiles = newFiles.filter(f => !existingNames.has(f.name));
        return [...prevFiles, ...filteredNewFiles];
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }
    setIsLoading(true);
    setError('');
    setRecommendations(null);
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
      const response = await fetch('http://135.224.174.121:5678/webhook/product-recs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName, docs: docs }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();
      let recommendationsData = null;
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length === 2) {
          // New format: array with two objects, first has Thai output, second has English output
          const thaiObj = parsed[0];
          const englishObj = parsed[1];
          recommendationsData = {
            output_TH: thaiObj.output || '',
            output_EN: englishObj.output || ''
          };
        } else if (parsed && typeof parsed === 'object' && parsed.output) {
          // Fallback for old format
          recommendationsData = { output_EN: parsed.output, output_TH: parsed.output };
        } else {
          // Fallback for plain text
          recommendationsData = { output_EN: data, output_TH: data };
        }
      } catch (err) {
        // Not JSON, use as-is for both languages
        recommendationsData = { output_EN: data, output_TH: data };
      }
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-[#002B5C] to-[#004299] text-white font-sans pt-16">
      <div className="w-full max-w-5xl flex flex-col items-center px-4 py-16 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-5xl font-bold tracking-tight text-white text-center mb-4">Product Recommendations</h1>
          <p className="text-lg text-gray-200 text-center">
            AI-powered product recommendations tailored to your business needs
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col items-stretch p-8 gap-8 max-w-4xl mx-auto border border-white/20">
            <div>
              <label htmlFor="companyName" className="text-lg font-medium text-white mb-3 block">Company Name</label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-xl font-medium text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
                autoFocus
                aria-label="Company Name"
                onKeyDown={e => { if (e.key === 'Enter') { handleSubmit(); } }}
              />
            </div>
            
            <div>
              <label htmlFor="docs" className="text-lg font-medium text-white mb-3 block">Upload Documents</label>
              <div className="relative w-full">
                <label
                  htmlFor="docs"
                  className="w-full flex items-center justify-center text-white bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-lg transition-all hover:bg-white/10 cursor-pointer"
                >
                  Select File(s)
                </label>
                <input
                  type="file"
                  id="docs"
                  accept=".pdf,.docx,.xlsx"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={isLoading}
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="text-white text-sm">
                <strong className="font-medium">Files:</strong>
                <ul className="mt-2 space-y-2">
                  {files.map((f, idx) => (
                    <li key={f.name + idx} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                      <span className="truncate max-w-xs" title={f.name}>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="ml-3 text-red-300 hover:text-red-200 font-medium px-2 py-0.5 rounded focus:outline-none"
                        aria-label={`Remove ${f.name}`}
                        disabled={isLoading}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200 text-center text-base font-medium">
                {error}
              </div>
            )}
          </div>
        </form>

        {recommendations && (
          <div className="w-full mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recommended Products</h2>
              <div className="flex items-center gap-3">
                <span className="text-white/90 font-medium">Thai</span>
                <button
                  onClick={() => setIsThaiLanguage(!isThaiLanguage)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/25 ${
                    isThaiLanguage ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      isThaiLanguage ? 'translate-x-6 bg-[#002B5C]' : 'translate-x-1 bg-white'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="text-white prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {isThaiLanguage ? recommendations.output_TH : recommendations.output_EN}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !companyName.trim()}
        className="fixed z-50 bottom-8 right-8 flex items-center gap-2 bg-white text-[#002B5C] py-4 px-10 rounded-full font-semibold text-xl shadow-2xl hover:bg-gray-50 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[#002B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ minWidth: '240px' }}
      >
        {isLoading && (
          <svg className="animate-spin h-6 w-6 text-[#002B5C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {isLoading ? 'Loading...' : 'Get Recommendations'}
      </button>
    </div>
  );
} 