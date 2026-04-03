import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddStudentModalProps {
  onClose: () => void;
  onAdd: (student: {
    nome: string;
    email: string;
    senha: string;
    objetivo: string;
    foto: string;
  }) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onAdd }) => {
  const [newStudent, setNewStudent] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    objetivo: '',
    foto: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newStudent.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newStudent.senha !== newStudent.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    onAdd({
      nome: newStudent.nome.trim(),
      email: newStudent.email.trim().toLowerCase(),
      senha: newStudent.senha,
      objetivo: newStudent.objetivo.trim(),
      foto: newStudent.foto.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] p-8 rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Recrutar Atleta
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Adicione um novo membro à legião
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-[#1A1A1A] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-[#222]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[8px] font-black text-gold uppercase mb-1 block">
                Nome Completo
              </label>
              <input
                type="text"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={newStudent.nome}
                onChange={(e) => setNewStudent({ ...newStudent, nome: e.target.value })}
                required
                placeholder="Ex: Aquiles de Esparta"
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[8px] font-black text-gold uppercase mb-1 block">
                E-mail de Acesso
              </label>
              <input
                type="email"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                required
                placeholder="atleta@olimpianos.com"
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[8px] font-black text-gold uppercase mb-1 block">
                Senha de Acesso
              </label>
              <input
                type="password"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={newStudent.senha}
                onChange={(e) => setNewStudent({ ...newStudent, senha: e.target.value })}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[8px] font-black text-gold uppercase mb-1 block">
                Confirmar Senha
              </label>
              <input
                type="password"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={newStudent.confirmarSenha}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, confirmarSenha: e.target.value })
                }
                required
                placeholder="Digite a senha novamente"
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[8px] font-black text-gold uppercase mb-1 block">
                Objetivo Principal
              </label>
              <input
                type="text"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={newStudent.objetivo}
                onChange={(e) => setNewStudent({ ...newStudent, objetivo: e.target.value })}
                placeholder="Ex: Hipertrofia Máxima"
              />
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#222] focus-within:border-gold transition-colors">
              <label className="text-[8px] font-black text-gold uppercase mb-1 block">
                Foto (URL Opcional)
              </label>
              <input
                type="text"
                className="bg-transparent text-white font-bold outline-none w-full"
                value={newStudent.foto}
                onChange={(e) => setNewStudent({ ...newStudent, foto: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-[11px] font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-gold to-amber-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-gold/20 active:scale-95 transition-all hover:brightness-110"
            >
              Confirmar Recrutamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;