
import React from 'react';
import { Usuario } from '../types';
import { Apple, Video, Calendar, FileText, ExternalLink, MessageCircle, ChevronRight, Clock, Target } from 'lucide-react';

interface NutricionistaViewProps {
  user: Usuario;
  onBack: () => void;
}

const NutricionistaView: React.FC<NutricionistaViewProps> = ({ user, onBack }) => {
  // Simulando dados que viriam do banco de dados
  const consultaInfo = {
    data: '15 de Outubro',
    hora: '14:30',
    links: {
      meet: 'https://meet.google.com/new', // Link de exemplo
      whatsapp: 'https://wa.me/5500000000000'
    }
  };

  const macros = [
    { label: 'Proteínas', atual: 160, meta: 180, cor: 'bg-gold' },
    { label: 'Carboidratos', atual: 210, meta: 250, cor: 'bg-blue-500' },
    { label: 'Gorduras', atual: 55, meta: 70, cor: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-black italic uppercase text-white">Nutrição & Dietética</h2>
        <p className="text-gray-500 font-medium">Sua estratégia alimentar de <span className="text-gold">Elite</span>.</p>
      </header>

      {/* Card de Próxima Consulta Online */}
      <section>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-gold/20 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Video size={120} className="rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gold/10 rounded-2xl">
                <Video className="text-gold" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Telemedicina VIP</p>
                <h3 className="text-xl font-black">Próxima Consulta Online</h3>
              </div>
            </div>

            <div className="flex items-center space-x-6 mb-8 text-gray-300">
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-gold" />
                <span className="font-bold">{consultaInfo.data}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-gold" />
                <span className="font-bold">{consultaInfo.hora}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href={consultaInfo.links.meet} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-gold text-[#0A0A0A] py-4 rounded-2xl font-black flex items-center justify-center space-x-2 hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-gold/10"
              >
                <Video size={20} fill="currentColor" />
                <span className="text-sm uppercase tracking-widest">Entrar no Google Meet</span>
              </a>
              <a 
                href={consultaInfo.links.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-emerald-500 transition-all active:scale-[0.98]"
              >
                <MessageCircle size={20} fill="currentColor" />
                <span className="text-sm uppercase tracking-widest">Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Metas de Macronutrientes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {macros.map((m) => (
          <div key={m.label} className="card-premium p-6 rounded-3xl border border-[#222]">
            <div className="flex justify-between items-end mb-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.label}</p>
              <p className="text-lg font-black">{m.atual}g <span className="text-gray-600 text-xs">/ {m.meta}g</span></p>
            </div>
            <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div 
                className={`h-full ${m.cor} transition-all duration-1000`} 
                style={{ width: `${(m.atual / m.meta) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </section>

      {/* Documentos e Plano Alimentar */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium p-8 rounded-[2.5rem] border border-[#222] group hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center">
              <FileText className="text-gold" size={28} />
            </div>
            <button className="text-gray-500 group-hover:text-gold transition-colors">
              <ExternalLink size={20} />
            </button>
          </div>
          <h4 className="text-xl font-black mb-2 italic">Plano Alimentar Atual</h4>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">Ciclo de Carbo-loading para ganho de massa magra e densidade muscular.</p>
          <button className="w-full py-4 bg-[#1A1A1A] border border-[#222] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all">
            Visualizar PDF Completo
          </button>
        </div>

        <div className="card-premium p-8 rounded-[2.5rem] border border-[#222] group hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Apple className="text-emerald-500" size={28} />
            </div>
            <button className="text-gray-500 group-hover:text-emerald-500 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <h4 className="text-xl font-black mb-2 italic">Suplementação</h4>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">Creatina Monohidratada, Whey Isolate e Ômega 3 (Estratégia Anti-inflamatória).</p>
          <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <Target size={14} />
            <span>Ver Horários Sugeridos</span>
          </div>
        </div>
      </section>

      <footer className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Professional Performance System</p>
      </footer>
    </div>
  );
};

export default NutricionistaView;
