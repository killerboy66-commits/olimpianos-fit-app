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
      <div className="relative w-full max-w-[520px] rounded-[34px] border border-white/10 bg-[#08090c]/95 shadow-[0_25px_80px_rgba(0,0,0,0.65)] overflow-hidden">

        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(214,168,77,0.08),transparent_32%)]" />

        {/* BOTÃO FECHAR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-all hover:bg-white/10 hover:text-white active:scale-95"
        >
          <X size={22} />
        </button>

        <div className="relative z-10 px-4 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">

          {/* HEADER */}
          <div className="mb-6 pr-14">
            <h3 className="text-[2.2rem] leading-none font-black italic uppercase tracking-[-0.04em] text-white">
              Recrutar Atleta
            </h3>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
              Adicione um novo membro à legião
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* INPUTS */}
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5">
              <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                Nome Completo
              </label>
              <input
                type="text"
                value={newStudent.nome}
                onChange={(e) => setNewStudent({ ...newStudent, nome: e.target.value })}
                required
                placeholder="Ex: Aquiles de Esparta"
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/45"
              />
            </div>

            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5">
              <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                E-mail de Acesso
              </label>
              <input
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                required
                placeholder="killerboy66@gmail.com"
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/45"
              />
            </div>

            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5">
              <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={newStudent.senha}
                onChange={(e) => setNewStudent({ ...newStudent, senha: e.target.value })}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/45"
              />
            </div>

            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5">
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
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/45"
              />
            </div>

            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5">
              <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                Objetivo Principal
              </label>
              <input
                type="text"
                value={newStudent.objetivo}
                onChange={(e) => setNewStudent({ ...newStudent, objetivo: e.target.value })}
                placeholder="Ex: Hipertrofia Máxima"
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/45"
              />
            </div>

            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5">
              <label className="mb-2 block text-[10px] font-black uppercase text-[#C6A15B]">
                Foto (URL Opcional)
              </label>
              <input
                type="text"
                value={newStudent.foto}
                onChange={(e) => setNewStudent({ ...newStudent, foto: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/45"
              />
            </div>

            {/* ERRO */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] font-bold text-red-300">
                {error}
              </div>
            )}

            {/* BOTÕES CENTRALIZADOS */}
            <div className="flex flex-col items-center gap-3 pt-6">

              <button
                type="submit"
                className="w-full max-w-[260px] rounded-2xl border border-[#E5C98B] bg-[#C6A15B] py-4 text-center text-[11px] font-black uppercase tracking-[0.08em] text-black shadow-[0_14px_35px_rgba(198,161,91,0.35)] transition-all hover:brightness-110 active:scale-95"
              >
                Confirmar Recrutamento
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40 hover:text-white transition-all"
              >
                Cancelar
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;