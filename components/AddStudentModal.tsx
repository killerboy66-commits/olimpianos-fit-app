import React, { useState } from "react";
import { X } from "lucide-react";

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
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    objetivo: "",
    foto: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newStudent.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newStudent.senha !== newStudent.confirmarSenha) {
      setError("As senhas não coincidem.");
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex h-[95dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#08090c]/95 shadow-[0_25px_80px_rgba(0,0,0,0.65)] sm:h-auto sm:max-h-[92vh]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(214,168,77,0.08),transparent_32%)]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-all hover:bg-white/10 hover:text-white active:scale-95"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="px-4 pb-3 pt-5 pr-16 sm:px-7 sm:pb-4 sm:pt-7">
            <h3 className="text-[1.9rem] leading-none font-black italic uppercase tracking-[-0.04em] text-white sm:text-[2.2rem]">
              Recrutar Atleta
            </h3>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 sm:text-[11px]">
              Adicione um novo membro à legião
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-7">
              <div className="space-y-3 sm:space-y-5">
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5">
                  <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newStudent.nome}
                    onChange={(e) => setNewStudent({ ...newStudent, nome: e.target.value })}
                    required
                    placeholder="Ex: Aquiles de Esparta"
                    className="w-full bg-transparent text-[1rem] font-bold text-white outline-none placeholder:text-white/45"
                  />
                </div>

                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5">
                  <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    required
                    placeholder="killerboy66@gmail.com"
                    className="w-full bg-transparent text-[1rem] font-bold text-white outline-none placeholder:text-white/45"
                  />
                </div>

                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5">
                  <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    value={newStudent.senha}
                    onChange={(e) => setNewStudent({ ...newStudent, senha: e.target.value })}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-transparent text-[1rem] font-bold text-white outline-none placeholder:text-white/45"
                  />
                </div>

                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5">
                  <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={newStudent.confirmarSenha}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, confirmarSenha: e.target.value })
                    }
                    required
                    placeholder="Digite a senha novamente"
                    className="w-full bg-transparent text-[1rem] font-bold text-white outline-none placeholder:text-white/45"
                  />
                </div>

                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5">
                  <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                    Objetivo Principal
                  </label>
                  <input
                    type="text"
                    value={newStudent.objetivo}
                    onChange={(e) => setNewStudent({ ...newStudent, objetivo: e.target.value })}
                    placeholder="Ex: Hipertrofia Máxima"
                    className="w-full bg-transparent text-[1rem] font-bold text-white outline-none placeholder:text-white/45"
                  />
                </div>

                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5">
                  <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                    Foto (URL Opcional)
                  </label>
                  <input
                    type="text"
                    value={newStudent.foto}
                    onChange={(e) => setNewStudent({ ...newStudent, foto: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full bg-transparent text-[1rem] font-bold text-white outline-none placeholder:text-white/45"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] font-bold text-red-300">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-20 border-t border-white/10 bg-[#08090c]/95 px-4 pb-4 pt-3 sm:px-7 sm:pb-6 sm:pt-4">
              <div className="flex flex-col items-center gap-3">
                <button
                  type="submit"
                  className="w-full max-w-[260px] rounded-2xl border border-[#E5C98B] bg-[#C6A15B] py-4 text-center text-[11px] font-black uppercase tracking-[0.08em] text-black shadow-[0_14px_35px_rgba(198,161,91,0.35)] transition-all hover:brightness-110 active:scale-95"
                >
                  Confirmar Recrutamento
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40 transition-all hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;