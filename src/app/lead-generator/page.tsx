export default function LeadGenerator() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-white font-sans relative" style={{ backgroundColor: '#0047AB' }}>
      <div className="w-full max-w-5xl flex flex-col items-center px-2 pt-12 pb-8 mx-auto">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-4">
            <img
              src="/bbl-logo.png"
              alt="Bangkok Bank Logo"
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-4xl font-extrabold tracking-tight text-white text-center drop-shadow-lg">BBL Lead Generator</h1>
          </div>
        </div>
        <div className="w-full bg-white rounded-2xl shadow-2xl flex flex-col items-stretch px-12 py-10 gap-6 max-w-4xl mx-auto">
          <p className="text-[#1A237E] text-center">Lead Generator coming soon...</p>
        </div>
      </div>
    </div>
  );
} 