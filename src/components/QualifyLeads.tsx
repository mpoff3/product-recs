"use client";

import { useState, useRef, useEffect } from "react";

const CHECKLIST = [
  "Revenue Growth (Year-over-Year > 5%)",
  "EBITDA Margin >= 15%",
  "Debt Service Coverage Ratio (DSCR) >= 1.25x",
  "Leverage Ratio (Debt/Equity) <= 2.0x",
  "3 Years of Audited Financial Statements Available",
  "Positive Operating Cash Flow for Past 2 Years",
];

// Add this above the component definition for the animated ellipsis
const BouncingEllipsis = () => (
  <span className="inline-block align-middle">
    <span className="dot-bounce">.</span>
    <span className="dot-bounce" style={{ animationDelay: '0.2s' }}>.</span>
    <span className="dot-bounce" style={{ animationDelay: '0.4s' }}>.</span>
  </span>
);

// Add this helper function just below the BouncingEllipsis definition
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    // Replace common unicode comparison / multiplication symbols with ASCII equivalents
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/×/g, "x")
    // Remove all whitespace and common punctuation that should not affect matching
    .replace(/\s+/g, "")
    .replace(/[()%]/g, "")
    .replace(/%/g, "");
};

export default function QualifyLeads() {
  const [companyName, setCompanyName] = useState("");
  const [populated, setPopulated] = useState(false);
  // Change the type of results to allow both legacy and new backend result shapes
  const [results, setResults] = useState<Array<
    { item: string; status: string; reasoning: string } |
    { Name: string; Pass: boolean; Reasoning: string }
  >>([]);
  const [companyOverview, setCompanyOverview] = useState("");
  const [editableLineItems, setEditableLineItems] = useState(CHECKLIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lineItemColumnWidth, setLineItemColumnWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    const savedCompanyName = localStorage.getItem('ql_companyName');
    const savedPopulated = localStorage.getItem('ql_populated');
    const savedResults = localStorage.getItem('ql_results');
    const savedCompanyOverview = localStorage.getItem('ql_companyOverview');
    const savedEditableLineItems = localStorage.getItem('ql_editableLineItems');
    const savedError = localStorage.getItem('ql_error');
    
    if (savedCompanyName) setCompanyName(savedCompanyName);
    if (savedPopulated) setPopulated(savedPopulated === 'true');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch {}
    }
    if (savedCompanyOverview) setCompanyOverview(savedCompanyOverview);
    if (savedEditableLineItems) {
      try {
        setEditableLineItems(JSON.parse(savedEditableLineItems));
      } catch {}
    }
    if (savedError) setError(savedError);
    
    const savedLineItemColumnWidth = localStorage.getItem('ql_lineItemColumnWidth');
    if (savedLineItemColumnWidth) {
      setLineItemColumnWidth(parseInt(savedLineItemColumnWidth));
    }
  }, []);

  // Persist state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('ql_companyName', companyName);
  }, [companyName]);
  
  useEffect(() => {
    localStorage.setItem('ql_populated', populated.toString());
  }, [populated]);
  
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('ql_results', JSON.stringify(results));
    } else {
      localStorage.removeItem('ql_results');
    }
  }, [results]);

  useEffect(() => {
    if (companyOverview) {
      localStorage.setItem('ql_companyOverview', companyOverview);
    } else {
      localStorage.removeItem('ql_companyOverview');
    }
  }, [companyOverview]);
  
  useEffect(() => {
    if (editableLineItems.length > 0) {
      localStorage.setItem('ql_editableLineItems', JSON.stringify(editableLineItems));
    } else {
      localStorage.removeItem('ql_editableLineItems');
    }
  }, [editableLineItems]);
  
  useEffect(() => {
    localStorage.setItem('ql_lineItemColumnWidth', lineItemColumnWidth.toString());
  }, [lineItemColumnWidth]);

  useEffect(() => {
    if (error) {
      localStorage.setItem('ql_error', error);
    } else {
      localStorage.removeItem('ql_error');
    }
  }, [error]);

  const handlePopulate = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!companyName.trim()) return;
    setLoading(true);
    setResults([]);
    setCompanyOverview("");
    setPopulated(false);
    try {
      const response = await fetch("/api/qualify-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          company: companyName.trim(),
          lineItems: editableLineItems 
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      let data;
      try {
        data = JSON.parse(responseData.data);
      } catch {
        throw new Error("Invalid response format from backend");
      }
      // data is expected to be an array with one object with an 'output' field
      const output = data[0]?.output || {};
      
      // Extract company overview
      setCompanyOverview(output["Company Overview"] || "");
      
      // Process checklist results: just use the backend's Line Items directly
      const lineItemsResults = Array.isArray(output["Line Items"]) ? output["Line Items"] : [];
      setResults(lineItemsResults);
      setPopulated(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching results.");
    } finally {
      setLoading(false);
    }
  };

  // Reset checklist if company name changes
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
    setPopulated(false);
    setResults([]);
    setCompanyOverview("");
    setError("");
    // Do NOT clear localStorage here; only clear on explicit reset
  };

  const handleLineItemChange = (index: number, value: string) => {
    const newLineItems = [...editableLineItems];
    newLineItems[index] = value;
    setEditableLineItems(newLineItems);
  };

  const handleAddRow = () => {
    setEditableLineItems([...editableLineItems, "New Criteria"]);
  };

  const handleDeleteRow = (index: number) => {
    const newLineItems = editableLineItems.filter((_, idx) => idx !== index);
    setEditableLineItems(newLineItems);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(200, Math.min(600, e.clientX - 100)); // Min 200px, Max 600px
      setLineItemColumnWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const renderTextWithLinks = (text: string) => {
    return text.split(' ').map((word, index) => {
      // Detect URLs with optional leading '(' and optional trailing punctuation like ')' or ').', etc.
      const match = word.match(/^(\(?)(https?:\/\/[^\s)]+)(\)?)?([.,;!?)]?)/);
      if (match && match[2]) {
        const [, openParen, url, closeParen, trailing] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 underline break-all"
          >
            {openParen}{url}{closeParen}{trailing}{' '}
          </a>
        );
      }
      return word + ' ';
    });
  };

  // Add a function to reset all ql_... state and localStorage
  const handleReset = () => {
    // Clear all ql_... keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('ql_')) {
        localStorage.removeItem(key);
      }
    });
    setCompanyName("");
    setPopulated(false);
    setResults([]);
    setCompanyOverview("");
    setEditableLineItems(CHECKLIST);
    setLoading(false);
    setError("");
    setLineItemColumnWidth(300);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-[#002B5C] to-[#004299] text-white font-sans pt-16">
      <div className="w-full max-w-7xl flex flex-col items-center px-4 py-16 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-5xl font-bold tracking-tight text-white text-center mb-4">Qualify Leads</h1>
          <p className="text-lg text-gray-200 text-center max-w-2xl">
            Qualify leads according to BBL criteria.
          </p>
        </div>

        {/* Instructional Box and Input Form - Side by Side */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Instructional Box */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How this works:</h3>
                <div className="space-y-1 text-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">1</span>
                    <span>Enter a company name.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">2</span>
                    <span>Add, remove, or adjust criteria, then click 'Populate'.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">3</span>
                    <span>The system populates table and provides a company overview.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <form ref={formRef} onSubmit={handleFormSubmit}>
              <label htmlFor="companyName" className="text-lg font-medium text-white mb-3 block">Company Name</label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={handleCompanyNameChange}
                placeholder="e.g., Acme Corporation"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-xl font-medium text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                autoFocus
                aria-label="Company Name"
              />
            </form>
          </div>
        </div>

        {/* Blank Table - Always Visible, now also shows results */}
        <div className="w-full max-w-7xl mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Qualification Criteria</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white/5 rounded-xl text-white border-separate border-spacing-0 shadow-lg">
                <thead>
                  <tr>
                    <th 
                      className="px-4 py-3 text-center font-semibold text-sm rounded-tl-xl bg-white/10 relative"
                      style={{ width: `${lineItemColumnWidth}px` }}
                    >
                      Line Item
                      <div
                        className="absolute top-0 right-0 bottom-0 w-1 bg-white/20 hover:bg-white/40 cursor-col-resize"
                        onMouseDown={handleMouseDown}
                        title="Drag to resize column"
                      />
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-sm bg-white/10 whitespace-nowrap w-[200px]">Pass / Fail</th>
                    <th className="px-4 py-3 text-center font-semibold text-sm rounded-tr-xl bg-white/10">Reasoning & Sources</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && results.length === 0 ? (
                    editableLineItems.map((item, idx) => (
                      <tr key={idx} className={`border-t border-white/10 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/0'} hover:bg-white/10 transition-colors`}>
                        <td className="px-4 py-3 font-medium align-top text-sm">
                          <div className="flex items-start space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              className="flex-shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 rounded-lg p-2 transition-colors"
                              title="Delete row"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <textarea
                              value={item}
                              onChange={(e) => handleLineItemChange(idx, e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-base text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all resize-none"
                              placeholder={item}
                              rows={2}
                              style={{ minHeight: '60px' }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-base text-white/90 text-center">
                          <div className="h-6" />
                        </td>
                        <td className="px-4 py-3 align-top text-base text-white/90">
                          <div className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : loading ? (
                    editableLineItems.map((item, idx) => (
                      <tr key={idx} className={`border-t border-white/10 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/0'} hover:bg-white/10 transition-colors`}>
                        <td className="px-4 py-3 font-medium align-top text-sm">
                          <span className="block text-white/90 leading-relaxed text-base">{item}</span>
                        </td>
                        <td className="px-4 py-3 align-top text-base text-white/90 text-center">
                          <BouncingEllipsis />
                        </td>
                        <td className="px-4 py-3 align-top text-base text-white/90">
                          <div className="flex justify-center"><BouncingEllipsis /></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    results.map((row, idx) => {
                      // row is expected to have keys: Name, Pass, Reasoning
                      const name = (row as any).Name || (row as any).item || '';
                      const passValue = (typeof (row as any).Pass === 'boolean') ? (row as any).Pass : ((row as any).status === 'Pass' || (row as any).status === 'true');
                      const reasoning = (row as any).Reasoning || (row as any).reasoning || '';
                      return (
                        <tr key={idx} className={`border-t border-white/10 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/0'} hover:bg-white/10 transition-colors`}>
                          <td className="px-4 py-3 font-medium align-top text-sm">
                            <span className="block text-white/90 leading-relaxed text-base">{name}</span>
                          </td>
                          <td className="px-4 py-3 align-top text-base text-white/90 text-center">
                            {typeof passValue === 'boolean' ? (
                              <span className={`inline-block px-3 py-1 rounded-full font-semibold text-base ${passValue ? 'bg-green-500/20 text-green-200 border border-green-400/30' : 'bg-red-500/20 text-red-200 border border-red-400/30'}`}>{passValue ? 'Pass' : 'Fail'}</span>
                            ) : (
                              <div className="h-6" />
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-base text-white/90">
                            {reasoning ? (
                              <span className="block text-white/90 leading-relaxed text-base">
                                {renderTextWithLinks(reasoning)}
                              </span>
                            ) : (
                              <div className="h-6 w-full" />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-center">
                {!(populated || loading) && (
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-200 hover:text-green-100 rounded-lg px-4 py-2 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Row</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Company Overview - now below the table */}
        <div className="w-full max-w-7xl bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Company Overview</h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-200 mb-2">{companyName}</h3>
          </div>
          {loading ? (
            <BouncingEllipsis />
          ) : results.length > 0 ? (
            companyOverview && (
              <div className="text-white/90 leading-relaxed space-y-4">
                {companyOverview.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-base">
                    {renderTextWithLinks(paragraph)}
                  </p>
                ))}
              </div>
            )
          ) : (
            <div className="text-white/60 italic text-base">The company overview will appear here after you click Populate.</div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-4xl bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200 text-center text-base font-medium mt-6">
            {error}
          </div>
        )}
      </div>

      {/* Fixed Populate/Reset Button */}
      <div className="fixed z-50 bottom-8 right-8 flex flex-col items-end gap-2">
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 text-white text-sm font-medium border border-white/20">
            This may take a couple minutes...
          </div>
        )}
        <button
          type="button"
          onClick={populated ? handleReset : handlePopulate}
          disabled={(!companyName.trim() && !populated) || loading}
          className="flex justify-center items-center bg-white text-[#002B5C] py-4 px-10 rounded-full font-semibold text-xl shadow-2xl hover:bg-gray-50 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[#002B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ minWidth: '240px', height: '64px' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-[#002B5C] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Researching...
            </>
          ) : populated ? 'Reset' : 'Populate'}
        </button>
      </div>

      {/* Bouncing ellipsis animation styles */}
      <style jsx global>{`
        .dot-bounce {
          display: inline-block;
          animation: dot-bounce 1s infinite both;
          font-size: 1.5em;
          line-height: 1;
          color: #fff;
          opacity: 0.7;
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
} 