"use client";

import { useState, useRef } from "react";

const CHECKLIST = [
  "Revenue Growth (Year-over-Year > 5%)",
  "EBITDA Margin ≥ 15%",
  "Debt Service Coverage Ratio (DSCR) ≥ 1.25x",
  "Leverage Ratio (Debt/Equity) ≤ 2.0x",
  "3 Years of Audited Financial Statements Available",
  "Positive Operating Cash Flow for Past 2 Years",
];

function getMockChecklistResults(companyName: string) {
  // Alternate Fail/Pass for demo, with plausible explanations
  return CHECKLIST.map((item, idx) => {
    const status = idx % 2 === 0 ? "Fail" : "Pass";
    let reasoning = "";
    if (status === "Fail") {
      reasoning = `Based on the available financial data for ${companyName}, this criterion is not met. Recent trends or ratios do not satisfy the benchmark, indicating a potential area of concern. Further review of the company's financials is recommended to assess the underlying causes.`;
    } else {
      reasoning = `The analysis of ${companyName}'s financial statements indicates that this criterion is met. The company meets or exceeds the required benchmark, suggesting sound financial management in this area.`;
    }
    return { item, status, reasoning };
  });
}

export default function QualifyLeads() {
  const [companyName, setCompanyName] = useState("");
  const [populated, setPopulated] = useState(false);
  const [results, setResults] = useState<{ item: string; status: string; reasoning: string }[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const handlePopulate = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    const unsorted = getMockChecklistResults(companyName.trim());
    // Sort so Fail first, then Pass
    const sorted = [...unsorted].sort((a, b) => (a.status === b.status ? 0 : a.status === "Fail" ? -1 : 1));
    setResults(sorted);
    setPopulated(true);
  };

  // Reset checklist if company name changes
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
    setPopulated(false);
    setResults([]);
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
          <label className="text-2xl font-semibold text-white mb-6 text-center block tracking-tight">Condensed Financial Underwriting Checklist</label>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/5 rounded-2xl text-white border-separate border-spacing-0 shadow-lg" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th className="px-8 py-4 text-left font-semibold text-lg rounded-tl-2xl bg-white/10">Line Item</th>
                  <th className="px-8 py-4 text-left font-semibold text-lg bg-white/10 whitespace-nowrap">Pass / Fail</th>
                  <th className="px-8 py-4 text-left font-semibold text-lg rounded-tr-2xl bg-white/10 w-[440px]">Reasoning</th>
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
                        <span className="block text-white/90 leading-relaxed">{row.reasoning}</span>
                      ) : (
                        <div className="h-8 w-full" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </div>
      <div className="fixed z-50 bottom-8 right-8 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handlePopulate}
          disabled={!companyName.trim()}
          className="flex items-center gap-2 bg-white text-[#002B5C] py-4 px-10 rounded-full font-semibold text-xl shadow-2xl hover:bg-gray-50 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[#002B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ minWidth: '240px' }}
        >
          Populate
        </button>
      </div>
    </div>
  );
} 