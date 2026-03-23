
import React, { useState } from 'react';
import { Wand2, Loader2, Dumbbell, Zap, Target } from 'lucide-react';
import { generateWorkoutPlan } from '../services/geminiService';
import { useNotification } from '../components/Notification';
import { UserProfile, WorkoutPlan } from '../types';

interface WorkoutGeneratorProps {
  onPlanGenerated: (plan: WorkoutPlan) => void;
}

const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({ onPlanGenerated }) => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Atleta',
    level: 'intermediário',
    goal: 'Hipertrofia muscular e definição',
    equipment: ['Halteres', 'Barra', 'Banco']
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateWorkoutPlan(profile);
      onPlanGenerated(plan);
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      notify("Houve um erro ao gerar seu treino. Tente novamente.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const levels = [
    { value: 'iniciante', label: 'Iniciante', desc: 'Estou começando agora' },
    { value: 'intermediário', label: 'Intermediário', desc: 'Já treino há alguns meses' },
    { value: 'avançado', label: 'Avançado', desc: 'Treino pesado há anos' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Criar Novo Plano AI</h2>
        <p className="text-slate-400">Nossa inteligência artificial criará a rotina perfeita baseada nos seus recursos.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl">
        {/* Goal Section */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-3">
            <Target size={16} className="text-emerald-500" />
            <span>Qual seu principal objetivo?</span>
          </label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ex: Emagrecimento, Hipertrofia, Força bruta..."
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          />
        </div>

        {/* Level Section */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-3">
            <Zap size={16} className="text-yellow-500" />
            <span>Qual seu nível atual?</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setProfile({ ...profile, level: l.value as any })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  profile.level === l.value
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <p className={`font-bold ${profile.level === l.value ? 'text-indigo-400' : 'text-slate-200'}`}>{l.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Section */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-3">
            <Dumbbell size={16} className="text-indigo-500" />
            <span>O que você tem disponível?</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {['Academia Completa', 'Halteres', 'Barra', 'Kettlebell', 'Elásticos', 'Peso do Corpo'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  const newEq = profile.equipment.includes(item)
                    ? profile.equipment.filter(e => e !== item)
                    : [...profile.equipment, item];
                  setProfile({ ...profile, equipment: newEq });
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  profile.equipment.includes(item)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !profile.goal}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Wand2 size={20} />
              <span>Gerar Treino Mestre</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkoutGenerator;
