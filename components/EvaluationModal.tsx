
import React, { useState } from 'react';
import { X, Scale, Percent, Save } from 'lucide-react';
import { AvaliacaoFisica, Usuario } from '../types';

interface EvaluationModalProps {
  onClose: () => void;
  onSave: (evaluation: Partial<AvaliacaoFisica>) => void;
  selectedAluno: Usuario | null;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ onClose, onSave, selectedAluno }) => {
  const [newEval, setNewEval] = useState<Partial<AvaliacaoFisica>>({ peso: 0, gordura_percentual: 0, medidas: {} });

  const handleSubmit = () => {
    onSave(newEval);
  };

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Nova Medição</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Registrando dados para {selectedAluno?.nome}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-[#1A1A1A] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-[#222]"><X size={24} /></button>
        </div>
        
        <div className="space-y-8 overflow-y-auto no-scrollbar pr-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-5 rounded-[2rem] border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[9px] font-black text-gold uppercase mb-2 flex items-center"><Scale size={12} className="mr-2" /> Peso Total (kg)</label>
              <input type="text" placeholder="00.0" className="bg-transparent text-white font-black text-2xl outline-none w-full placeholder:text-gray-800" value={newEval.peso || ''} onChange={e => setNewEval({...newEval, peso: e.target.value as any})} />
            </div>
            <div className="bg-[#1A1A1A] p-5 rounded-[2rem] border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[9px] font-black text-gold uppercase mb-2 flex items-center"><Percent size={12} className="mr-2" /> Gordura (%)</label>
              <input type="text" placeholder="00" className="bg-transparent text-white font-black text-2xl outline-none w-full placeholder:text-gray-800" value={newEval.gordura_percentual || ''} onChange={e => setNewEval({...newEval, gordura_percentual: e.target.value as any})} />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-gold pl-3">Tronco & Eixo Central</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: 'pescoco', label: 'Pescoço' },
                { id: 'ombros', label: 'Ombros' },
                { id: 'torax', label: 'Tórax' },
                { id: 'cintura', label: 'Cintura' },
                { id: 'abdomem', label: 'Abdomem' },
                { id: 'quadril', label: 'Quadril' },
              ].map(f => (
                <div key={f.id} className="bg-black/40 p-4 rounded-2xl border border-[#222] focus-within:border-gold/50 transition-colors">
                  <label className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">{f.label}</label>
                  <div className="flex items-center">
                    <input type="text" className="bg-transparent text-white font-bold text-lg outline-none w-full" value={(newEval.medidas as any)?.[f.id] || ''} onChange={e => setNewEval({...newEval, medidas: {...newEval.medidas, [f.id]: e.target.value}})} />
                    <span className="text-[9px] text-gray-700 font-black">CM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-3">Membros Superiores</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'braco_d', label: 'Braço (D)' },
                { id: 'braco_e', label: 'Braço (E)' },
                { id: 'antebraco_d', label: 'Antebraço (D)' },
                { id: 'antebraco_e', label: 'Antebraço (E)' },
              ].map(f => (
                <div key={f.id} className="bg-black/40 p-4 rounded-2xl border border-[#222] focus-within:border-emerald-500/50 transition-colors">
                  <label className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">{f.label}</label>
                  <div className="flex items-center">
                    <input type="text" className="bg-transparent text-white font-bold text-lg outline-none w-full" value={(newEval.medidas as any)?.[f.id] || ''} onChange={e => setNewEval({...newEval, medidas: {...newEval.medidas, [f.id]: e.target.value}})} />
                    <span className="text-[9px] text-gray-700 font-black">CM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3">Membros Inferiores</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'coxa_d', label: 'Coxa (D)' },
                { id: 'coxa_e', label: 'Coxa (E)' },
                { id: 'panturrilha_d', label: 'Panturrilha (D)' },
                { id: 'panturrilha_e', label: 'Panturrilha (E)' },
              ].map(f => (
                <div key={f.id} className="bg-black/40 p-4 rounded-2xl border border-[#222] focus-within:border-blue-500/50 transition-colors">
                  <label className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">{f.label}</label>
                  <div className="flex items-center">
                    <input type="text" className="bg-transparent text-white font-bold text-lg outline-none w-full" value={(newEval.medidas as any)?.[f.id] || ''} onChange={e => setNewEval({...newEval, medidas: {...newEval.medidas, [f.id]: e.target.value}})} />
                    <span className="text-[9px] text-gray-700 font-black">CM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8 shrink-0">
          <button onClick={onClose} className="flex-1 py-5 text-gray-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">Cancelar</button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 bg-gradient-to-r from-gold to-amber-500 text-black py-5 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-gold/20 active:scale-95 transition-all flex items-center justify-center space-x-2 hover:brightness-110"
          >
            <Save size={18} />
            <span>Salvar Avaliação</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
