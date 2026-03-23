
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getAIAdvice } from '../services/geminiService';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Saudações, Olimpiano! Sou o Treinador Zeus, sua inteligência artificial de elite. Como posso potencializar seus resultados hoje? Pergunte sobre técnica, nutrição ou peça uma dose de motivação!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await getAIAdvice(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Desculpe, tive um problema ao processar isso.' }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto border border-[#222] bg-[#111] rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-[#222] bg-[#111]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg shadow-gold/5">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="font-black italic uppercase tracking-tight text-white">Treinador Zeus IA</h3>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Conectado
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-1 ${
                m.role === 'user' ? 'bg-[#222] ml-3' : 'bg-gold/20 mr-3'
              }`}>
                {m.role === 'user' ? <User size={16} className="text-gray-400" /> : <Bot size={16} className="text-gold" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-gold text-black font-bold rounded-br-none' 
                  : 'bg-[#1A1A1A] text-gray-300 border border-[#222] rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] items-end">
              <div className="w-8 h-8 rounded-xl bg-gold/20 mr-3 flex items-center justify-center mb-1">
                <Bot size={16} className="text-gold" />
              </div>
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#222] text-gray-500 rounded-bl-none">
                <Loader2 className="animate-spin" size={16} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-[#0A0A0A] border-t border-[#222]">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-[#111] border border-[#222] rounded-2xl px-6 py-5 pr-16 focus:border-gold outline-none transition-all placeholder:text-gray-600 text-white"
            placeholder="Pergunte sobre treinos, dieta ou motivação..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-4 bg-gold text-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-gold/10"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
