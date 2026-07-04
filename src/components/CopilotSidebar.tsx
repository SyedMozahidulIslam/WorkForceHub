import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Check, 
  Clipboard, 
  ArrowUpRight,
  RefreshCw,
  Clock
} from "lucide-react";

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function CopilotSidebar({ isOpen, onClose }: CopilotSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "Hello! I am your WorkForceHub AI HR Copilot, powered by Gemini. Ask me anything about employee records, Bangladesh Labour Law compliance, drafting agreements, or payroll setups.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Quick Action presets
  const presets = [
    { label: "Maternity Leave Policy", query: "What is our Maternity Leave Policy under Bangladesh Labour Act Section 46?" },
    { label: "Draft Offer Letter", query: "Draft a formal employment offer letter for a Senior Software Engineer with a basic salary of 90,000 BDT." },
    { label: "Summarize Arafat's Profile", query: "Summarize the skills, certifications, and career progression of Arafat Hamim." },
    { label: "Draft Warning Letter", query: "Draft a standard warning letter for repeated late check-ins." }
  ];

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || inputVal;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputVal("");
    setLoading(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error("Failed to contact copilot service");
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.response || "No response received",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: `Error connecting to AI backend: ${err.message || "Unknown error"}. Check if dev server is compiled.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      id="copilot-sidebar-drawer"
      className={`fixed top-0 right-0 h-screen w-120 bg-slate-900 text-slate-100 shadow-2xl z-50 flex flex-col transition-transform duration-300 transform border-l border-slate-800 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold font-sans text-sm text-slate-100">WorkForceHub AI Copilot</h3>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase flex items-center gap-1 leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              Gemini Powered
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs select-text">
        {messages.map((m) => {
          const isAI = m.sender === "ai";
          return (
            <div key={m.id} className={`flex gap-3 max-w-[90%] ${isAI ? "self-start" : "ml-auto flex-row-reverse"}`}>
              {/* Avatar indicator */}
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                isAI ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "bg-slate-800 text-slate-200"
              }`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Text Bubble */}
              <div className="space-y-1.5 min-w-0">
                <div className={`p-4 rounded-2xl relative group ${
                  isAI 
                    ? "bg-slate-950 text-slate-300 border border-slate-800/40" 
                    : "bg-emerald-600 text-white"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  
                  {/* Copy helper */}
                  {isAI && (
                    <button
                      id={`copy-btn-${m.id}`}
                      onClick={() => copyToClipboard(m.id, m.text)}
                      className="absolute right-2 top-2 p-1 rounded bg-slate-900 text-slate-400 opacity-0 group-hover:opacity-100 transition hover:text-white"
                    >
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <span className={`text-[9px] font-mono text-slate-500 block ${isAI ? "text-left" : "text-right"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/40 animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800/40 p-3 rounded-2xl text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Labour policies & compiling response...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Preset Action pills */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap gap-1.5">
        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 w-full mb-1 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Quick Query Presets
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            id={`preset-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => handleSendMessage(p.query)}
            disabled={loading}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-md py-1 px-2 hover:bg-slate-800 transition disabled:opacity-50 text-[10px] font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          id="copilot-user-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Copilot a labor question or request draft templates..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
          disabled={loading}
        />
        <button
          id="btn-send-copilot-msg"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputVal.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-2.5 flex items-center justify-center shadow-md transition disabled:opacity-50 shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>

    </div>
  );
}
