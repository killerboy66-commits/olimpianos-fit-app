
import React from 'react';
import { X, ClipboardCheck, CalendarDays } from 'lucide-react';
import { Usuario, CronogramaSemanal } from '../types';

interface ReviewWindowProps {
  onClose: () => void;
  selectedAluno: Usuario | null;
  alunoSchedule: CronogramaSemanal | null;
}

const ReviewWindow: React.FC<ReviewWindowProps> = ({ onClose, selectedAluno, alunoSchedule }) => {
  if (!selectedAluno) return null;

  return (
    <div className="fixed inset-0 bg-black/98 z-[150] overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        <header className="flex justify-between items-center sticky top-0 bg-black/80 py-4 backdrop-blur-md border-b border-[#222] z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center border border-gold/20">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Planejamento Mestre</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Atleta: {selectedAluno.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all"><X size={24} /></button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 rounded-[2.5rem] border-gold/10 col-span-1 md:col-span-3 bg-gradient-to-r from-gold/5 to-transparent">
            <div className="flex items-center space-x-3 mb-4">
              <CalendarDays className="text-gold" size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest text-gold">Mapa de Divisão Semanal</h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => (
                <div key={dia} className="bg-black/40 border border-[#222] p-3 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-gray-600 uppercase mb-1">{dia.substring(0,3)}</p>
                  <p className="text-[10px] font-black text-white italic">{(alunoSchedule as any)?.[dia] || 'OFF'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-10">
          <button 
            onClick={onClose} 
            className="bg-gradient-to-r from-white to-gray-300 text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all active:scale-95"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWindow;
