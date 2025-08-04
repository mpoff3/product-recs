'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { parseFiles } from '../utils/parseFiles';
import { downloadRecommendationsAsPDF } from '../utils/pdfGenerator';
import React from 'react'; // Added missing import for React.Children.map

// Add this helper function for rendering text with clickable links
const renderTextWithLinks = (text: string) => {
  // Use a more comprehensive regex to find URLs within text
  const urlRegex = /(\(?)(https?:\/\/[^\s)]+)(\)?)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the URL as a link
    const [, openParen, url, closeParen] = match;
    parts.push(
      <a
        key={`url-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 hover:text-blue-200 underline break-all"
      >
        {openParen}{url}{closeParen}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

// --- Feedback UI ---
const ThumbsUpIcon = ({ selected }: { selected: boolean }) => (
  <span
    className={`inline-block text-2xl align-middle transition-colors ${selected ? 'text-green-400' : 'text-gray-400'}`}
    role="img"
    aria-label="Good Recommendation"
  >
    👍
  </span>
);
const ThumbsDownIcon = ({ selected }: { selected: boolean }) => (
  <span
    className={`inline-block text-2xl align-middle transition-colors ${selected ? 'text-red-400' : 'text-gray-400'}`}
    role="img"
    aria-label="Bad Recommendation"
  >
    👎
  </span>
);

function RecommendationItem({ markdown, index, companyName }: { markdown: string; index: number; companyName: string }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendFeedback = async (context: string, thumbsUp: boolean, notes: string = '', system: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          thumbsUp,
          notes,
          system,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send feedback.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleThumb = (dir: 'up' | 'down') => {
    setFeedback(dir);
    const context = `${companyName ? 'Company: ' + companyName + ' | ' : ''}${markdown}`;
    if (dir === 'down') {
      setShowInput(true);
    } else {
      setShowInput(false);
      setSubmitted(false);
      sendFeedback(context, true, '', 'product-recs');
    }
  };
  const handleSend = () => {
    setSubmitted(false);
    setShowInput(false);
    const context = `${companyName ? 'Company: ' + companyName + ' | ' : ''}${markdown}`;
    sendFeedback(context, false, input, 'product-recs');
  };

  return (
    <div className="mb-8 pb-8 border-b border-white/10 last:border-b-0 last:mb-0 last:pb-0">
      <div className="text-white prose prose-invert max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-a:text-blue-300 prose-ul:text-white prose-li:text-white">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">
                {children}
              </h2>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed">
                {React.Children.map(children, (child) =>
                  typeof child === 'string' ? renderTextWithLinks(child) : child
                )}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">
                {React.Children.map(children, (child) =>
                  typeof child === 'string' ? renderTextWithLinks(child) : child
                )}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic">
                {React.Children.map(children, (child) =>
                  typeof child === 'string' ? renderTextWithLinks(child) : child
                )}
              </em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4 marker:text-white">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed pl-2">
                {React.Children.map(children, (child) =>
                  typeof child === 'string' ? renderTextWithLinks(child) : child
                )}
              </li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline break-all"
              >
                {children}
              </a>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
      <div className="flex items-center gap-6 mt-2">
        <button
          type="button"
          className={`flex items-center gap-1 focus:outline-none px-3 py-2 rounded-lg transition-all ${
            feedback === 'up' 
              ? 'bg-green-500/20 border border-green-400/30' 
              : 'hover:bg-white/10'
          }`}
          onClick={() => handleThumb('up')}
          aria-label="Good Recommendation"
          disabled={loading || submitted}
        >
          <ThumbsUpIcon selected={feedback === 'up'} />
          <span className={`ml-1 text-sm font-medium transition-colors ${
            feedback === 'up' ? 'text-green-200 font-semibold' : 'text-white/80'
          }`}>Good Recommendation</span>
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 focus:outline-none px-3 py-2 rounded-lg transition-all ${
            feedback === 'down' 
              ? 'bg-red-500/20 border border-red-400/30' 
              : 'hover:bg-white/10'
          }`}
          onClick={() => handleThumb('down')}
          aria-label="Bad Recommendation"
          disabled={loading || submitted}
        >
          <ThumbsDownIcon selected={feedback === 'down'} />
          <span className={`ml-1 text-sm font-medium transition-colors ${
            feedback === 'down' ? 'text-red-200 font-semibold' : 'text-white/80'
          }`}>Bad Recommendation</span>
        </button>
      </div>
      {feedback === 'down' && showInput && !submitted && (
        <div className="mt-3">
          <label htmlFor={`feedback-input-${index}`} className="block text-sm text-white/70 mb-1">Tell us why (optional):</label>
          <div className="flex items-center gap-2">
            <input
              id={`feedback-input-${index}`}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="border border-white/20 bg-white/10 p-2 rounded w-full max-w-md text-sm text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
              placeholder="Your feedback..."
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSend}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded transition-all"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-3 text-red-200 text-sm font-medium">{error}</div>
      )}
      {submitted && !error && (
        <div className="mt-3 text-green-200 text-sm font-medium">Thanks for your feedback.</div>
      )}
    </div>
  );
}

