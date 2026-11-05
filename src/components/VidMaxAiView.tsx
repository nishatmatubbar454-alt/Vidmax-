import React, { useState, useRef, useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Send, Copy, Check, RotateCcw, Sparkles, History, Trash2, X, Clock } from 'lucide-react';

// Exact SVG matching the user's attachment robot logo
export const VidMaxRobotIcon: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sound waves top right */}
    <path d="M72 16 C75 14, 78 12, 81 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M76 21 C80 18, 84 15, 87 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    
    {/* Antenna Left */}
    <line x1="39" y1="20" x2="36" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="35" cy="9" r="3" fill="currentColor" />

    {/* Antenna Right */}
    <line x1="56" y1="20" x2="60" y2="9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="61" cy="8" r="3" fill="currentColor" />

    {/* Headphones Left */}
    <rect x="15" y="32" width="6" height="20" rx="3" fill="currentColor" />
    {/* Headphones Right */}
    <rect x="79" y="32" width="6" height="20" rx="3" fill="currentColor" />

    {/* Main Robot Outer Speech Bubble / Head */}
    <path
      d="M50 18 C30 18 19 28 19 44 C19 55 26 63 36 67 L34 76 C34 77 36 78 37 77 L47 70 C48 70 49 70 50 70 C70 70 81 60 81 44 C81 28 70 18 50 18 Z"
      fill="currentColor"
    />

    {/* Inner Screen Face (Cutout) */}
    <rect x="27" y="27" width="46" height="34" rx="14" fill="white" />
    <rect x="29" y="29" width="42" height="30" rx="12" fill="#111827" />

    {/* Happy Smiling Eyes: ^^ */}
    <path
      d="M37 44 C37 40 43 40 43 44"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M57 44 C57 40 63 40 63 44"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cute Mouth */}
    <path
      d="M48 49 C48 52 52 52 52 49"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  { icon: '🎬', text: 'সেরা সাউথ অ্যাকশন মুভি সাজেস্ট কর' },
  { icon: '📥', text: 'মুভি ডাউনলোড করার নিয়ম কী?' },
  { icon: '🔥', text: '২০২৫-২০২৬ এর লেটেস্ট মুভি কোনগুলো?' },
  { icon: '💡', text: 'বাংলা ডাবিং সিনেমা দেখতে চাই' },
  { icon: '🍿', text: 'আজকে দেখার মতো একটি থ্রিলার মুভি বলো' },
];

