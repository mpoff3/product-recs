import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSessionId } from '../utils/session';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';

// --- Feedback UI ---
const ThumbsUpIcon = ({ selected }: { selected: boolean }) => (
  <span
    className={`inline-block text-xl align-middle transition-colors ${selected ? 'text-green-400' : 'text-gray-400'}`}
    role="img"
    aria-label="Good Response"
  >
    👍
  </span>
);
const ThumbsDownIcon = ({ selected }: { selected: boolean }) => (
  <span
    className={`inline-block text-xl align-middle transition-colors ${selected ? 'text-red-400' : 'text-gray-400'}`}
    role="img"
    aria-label="Bad Response"
  >
    👎
  </span>
);

function FeedbackBar({
  chatHistory,
  messageIndex,
}: {
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  messageIndex: number;
}) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Build context: all messages up to and including this AI message, with role labels
  const context = chatHistory
    .slice(0, messageIndex + 1)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const sendFeedback = async (thumbsUp: boolean, notes: string = '') => {
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
          system: 'product-chat',
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
    setSubmitted(false);
    if (dir === 'down') {
      setShowInput(true);
    } else {
      setShowInput(false);
      sendFeedback(true, '');
    }
  };
  const handleSend = () => {
    setShowInput(false);
    sendFeedback(false, input);
  };

  if (submitted && !error) {
    return (
      <div className="mt-2 text-green-200 text-xs font-medium">Thanks for your feedback.</div>
    );
  }
  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        type="button"
        className={`flex items-center gap-1 focus:outline-none px-2 py-1 rounded-lg transition-all text-xs ${
          feedback === 'up'
            ? 'bg-green-500/20 border border-green-400/30'
            : 'hover:bg-white/10'
        }`}
        onClick={() => handleThumb('up')}
        aria-label="Good Response"
        disabled={loading || submitted}
      >
        <ThumbsUpIcon selected={feedback === 'up'} />
        <span className={`ml-1 font-medium transition-colors ${
          feedback === 'up' ? 'text-green-200 font-semibold' : 'text-white/80'
        }`}>Good</span>
      </button>
      <button
        type="button"
        className={`flex items-center gap-1 focus:outline-none px-2 py-1 rounded-lg transition-all text-xs ${
          feedback === 'down'
            ? 'bg-red-500/20 border border-red-400/30'
            : 'hover:bg-white/10'
        }`}
        onClick={() => handleThumb('down')}
        aria-label="Bad Response"
        disabled={loading || submitted}
      >
        <ThumbsDownIcon selected={feedback === 'down'} />
        <span className={`ml-1 font-medium transition-colors ${
          feedback === 'down' ? 'text-red-200 font-semibold' : 'text-white/80'
        }`}>Bad</span>
      </button>
      {feedback === 'down' && showInput && !submitted && (
        <div className="ml-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border border-white/20 bg-white/10 p-1 rounded text-xs text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all w-40"
            placeholder="Tell us why (optional)"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded transition-all"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
      {error && (
        <div className="ml-2 text-red-200 text-xs font-medium">{error}</div>
      )}
    </div>
  );
}

export default function ProductChatbot() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbot_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [
      {
        role: 'assistant',
        content: "Hello! I'm your Bangkok Bank Product Assistant. How can I help you today?",
      },
    ];
  });
  const [inputMessage, setInputMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbot_input');
      if (saved) return saved;
    }
    return '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist chat history and input to localStorage when changed
  useEffect(() => {
    localStorage.setItem('chatbot_messages', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem('chatbot_input', inputMessage);
  }, [inputMessage]);

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

  // Helper to reset chat
  const resetChat = () => {
    const welcome: { role: 'assistant'; content: string }[] = [
      { role: 'assistant', content: "Hello! I'm your Bangkok Bank Product Assistant. How can I help you today?" }
    ];
    setMessages(welcome);
    setInputMessage('');
    localStorage.setItem('chatbot_messages', JSON.stringify(welcome));
    localStorage.setItem('chatbot_input', '');
    // Generate and set a new sessionId
    const newSessionId = uuidv4();
    localStorage.setItem('sessionId', newSessionId);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#1A47B8] text-white font-sans pt-16">
      {/* Fixed Clear Chat Button */}
      <div className="fixed z-50 bottom-8 right-8">
        <button
          type="button"
          onClick={resetChat}
          className="text-xs px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium border border-white/20 shadow-lg transition-colors backdrop-blur-lg"
          title="Clear chat history"
        >
          Clear Chat
        </button>
      </div>
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
                    <>
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
                      {/* Feedback UI for assistant messages except the first (welcome) message */}
                      {index !== 0 && (
                        <FeedbackBar
                          chatHistory={messages}
                          messageIndex={index}
                        />
                      )}
                    </>
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