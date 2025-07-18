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

export default function QualifyLeads() {
  const [companyName, setCompanyName] = useState("");
  const [populated, setPopulated] = useState(false);
  const [results, setResults] = useState<{ item: string; status: string; reasoning: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    const savedCompanyName = localStorage.getItem('ql_companyName');
    const savedPopulated = localStorage.getItem('ql_populated');
    const savedResults = localStorage.getItem('ql_results');
    const savedError = localStorage.getItem('ql_error');
    
    if (savedCompanyName) setCompanyName(savedCompanyName);
    if (savedPopulated) setPopulated(savedPopulated === 'true');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch {}
    }
    if (savedError) setError(savedError);
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
    setPopulated(false);
    try {
      const response = await fetch("/api/qualify-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName.trim() }),
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
      const checklistResults = CHECKLIST.map((item) => {
        const result = output[item];
        if (result) {
          return {
            item,
            status: result.Pass ? "Pass" : "Fail",
            reasoning: result.Reasoning || "",
          };
        } else {
          return { item, status: "", reasoning: "" };
        }
      });
      setResults(checklistResults);
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
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-[#002B5C] to-[#004299] text-white font-sans pt-16">
      <div className="w-full max-w-5xl flex flex-col items-center px-4 py-16 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-5xl font-bold tracking-tight text-white text-center mb-4">Qualify Leads</h1>
          <p className="text-lg text-gray-200 text-center max-w-2xl">
            Qualify leads according to BBL criteria.
          </p>
        </div>
        <form ref={formRef} onSubmit={handleFormSubmit} className="w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col items-stretch p-8 gap-8 max-w-6xl mx-auto border border-white/20 relative">
          <div>
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
          </div>
         <div className="overflow-x-auto">
            <table className="min-w-full bg-white/5 rounded-2xl text-white border-separate border-spacing-0 shadow-lg" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th className="px-8 py-4 text-center font-semibold text-lg rounded-tl-2xl bg-white/10 w-[250px]">Line Item</th>
                  <th className="px-8 py-4 text-center font-semibold text-lg bg-white/10 whitespace-nowrap">Pass / Fail</th>
                  <th className="px-8 py-4 text-center font-semibold text-lg rounded-tr-2xl bg-white/10 w-[440px]">Reasoning & Sources</th>
                </tr>
              </thead>
              <tbody>
                {(populated ? results : CHECKLIST.map(item => ({ item, status: '', reasoning: '' }))).map((row, idx) => (
                  <tr key={row.item} className={
                    `border-t border-white/10 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/0'} hover:bg-white/10 transition-colors`
                  }>
                    <td className="px-8 py-5 font-medium align-top text-base">{row.item}</td>
                    <td className="px-8 py-5 align-top text-base">
                      {row.status ? (
                        <span className={`inline-block px-4 py-1 rounded-full font-semibold text-lg ${row.status === 'Fail' ? 'bg-red-500/20 text-red-200 border border-red-400/30' : 'bg-green-500/20 text-green-200 border border-green-400/30'}`}>{row.status}</span>
                      ) : (
                        <div className="h-8" />
                      )}
                    </td>
                    <td className="px-8 py-5 align-top text-base w-[440px]">
                      {row.reasoning ? (
                        <span className="block text-white/90 leading-relaxed">
                          {row.reasoning.split(' ').map((word, index) => {
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
                          })}
                        </span>
                      ) : (
                        <div className="h-8 w-full" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200 text-center text-base font-medium mt-6">
              {error}
            </div>
          )}

        </form>
      </div>
      <div className="fixed z-50 bottom-8 right-8 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handlePopulate}
        disabled={!companyName.trim() || loading}
        className="flex justify-center items-center bg-white text-[#002B5C] py-4 px-10 rounded-full font-semibold text-xl shadow-2xl hover:bg-gray-50 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[#002B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ minWidth: '240px', height: '64px' }} // ensures consistent height
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-[#002B5C] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Loading...
          </>
        ) : (
          'Populate'
        )}
      </button>
      </div>
    </div>
  );
} 