export const VidMaxAiView: React.FC = () => {
  const { movies, setActiveTab } = useMovieContext();
  
  // Persist messages in localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('vidmax_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat history from localStorage', e);
    }
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('vidmax_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history to localStorage', e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem('vidmax_ai_chat_history');
    } catch (e) {
      console.error(e);
    }
    setShowPlusMenu(false);
  };

  const sanitizeText = (txt: string) => {
    return (txt || '')
      .replace(/\*?\*?Chat\s+Smart[,\s]+Feel\s+Amazing!?\*?\*?/gi, '')
      .replace(/চ্যাট\s+স্মার্ট[,\s]+ফিল\s+অ্যামাজিং!?/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const callGeminiApi = async (userPrompt: string, history: ChatMessage[]) => {
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          history: history.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('API failed');
      }

      const data = await response.json();
      return sanitizeText(data.text || "Hello! I am VidMax AI. How can I help you today?");
    } catch {
      // Offline / network fallback smart engine adhering strictly to VidMax rules
      const q = userPrompt.toLowerCase();
      if (q.includes('admin') || q.includes('পাসওয়ার্ড') || q.includes('password') || q.includes('এডমিন') || q.includes('অ্যাডমিন')) {
        return "দুঃখিত, অ্যাডমিন প্যানেলের তথ্য সম্পূর্ণ গোপনীয় ও সুরক্ষিত। আমি এটি শেয়ার করতে পারব না।";
      }
      if (q.includes('বানাইছে') || q.includes('তৈরি') || q.includes('made') || q.includes('build') || q.includes('who created') || q.includes('কে বানিয়েছে')) {
        return "ভিডমেক্স আমাকে তৈরি করেছে।";
      }
      if (q.includes('হাই') || q.includes('hi') || q.includes('hello') || q.includes('হ্যালো') || q.includes('কেমন আছো') || q.includes('কেমন আছেন')) {
        return "হ্যালো! আমি খুব ভালো আছি। আপনি কেমন আছেন? আজ কীভাবে সাহায্য করতে পারি?";
      }
      if (q.includes('সাউথ') || q.includes('south') || q.includes('action')) {
        return `সাউথ সিনেমার মধ্যে বর্তমানে Udaala (2025), Churuli (2021) এবং Pushpa 2 দারুণ অ্যাকশন মুভি! হোমপেজ থেকে সবুজ ডাউনলোড বাটনে সরাসরি 1080p ও 720p তে নামাতে পারেন।`;
      }
      if (q.includes('ডাউনলোড') || q.includes('download')) {
        return `হোম বা সার্চ (🔍) থেকে পছন্দের মুভিতে যান। এরপর সবুজ "Download 480p 720p 1080p [HD]" বাটনে ক্লিক করলেই সরাসরি হাই-স্পিড ডাউনলোড শুরু হবে!`;
      }
      if (q.includes('২০২৫') || q.includes('2025') || q.includes('২০২৬') || q.includes('2026') || q.includes('latest')) {
        return `২০২৫ ও ২০২৬ এর ব্লকবাস্টার মুভি:\n• Udaala (2025) - South Hindi Dual Audio\n• Verity (2026) - Hollywood Dubbed\n• Little Thomas (2026) - Bollywood\nহোমপেজে পাবেন!`;
      }
      return `নমস্কার! আমি VidMax AI। মুভি খোঁজ বা ডাউনলোড বিষয়ে যেকোনো প্রশ্ন করতে পারেন।`;
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);
    setShowPlusMenu(false);

    try {
      const botReplyText = await callGeminiApi(textToSend, messages);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: sanitizeText(botReplyText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // ignore
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] pb-20 pt-2 select-none animate-fadeIn bg-white">
      
      {/* 1. TOP HEADER: Matching exact screenshot branding */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1 px-4 relative">
        {/* History Button at the far left edge (Pure icon only as requested) */}
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="absolute top-1 left-1 sm:left-2 w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/90 text-black flex items-center justify-center active:scale-95 transition-all shadow-2xs cursor-pointer"
          title="History"
          aria-label="History"
        >
          <History className="w-5 h-5 text-black" />
        </button>

        {/* Cute Robot Logo Icon */}
        <div className="mb-2 text-black hover:scale-105 transition-transform cursor-pointer">
          <VidMaxRobotIcon className="w-20 h-20 text-black drop-shadow-xs" />
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-black text-black tracking-tight leading-none mb-2 font-sans">
          VidMax
        </h1>

        {/* Tagline surrounded by clean horizontal dividers */}
        <div className="flex items-center justify-center gap-3 w-full max-w-[280px]">
          <div className="h-px bg-gray-300 flex-1" />
          <span className="text-xs font-semibold text-gray-800 tracking-wide whitespace-nowrap">
            Chat Smart, Feel Amazing
          </span>
          <div className="h-px bg-gray-300 flex-1" />
        </div>
      </div>

      {/* 2. GREETING WELCOME CARD: Matching exact screenshot */}
      <div className="px-3 my-3">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5 transition-all">
          {/* Avatar Circle */}
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
            <VidMaxRobotIcon className="w-8 h-8 text-black" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold text-black flex items-center gap-1.5 leading-none mb-1">
              <span>Hello!</span>
              <span>👋</span>
            </h2>
            <p className="text-xs text-gray-700 leading-snug">
              I'm <strong className="text-black font-extrabold">VidMax AI</strong>.
              <br />
              How can I help you today?
            </p>
          </div>
        </div>
      </div>

      {/* 3. SUGGESTIONS ROW: Quick Chips */}
      {messages.length === 0 && (
        <div className="px-3 my-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {QUICK_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.text)}
                className="px-3 py-2 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800 shrink-0 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. CHAT CONVERSATION MESSAGES LIST */}
      <div className="flex-1 px-3 space-y-3.5 my-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[82%]">
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <VidMaxRobotIcon className="w-5 h-5 text-black" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-black text-white rounded-tr-xs'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.text}

                {msg.sender === 'bot' && (
                  <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-semibold text-gray-500">VidMax AI</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse pl-1">
            <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              <VidMaxRobotIcon className="w-5 h-5 text-black" />
            </div>
            <div className="bg-white border border-gray-200 px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium text-gray-600 ml-1">VidMax is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. BOTTOM INPUT BAR: Matching exact screenshot, positioned slightly lower right above bottom nav */}
      <div className="fixed bottom-[46px] left-0 right-0 z-30 px-3 pb-0.5 max-w-md mx-auto pointer-events-auto">
        {/* Plus Quick Options Popover */}
        {showPlusMenu && (
          <div className="mb-2 bg-white rounded-2xl border border-gray-200 shadow-xl p-2 animate-in zoom-in-95 duration-150 space-y-1">
            <button
              type="button"
              onClick={() => {
                setShowHistoryModal(true);
                setShowPlusMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <History className="w-3.5 h-3.5 text-black" />
              <span>চ্যাট হিস্ট্রি দেখুন ({messages.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClearChat}
              className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>নতুন চ্যাট শুরু করুন (Clear Chat)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('home'); setShowPlusMenu(false); }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>🎬</span>
              <span>হোমপেজে মুভি ব্রাউজ করুন</span>
            </button>
          </div>
        )}

        <div className="w-full bg-white border border-gray-200/90 shadow-lg rounded-full p-1.5 pl-2 flex items-center gap-2 transition-all">
          {/* Plus icon button inside light circle */}
          <button
            type="button"
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center font-bold text-lg transition-all shrink-0 cursor-pointer shadow-2xs leading-none"
            title="Options"
          >
            +
          </button>

          {/* Text input with exact placeholder */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-0 outline-hidden text-sm text-gray-900 placeholder-gray-400 px-1 py-1 font-sans"
          />

          {/* Solid Black Send Button with White Paper Airplane */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer shadow-sm ${
              inputText.trim() && !isTyping
                ? 'bg-black text-white hover:scale-105 active:scale-95'
                : 'bg-black text-white opacity-85 cursor-not-allowed'
            }`}
            title="Send"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 6. HISTORY MODAL: Loaded & Persisted in LocalStorage */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-gray-200 shadow-2xl flex flex-col max-h-[82vh] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-black">চ্যাট হিস্ট্রি (Chat History)</h3>
                  <p className="text-[11px] text-gray-500">
                    {messages.length > 0 ? `${messages.length}টি মেসেজ লোকাল স্টোরেজে জমা আছে` : 'লোকাল স্টোরেজে সংরক্ষিত'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
              {messages.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">কোনো চ্যাট হিস্ট্রি নেই</h4>
                  <p className="text-xs text-gray-500 max-w-[220px]">
                    VidMax AI এর সাথে কোনো কথা বললে তা স্বয়ংক্রিয়ভাবে লোকাল স্টোরেজে জমা থাকবে।
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id || idx} className="pt-2.5 first:pt-0">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span className={`font-bold flex items-center gap-1 ${msg.sender === 'user' ? 'text-black' : 'text-blue-600'}`}>
                        {msg.sender === 'user' ? '👤 আপনি' : '🤖 VidMax AI'}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                    <p className={`text-xs p-2.5 rounded-xl border leading-relaxed break-words ${
                      msg.sender === 'user' 
                        ? 'bg-neutral-900 text-white border-neutral-800' 
                        : 'bg-gray-50 text-gray-800 border-gray-100'
                    }`}>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearChat();
                    setShowHistoryModal(false);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হিস্ট্রি মুছুন</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span>চ্যাট চালিয়ে যান</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
