
import React from 'react';
import { Usuario, Route } from '../types';
import { Brain, Video, Calendar, MessageSquare, Shield, Zap, Target, ArrowRight, HeartPulse } from 'lucide-react';

interface PsicologiaViewProps {
  user: Usuario;
  onNavigate: (route: Route) => void;
}

const PsicologiaView: React.FC<PsicologiaViewProps> = ({ user, onNavigate }) => {
  const sessionInfo = {
    proxima: 'Quinta-feira, 19 de Outubro',
    horario: '10:00',
    links: {
      meet: 'https://meet.google.com/new',
      whatsapp: 'https://wa.me/5500000000000'
    }
  };

  const mindsetTips = [
    { 
      title: "Foco Inabalável", 
      desc: "Visualize a execução perfeita de cada série antes de começar.", 
      icon: Target,
      color: "text-blue-400"
    },
    { 
      title: "Resiliência", 
      desc: "O desconforto é o sinal de que a mudança está acontecendo.", 
      icon: Shield,
      color: "text-gold"
    },
    { 
      title: "Recuperação Mental", 
      desc: "Sono e meditação são tão importantes quanto o treino pesado.", 
      icon: HeartPulse,
      color: "text-rose-400"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-black italic uppercase text-white">Psicologia Esportiva</h2>
        <p className="text-gray-500 font-medium">O corpo alcança o que a <span className="text-gold">Mente</span> acredita.</p>
      </header>

      {/* Card de Sessão de Mentoria Mental */}
      <section>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-gold/20 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 opacity-5">
            <Brain size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-gold/10 rounded-2xl">
                <Brain className="text-gold" size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sessão de Alta Performance</p>
                <h3 className="text-2xl font-black italic">Mindset de Campeão</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-300">
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl">
                <Calendar size={18} className="text-gold" />
                <span className="text-sm font-bold">{sessionInfo.proxima}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl">
                <Zap size={18} className="text-gold" />
                <span className="text-sm font-bold">{sessionInfo.horario}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href={sessionInfo.links.meet} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gold text-[#0A0A0A] py-5 rounded-2xl font-black flex items-center justify-center space-x-3 hover:brightness-110 transition-all shadow-xl shadow-gold/10"
              >
                <Video size={22} fill="currentColor" />
                <span className="text-sm uppercase tracking-widest">Entrar no Google Meet</span>
              </a>
              <button 
                onClick={() => onNavigate(Route.AICHAT)}
                className="bg-[#1A1A1A] border border-[#222] text-white py-5 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-[#222] transition-all"
              >
                <MessageSquare size={22} />
                <span className="text-sm uppercase tracking-widest">Suporte via Chat IA</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Estratégias de Mentalidade */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
            <Zap size={14} className="text-gold mr-2" />
            Estratégias de Performance
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mindsetTips.map((tip, idx) => (
            <div key={idx} className="card-premium p-6 rounded-[2rem] border border-[#222] hover:border-gold/30 transition-all group">
              <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 group-hover:bg-gold/10 transition-colors`}>
                <tip.icon className={tip.color} size={24} />
              </div>
              <h4 className="text-lg font-black mb-2 italic">{tip.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Podcast/Recursos Recomendados */}
      <section className="bg-white/5 border border-[#222] p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6 text-center md:text-left">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center animate-pulse">
            <HeartPulse className="text-gold" size={32} />
          </div>
          <div>
            <h4 className="font-black text-lg">Diário de Bordo Mental</h4>
            <p className="text-gray-500 text-xs">Registre seus sentimentos e metas de hoje para clareza absoluta.</p>
          </div>
        </div>
        <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold transition-colors flex items-center">
          Abrir Diário <ArrowRight size={16} className="ml-2" />
        </button>
      </section>

      <footer className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Olimpianos Fit Mental Performance</p>
      </footer>
    </div>
  );
};

export default PsicologiaView;