// --- Helper to split recommendations ---
function splitRecommendations(markdown: string): string[] {
  // Split on markdown headers (##) followed by numbers 1-10 and a dot
  const sections = markdown.split(/(?=\n##\s*(?:[1-9]|10)\.\s+)/);
  
  if (sections.length <= 1) {
    // No numbered sections found, return the whole text as one item
    return [markdown];
  }

  
  // Filter out empty sections and return
  return sections.map(section => section.trim()).filter(Boolean);
}

export default function ProductRecommendations() {
  const [companyName, setCompanyName] = useState('');
  const [recommendations, setRecommendations] = useState<{ output_EN: string; output_TH: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isThaiLanguage, setIsThaiLanguage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    const savedCompanyName = localStorage.getItem('pr_companyName');
    const savedRecommendations = localStorage.getItem('pr_recommendations');
    const savedIsThaiLanguage = localStorage.getItem('pr_isThaiLanguage');
    if (savedCompanyName) setCompanyName(savedCompanyName);
    if (savedRecommendations) setRecommendations(JSON.parse(savedRecommendations));
    if (savedIsThaiLanguage) setIsThaiLanguage(savedIsThaiLanguage === 'true');
  }, []);

  // Persist state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pr_companyName', companyName);
  }, [companyName]);
  useEffect(() => {
    if (recommendations) {
      localStorage.setItem('pr_recommendations', JSON.stringify(recommendations));
    } else {
      localStorage.removeItem('pr_recommendations');
    }
  }, [recommendations]);
  useEffect(() => {
    localStorage.setItem('pr_isThaiLanguage', isThaiLanguage.toString());
  }, [isThaiLanguage]);

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

  const downloadAsPDF = async () => {
    if (!recommendations) return;
    
    setIsDownloading(true);
    try {
      await downloadRecommendationsAsPDF({
        companyName,
        recommendations,
        isThaiLanguage,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
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
    setRecommendations(null);
    let docs = '';
    if (files.length > 0) {
      try {
        docs = await parseFiles(files);
      } catch {
        setError('Error parsing uploaded files.');
        setIsLoading(false);
        return;
      }
    }
    try {
      const response = await fetch('/api/product-recs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName, docs: docs }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      const data = responseData.data;
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
      } catch {
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
    <div className="min-h-screen w-full flex flex-col items-center bg-[#1A47B8] text-white font-sans pt-16">
      <div className="w-full max-w-5xl flex flex-col items-center px-4 py-16 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-5xl font-bold tracking-tight text-white text-center mb-4">Product Recommendations</h1>
          <p className="text-lg text-gray-200 text-center">
            AI-powered BBL product recommendations specific to a company&apos;s needs
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
              <div className="flex items-center gap-4">
                <button
                  onClick={downloadAsPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white px-4 py-2 rounded-lg transition-all font-medium border border-white/20 hover:border-white/30 disabled:border-white/10"
                >
                  {isDownloading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
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
            </div>
            {/* Render each recommendation with feedback */}
            <div>
              {(() => {
                const sections = splitRecommendations(isThaiLanguage ? recommendations.output_TH : recommendations.output_EN);
                console.log(sections);
                return (
                  <>
                    <div className="text-white mb-6">
                      <em className="text-gray-300">In order of priority</em>
                    </div>
                    {splitRecommendations(isThaiLanguage ? recommendations.output_TH : recommendations.output_EN).map((rec, idx) => (
                      <RecommendationItem key={idx} markdown={rec} index={idx} companyName={companyName} />
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="fixed z-50 bottom-8 right-8 flex flex-col items-end gap-2">
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 text-white text-sm font-medium border border-white/20">
            This may take a couple minutes...
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !companyName.trim()}
          className="flex items-center gap-2 bg-white text-[#002B5C] py-4 px-10 rounded-full font-semibold text-xl shadow-2xl hover:bg-gray-50 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[#002B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
    </div>
  );
} 