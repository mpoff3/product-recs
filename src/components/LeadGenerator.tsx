"use client";

export default function LeadGenerator() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-[#002B5C] to-[#004299] text-white font-sans pt-16">
      <div className="w-full max-w-5xl flex flex-col items-center px-4 py-16 mx-auto">
        <div className="mb-12 flex flex-col items-center text-center"> 
          <h1 className="text-5xl font-bold tracking-tight text-white text-center mb-4">Lead Generator</h1>
          <p className="text-lg text-gray-200 text-center max-w-2xl">
            Access the full Power BI dashboard view of prioritized leads.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <a
            href="https://app.powerbi.com/Redirect?action=OpenApp&appId=8a222b16-47df-455e-b48c-4939463870e3&ctid=ce5b721e-116b-4ff1-9fcf-c8b76f66d2c5&experience=power-bi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-white text-[#002B5C] text-lg font-semibold px-8 py-4 rounded-full shadow-2xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.293 3.293a1 1 0 011.414 0L18 7.586a1 1 0 010 1.414l-4.293 4.293a1 1 0 01-1.414-1.414L14.586 9H6a1 1 0 110-2h8.586l-2.293-2.293a1 1 0 010-1.414z" />
            </svg>
            Open Lead Generator Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
