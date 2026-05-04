"use client";
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2, Sparkles, User } from 'lucide-react';
import api from '@/lib/api';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chatbot/history');
        if (res.data && res.data.length > 0) {
          setMessages(res.data.map(m => ({
            role: m.role === 'assistant' ? 'bot' : 'user',
            content: m.content
          })));
        } else {
          setMessages([
            { role: 'bot', content: 'Hello! I am your MedCore AI Assistant. How can I help you with your health data today?' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await api.post('/chatbot/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error communicating with server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">AI Health Assistant</h1>
          <p className="text-slate-400 text-sm">Powered by MedCore Intelligence</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 mb-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                m.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-purple-400'
              }`}>
                {m.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-600/20' 
                  : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-sm shadow-lg'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-purple-400">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-3 bg-slate-900/50 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-lg">
        <input 
          className="flex-1 bg-transparent px-4 py-2 text-white focus:outline-none placeholder:text-slate-500 disabled:opacity-50"
          placeholder="Ask about your prescriptions, symptoms, or appointments..."
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          disabled={loading || !input.trim()} 
          onClick={handleSend} 
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20 min-w-[50px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="translate-x-[-1px] translate-y-[1px]" />}
        </button>
      </div>
    </div>
  );
}