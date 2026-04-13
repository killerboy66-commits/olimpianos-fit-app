import React, { useState } from 'react';
import { X, Youtube, Save } from 'lucide-react';
import { Exercicio } from '../types';

interface ExerciseModalProps {
  onClose: () => void;
  onSave: (exercise: Partial<Exercicio>) => void;
  initialExercise?: Partial<Exercicio>;
  isEditing: boolean;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({
  onClose,
  onSave,
  initialExercise,
  isEditing,
}) => {
  const [editingExercise, setEditingExercise] = useState<Partial<Exercicio>>(
    initialExercise || {}
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSave(editingExercise);
  };

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {isEditing ? 'Editar Exercício' : 'Novo Exercício'}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Personalize sua biblioteca
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 bg-[#1A1A1A] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-[#222]"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto no-scrollbar pr-4 flex-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222]">
              <label className="text-[8px] font-black text-gold uppercase mb-2 block">
                Nome do Exercício
              </label>
              <input
                type="text"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={editingExercise.nome || ''}
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    nome: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222]">
              <label className="text-[8px] font-black text-gold uppercase mb-2 block">
                Grupo Muscular
              </label>
              <select
                className="bg-transparent text-white font-bold outline-none w-full"
                value={editingExercise.grupoId || 'peito'}
                onChange={(e) => {
                  const group = e.target.value;
                  const groupName = group.charAt(0).toUpperCase() + group.slice(1);

                  setEditingExercise({
                    ...editingExercise,
                    grupoId: group,
                    grupoNome: groupName,
                    subgrupoId: group,
                    subgrupoNome: groupName,
                  });
                }}
              >
                <option value="peito">Peito</option>
                <option value="costas">Costas</option>
                <option value="ombros">Ombros</option>
                <option value="bracos">Braços</option>
                <option value="pernas">Pernas</option>
                <option value="abdomen-core">Abdômen</option>
              </select>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222]">
            <label className="text-[8px] font-black text-gold uppercase mb-2 block flex items-center">
              <Youtube size={12} className="mr-2" />
              URL do Vídeo (YouTube/Instagram)
            </label>

            <input
              type="text"
              className="bg-transparent text-white font-bold outline-none w-full placeholder:text-gray-700"
              placeholder="https://www.youtube.com/watch?v=..."
              value={editingExercise.video_url === '#' ? '' : editingExercise.video_url || ''}
              onChange={(e) =>
                setEditingExercise({
                  ...editingExercise,
                  video_url: e.target.value || '#',
                })
              }
            />

            <p className="text-[7px] text-gray-600 mt-2 uppercase font-bold">
              Dica: Use vídeos do seu canal UCL8yaItGFmCTPNFCd-Q4_BQ
            </p>
          </div>

          <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222]">
            <label className="text-[8px] font-black text-gold uppercase mb-2 block">
              Descrição / Dicas Técnicas
            </label>

            <textarea
              className="bg-transparent text-white font-bold outline-none w-full h-24 resize-none"
              value={editingExercise.descricao || ''}
              onChange={(e) =>
                setEditingExercise({
                  ...editingExercise,
                  descricao: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222]">
              <label className="text-[8px] font-black text-gold uppercase mb-2 block">
                Equipamento
              </label>

              <input
                type="text"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={editingExercise.equipamento || ''}
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    equipamento: e.target.value,
                  })
                }
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222]">
              <label className="text-[8px] font-black text-gold uppercase mb-2 block">
                Nível
              </label>

              <select
                className="bg-transparent text-white font-bold outline-none w-full"
                value={editingExercise.nivel || 'Iniciante'}
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    nivel: e.target.value,
                  })
                }
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Iniciante–Avançado">Todos os Níveis</option>
              </select>
            </div>
          </div>
        </form>

        <div className="flex gap-4 pt-8 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-5 text-gray-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={() => handleSubmit()}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Save size={18} />
            <span>Salvar Exercício</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;