
import React from 'react';
import { Trophy, ExternalLink, Zap, Target, Users, Flame } from 'lucide-react';

const DesafioView: React.FC = () => {
  const gymRatsUrl = "https://gymrats.com.br"; // Substituir pelo link real do grupo se necessário

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-black italic uppercase text-white">Arena de Desafios</h2>
        <p className="text-gray-500 font-medium">Supere seus limites e suba no <span className="text-gold">Ranking</span>.</p>
      </header>

      {/* Card Principal GymRats */}
      <section>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-gold p-8 rounded-[3rem] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Trophy size={250} className="text-gold" />
          </div>
          
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gold text-black rounded-2xl shadow-lg">
                <Flame size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Colaboração Oficial</p>
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">GymRats Community</h3>
              </div>
            </div>

            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8">
              Você não treina sozinho. Junte-se à maior comunidade de ratos de academia e compita com outros atletas do time Olimpianos Fit. Registre seus PRs e conquiste seu lugar no topo.
            </p>

            <a 
              href={gymRatsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-gold text-[#0A0A0A] px-10 py-6 rounded-3xl font-black text-xl flex items-center justify-center space-x-4 hover:brightness-110 transition-all shadow-2xl shadow-gold/20 active:scale-95"
            >
              <Zap size={24} fill="currentColor" />
              <span>ACESSAR RANKING GYMRATS</span>
              <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Estatísticas e Cards de Apoio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium p-8 rounded-[2.5rem] border border-[#222]">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Users className="text-blue-500" size={28} />
          </div>
          <h4 className="text-xl font-black mb-2 italic uppercase">Duelo Semanal</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Participe dos desafios de volume e batimento cardíaco. Os 3 primeiros ganham destaque no mural VIP.
          </p>
        </div>

        <div className="card-premium p-8 rounded-[2.5rem] border border-[#222]">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Target className="text-rose-500" size={28} />
          </div>
          <h4 className="text-xl font-black mb-2 italic uppercase">Minha Meta</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Alcance 20 treinos no mês e desbloqueie o selo de "Elite Consistent" no seu perfil.
          </p>
        </div>
      </div>

      <footer className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Olimpianos Fit Performance Network</p>
      </footer>
    </div>
  );
};

export default DesafioView;