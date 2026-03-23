
import React from 'react';
import { WorkoutPlan } from '../types';
import { ArrowLeft, Clock, Target, Dumbbell, PlayCircle } from 'lucide-react';

interface PlanDetailProps {
  plan: WorkoutPlan;
  onBack: () => void;
}

const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="font-semibold">Voltar aos planos</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="relative h-64 bg-indigo-600 p-8 md:p-12 flex flex-col justify-end">
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Dumbbell size={180} className="rotate-12" />
          </div>
          <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-fit mb-4">
            {plan.category}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">{plan.title}</h2>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-slate-800 rounded-2xl text-indigo-400">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Duração</p>
                <p className="text-lg font-bold">{plan.duration}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-slate-800 rounded-2xl text-emerald-400">
                <Target size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Objetivo</p>
                <p className="text-lg font-bold">{plan.objective}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-slate-800 rounded-2xl text-amber-400">
                <Dumbbell size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Total Exercícios</p>
                <p className="text-lg font-bold">{plan.exercises.length}</p>
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div>
            <h3 className="text-2xl font-black mb-8 flex items-center space-x-3">
              <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
              <span>Exercícios do Plano</span>
            </h3>
            <div className="space-y-4">
              {plan.exercises.map((ex, idx) => (
                <div key={idx} className="group bg-slate-800/40 border border-slate-800 hover:border-indigo-500/30 p-6 rounded-3xl transition-all hover:bg-slate-800/60">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-600/20 text-indigo-400 rounded-lg text-sm font-black">
                          {idx + 1}
                        </span>
                        <h4 className="text-xl font-bold">{ex.name}</h4>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{ex.description}</p>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Séries</p>
                        <p className="font-black text-indigo-400">{ex.sets}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Reps</p>
                        <p className="font-black text-emerald-400">{ex.reps}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Descanso</p>
                        <p className="font-black text-amber-400">{ex.rest}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg flex items-center justify-center space-x-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98]">
            <PlayCircle size={28} />
            <span>INICIAR TREINO AGORA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
