import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSessionId } from '../utils/session';

export default function ProductChatbot() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hello! I'm your Bangkok Bank Product Assistant. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          user_message: userMessage,
        }),
      });
      const responseData = await response.json();
      const dataText = responseData.data;
      let reply = '';
      try {
        const parsed = JSON.parse(dataText);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
          reply = parsed[0].output;
        } else if (parsed && typeof parsed === 'object' && parsed.output) {
          reply = parsed.output;
        } else {
          reply = dataText;
        }
      } catch {
        reply = dataText;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-[#002B5C] to-[#004299] text-white font-sans pt-16">
      <div className="w-full max-w-5xl flex flex-col items-center px-4 py-16 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-5xl font-bold tracking-tight text-white text-center mb-4">Product Chatbot</h1>
          <p className="text-lg text-gray-200 text-center">
            Chat with an AI expert on BBL products
          </p>
        </div>
        <div className="w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl max-w-4xl mx-auto border border-white/20 flex flex-col">
          {/* Chat Messages */}
          <div className="p-6 space-y-4 h-[400px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold mb-2 mt-4 text-white">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 mt-2 leading-relaxed text-white">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-white">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 mt-2 space-y-1 text-white">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-6 mb-4 mt-2 space-y-1 text-white">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-white">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="bg-white/10 px-1 py-0.5 rounded text-sm text-white">{children}</code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-white/10 p-3 rounded text-sm overflow-x-auto text-white mb-4 mt-2">{children}</pre>
                        ),
                        hr: () => (
                          <hr className="my-6 border-t-2 border-white/30" />
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6">
                            <table className="min-w-full border border-white/20 rounded-lg text-white bg-white/5">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-white/10">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => (
                          <tr className="border-b border-white/20 last:border-b-0">{children}</tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-2 font-bold text-left border-r border-white/20 last:border-r-0 bg-white/10">{children}</th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-2 border-r border-white/20 last:border-r-0">{children}</td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-4 py-2 text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-4">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                  }
                }}
                placeholder="Type your message here..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all resize-none min-h-[48px] max-h-[84px] leading-tight overflow-y-auto"
                disabled={isLoading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-white text-[#002B5C] px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 