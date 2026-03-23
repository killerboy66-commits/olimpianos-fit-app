
import React from 'react';
import { Usuario, Route } from '../types';
import { LogOut, LayoutGrid, Apple, ShoppingBag, Brain, BookOpen, Activity, Trophy, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '../constants';
import Logo from './Logo';

interface NavbarProps {
  user: Usuario;
  onLogout: () => void;
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentRoute }) => {
  return (
    <nav className="bg-[#111] border-b border-[#222] px-4 py-3 sticky top-0 z-50">
      <div className="container mx-auto max-w-4xl flex items-center justify-start gap-1 sm:gap-6">
        <div 
          className="flex items-center space-x-0 cursor-pointer shrink-0"
          onClick={() => onNavigate(user.role === 'professor' ? Route.PROFESSOR : Route.ALUNO)}
        >
          <Logo size={48} className="animate-pulse-gold sm:size-[56px]" />
          <span className="-ml-2 sm:-ml-4 font-black text-[10px] sm:text-lg tracking-widest text-gold uppercase hidden sm:block font-display text-glow-gold">Olimpianos</span>
        </div>

        <div className="flex items-center space-x-0.5 sm:space-x-2 overflow-x-auto no-scrollbar">
          {/* Botão de Painel Principal */}
          <button 
            onClick={() => onNavigate(user.role === 'professor' ? Route.PROFESSOR : Route.ALUNO)}
            className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.ALUNO || currentRoute === Route.PROFESSOR ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-gold hover:bg-gold/5'}`}
          >
            <LayoutGrid size={16} className={currentRoute === Route.ALUNO || currentRoute === Route.PROFESSOR ? 'text-gold' : 'text-gold/60'} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Painel</span>
          </button>

          {/* Botão da Biblioteca - Visível APENAS para o Professor */}
          {user.role === 'professor' && (
            <button 
              onClick={() => onNavigate(Route.EXERCICIOS)}
              className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.EXERCICIOS ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/5'}`}
            >
              <BookOpen size={16} className={currentRoute === Route.EXERCICIOS ? 'text-blue-400' : 'text-blue-400/60'} />
              <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Biblioteca</span>
            </button>
          )}

          {/* Aba de Suplementos agora disponível para Professor e Aluno */}
          <button 
            onClick={() => onNavigate(Route.SUPLEMENTOS)}
            className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.SUPLEMENTOS ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/5'}`}
          >
            <ShoppingBag size={16} className={currentRoute === Route.SUPLEMENTOS ? 'text-emerald-400' : 'text-emerald-400/60'} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Loja</span>
          </button>

          {user.role === 'aluno' && (
            <>
              <button 
                onClick={() => onNavigate(Route.DESAFIO)}
                className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.DESAFIO ? 'text-orange-400 bg-orange-400/10' : 'text-gray-400 hover:text-orange-400 hover:bg-orange-400/5'}`}
              >
                <Trophy size={16} className={currentRoute === Route.DESAFIO ? 'text-orange-400' : 'text-orange-400/60'} />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Desafios</span>
              </button>
              <button 
                onClick={() => onNavigate(Route.NUTRICIONISTA)}
                className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.NUTRICIONISTA ? 'text-lime-400 bg-lime-400/10' : 'text-gray-400 hover:text-lime-400 hover:bg-lime-400/5'}`}
              >
                <Apple size={16} className={currentRoute === Route.NUTRICIONISTA ? 'text-lime-400' : 'text-lime-400/60'} />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Nutrição</span>
              </button>
              <button 
                onClick={() => onNavigate(Route.PSICOLOGIA)}
                className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.PSICOLOGIA ? 'text-violet-400 bg-violet-400/10' : 'text-gray-400 hover:text-violet-400 hover:bg-violet-400/5'}`}
              >
                <Brain size={16} className={currentRoute === Route.PSICOLOGIA ? 'text-violet-400' : 'text-violet-400/60'} />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Mente</span>
              </button>
              <button 
                onClick={() => onNavigate(Route.PROGRESSO)}
                className={`flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl transition-all ${currentRoute === Route.PROGRESSO ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/5'}`}
              >
                <Activity size={16} className={currentRoute === Route.PROGRESSO ? 'text-cyan-400' : 'text-cyan-400/60'} />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Evolução</span>
              </button>
            </>
          )}
          
          <div className="w-px h-6 sm:h-8 bg-[#222] mx-0.5 sm:mx-1"></div>
          
          <a 
            href="https://olimpianosfit.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center px-1.5 sm:px-2 py-1 text-gray-400 hover:text-gold hover:bg-gold/5 transition-all rounded-lg sm:rounded-xl"
          >
            <ExternalLink size={16} className="text-gold/60" />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Site</span>
          </a>

          <button 
            onClick={onLogout} 
            className={`flex flex-col items-center px-1.5 sm:px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-colors rounded-lg sm:rounded-xl ${user.role === 'aluno' ? 'hidden sm:flex' : 'flex'}`}
          >
            <LogOut size={16} className="text-red-500/60" />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter mt-0.5 sm:mt-1">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
