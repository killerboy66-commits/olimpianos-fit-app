import React, { useEffect, useMemo, useState } from "react";
import { Usuario, Treino, Atribuicao } from "../types";
import { db } from "../services/storage";
import { supabase } from "../services/supabase";
import { useNotification } from "../components/Notification";
import AddStudentModal from "../components/AddStudentModal";
import {
  LogOut,
  UserPlus,
  Mail,
  Target,
  ShieldCheck,
  ChevronRight,
  Users,
  Crown,
  ArrowLeft,
  User,
  Dumbbell,
  Check,
  X,
} from "lucide-react";

interface Props {
  user: Usuario;
  onLogout: () => void;
}

const WORKOUTS_FALLBACK: Treino[] = [
  { id: "A", titulo: "Treino A", duracao_min: 60 },
  { id: "B", titulo: "Treino B", duracao_min: 60 },
  { id: "C", titulo: "Treino C", duracao_min: 60 },
  { id: "D", titulo: "Treino D", duracao_min: 60 },
  { id: "E", titulo: "Treino E", duracao_min: 60 },
  { id: "F", titulo: "Treino F", duracao_min: 60 },
  { id: "G", titulo: "Treino G", duracao_min: 60 },
];

const ProfessorPainel: React.FC<Props> = ({ user, onLogout }) => {
  const { notify } = useNotification();

  const [users, setUsers] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAluno, setSelectedAluno] = useState<Usuario | null>(null);

  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [savingWorkoutId, setSavingWorkoutId] = useState<string | null>(null);
  const [creatingStudent, setCreatingStudent] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const [usersData, workoutsData, assignmentsData] = await Promise.all([
        db.getUsers(),
        typeof (db as any).getWorkouts === "function"
          ? (db as any).getWorkouts()
          : Promise.resolve([]),
        typeof (db as any).getAssignments === "function"
          ? (db as any).getAssignments()
          : Promise.resolve([]),
      ]);

      const normalizados: Usuario[] = (usersData || []).map((u: any) => ({
        ...u,
        role: u.role || "aluno",
        status: u.status || "ativo",
      }));

      setUsers(normalizados);
      setTreinos(
        Array.isArray(workoutsData) && workoutsData.length > 0
          ? workoutsData
          : WORKOUTS_FALLBACK
      );
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (err) {
      console.error(err);
      notify("Erro ao carregar dados do painel", "error");
      setUsers([]);
      setTreinos(WORKOUTS_FALLBACK);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddStudent = async (student: {
    nome: string;
    email: string;
    senha: string;
    objetivo: string;
    foto: string;
  }) => {
    if (creatingStudent) return;

    try {
      setCreatingStudent(true);

      const normalizedName = student.nome.trim();
      const normalizedEmail = student.email.trim().toLowerCase();
      const normalizedGoal = student.objetivo.trim();
      const normalizedPhoto = student.foto?.trim() || "";

      if (!normalizedName) {
        notify("Digite o nome do aluno.", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        notify("Digite um e-mail válido.", "error");
        return;
      }

      if (!student.senha || student.senha.length < 6) {
        notify("A senha deve ter pelo menos 6 caracteres.", "error");
        return;
      }

      const alreadyExists = users.some(
        (u) => (u.email || "").trim().toLowerCase() === normalizedEmail
      );

      if (alreadyExists) {
        notify("Já existe um aluno com este e-mail.", "error");
        return;
      }

      const response = await fetch("http://localhost:3001/create-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: normalizedName,
          email: normalizedEmail,
          senha: student.senha,
          objetivo: normalizedGoal,
          foto: normalizedPhoto,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        notify(result.error || "Erro ao criar aluno.", "error");
        return;
      }

      const novoAluno: Usuario = {
        id: result.userId,
        nome: normalizedName,
        email: normalizedEmail,
        objetivo: normalizedGoal,
        foto: normalizedPhoto,
        role: "aluno",
        status: "ativo",
      };

      setUsers((prev) => [...prev, novoAluno]);

      notify("Aluno criado com login automático 🔥", "success");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      notify("Erro ao criar aluno", "error");
    } finally {
      setCreatingStudent(false);
    }
  };

  const alunos = useMemo(
    () => users.filter((u) => u.role === "aluno"),
    [users]
  );

  const getAvatar = (foto?: string) => {
    if (!foto || foto.includes("dicebear.com")) return "/aluno.png";
    return foto;
  };

  const alunoAssignments = useMemo(() => {
    if (!selectedAluno) return [];
    return assignments.filter((a) => a.user_id === selectedAluno.id);
  }, [assignments, selectedAluno]);

  const isWorkoutAssigned = (workoutId: string) => {
    if (!selectedAluno) return false;
    return assignments.some(
      (a) =>
        a.user_id === selectedAluno.id &&
        String(a.workout_id) === String(workoutId) &&
        a.ativo !== false
    );
  };

  const getStatusBadge = (status?: string) => {
    return status === "bloqueado"
      ? "rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-400"
      : "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400";
  };

  const getStatusLabel = (status?: string) => {
    return status === "bloqueado" ? "Bloqueado" : "Ativo";
  };

  const handleToggleStatus = async () => {
    if (!selectedAluno) return;

    try {
      const novoStatus =
        selectedAluno.status === "bloqueado" ? "ativo" : "bloqueado";

      const { error } = await supabase
        .from("usuarios")
        .update({ status: novoStatus })
        .eq("id", selectedAluno.id);

      if (error) {
        console.error(error);
        notify("Erro ao atualizar status", "error");
        return;
      }

      const alunoAtualizado: Usuario = {
        ...selectedAluno,
        status: novoStatus,
      };

      setSelectedAluno(alunoAtualizado);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedAluno.id ? { ...u, status: novoStatus } : u
        )
      );

      notify(
        novoStatus === "bloqueado"
          ? "Aluno bloqueado 🚫"
          : "Aluno desbloqueado 🔓",
        "success"
      );
    } catch (err) {
      console.error(err);
      notify("Erro ao alterar status", "error");
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedAluno) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir ${selectedAluno.nome}?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/delete-student/${selectedAluno.id}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        notify(result.error || "Erro ao excluir aluno", "error");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== selectedAluno.id));
      setSelectedAluno(null);

      notify("Aluno excluído com sucesso 💀", "success");
    } catch (err) {
      console.error(err);
      notify("Erro ao excluir aluno", "error");
    }
  };

  const handleToggleWorkout = async (workoutId: string) => {
    if (!selectedAluno) return;

    try {
      setSavingWorkoutId(workoutId);

      const existingIndex = assignments.findIndex(
        (a) =>
          a.user_id === selectedAluno.id &&
          String(a.workout_id) === String(workoutId)
      );

      let updatedAssignments: Atribuicao[] = [...assignments];
      let payloadToSave: Atribuicao;

      if (existingIndex >= 0) {
        const current = updatedAssignments[existingIndex];
        payloadToSave = {
          ...current,
          ativo: current.ativo === false ? true : false,
          data_inicio: current.data_inicio || new Date().toISOString(),
        };
        updatedAssignments[existingIndex] = payloadToSave;
      } else {
        payloadToSave = {
          user_id: selectedAluno.id,
          workout_id: workoutId,
          ativo: true,
          data_inicio: new Date().toISOString(),
        };
        updatedAssignments.push(payloadToSave);
      }

      await db.saveAssignments([payloadToSave]);
      setAssignments(updatedAssignments);

      notify(
        payloadToSave.ativo
          ? `Treino ${workoutId} ativado para ${selectedAluno.nome}`
          : `Treino ${workoutId} desativado para ${selectedAluno.nome}`,
        "success"
      );
    } catch (err) {
      console.error(err);
      notify("Erro ao atualizar treino do aluno", "error");
    } finally {
      setSavingWorkoutId(null);
    }
  };

  if (selectedAluno) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-6 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedAluno(null)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm font-black text-gold transition-all hover:bg-gold hover:text-black active:scale-95"
            >
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1A1A1A] px-5 py-3 font-bold text-white transition-all hover:border-red-500/30 hover:text-red-400 active:scale-95"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>

          <section className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#111] to-[#0A0A0A] p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <img
                  src={getAvatar(selectedAluno.foto)}
                  alt={selectedAluno.nome}
                  className="h-24 w-24 rounded-[1.5rem] border-2 border-gold/20 bg-[#111] object-cover"
                />

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                    <User size={12} />
                    <span>Perfil do Aluno</span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tighter sm:text-5xl">
                    {selectedAluno.nome}
                  </h1>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail size={14} className="shrink-0" />
                    <span>{selectedAluno.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={getStatusBadge(selectedAluno.status)}>
                  {getStatusLabel(selectedAluno.status)}
                </span>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                  Aluno
                </span>

                <button
                  onClick={handleToggleStatus}
                  className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedAluno.status === "bloqueado"
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-red-500 text-white hover:bg-red-400"
                  }`}
                >
                  {selectedAluno.status === "bloqueado"
                    ? "Desbloquear"
                    : "Bloquear"}
                </button>

                <button
                  onClick={handleDeleteStudent}
                  className="rounded-xl bg-red-700 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-600"
                >
                  Excluir Aluno
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/5 bg-[#111] p-5 shadow-xl">
              <div className="mb-3 inline-flex rounded-2xl bg-gold/10 p-3 text-gold">
                <Target size={20} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                Objetivo Principal
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {selectedAluno.objetivo || "Sem objetivo definido"}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/5 bg-[#111] p-5 shadow-xl">
              <div className="mb-3 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                Status
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {getStatusLabel(selectedAluno.status)}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/5 bg-[#111] p-5 shadow-xl">
              <div className="mb-3 inline-flex rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                <Mail size={20} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                E-mail
              </p>
              <p className="mt-2 truncate text-sm font-bold text-white">
                {selectedAluno.email}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/5 bg-[#111] p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-gold/10 p-3 text-gold">
                <Dumbbell size={20} />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500">
                  Treinos do Aluno
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Ative ou desative os treinos liberados para este aluno.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {treinos.map((treino) => {
                const ativo = isWorkoutAssigned(String(treino.id));
                const isSaving = savingWorkoutId === String(treino.id);

                return (
                  <div
                    key={treino.id}
                    className={`rounded-[1.5rem] border p-4 transition-all ${
                      ativo
                        ? "border-gold/30 bg-gold/5"
                        : "border-[#222] bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1A1A1A] font-black text-gold">
                        {treino.id}
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${
                          ativo
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        {ativo ? "Ativo" : "Off"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-black text-white">
                      {treino.titulo}
                    </p>

                    <button
                      onClick={() => handleToggleWorkout(String(treino.id))}
                      disabled={isSaving}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 ${
                        ativo
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                          : "bg-gold text-black hover:brightness-110"
                      } ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {ativo ? <X size={14} /> : <Check size={14} />}
                      <span>{ativo ? "Desativar" : "Ativar"}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#222] bg-[#0A0A0A] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                Resumo
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {alunoAssignments.filter((a) => a.ativo !== false).length > 0 ? (
                  alunoAssignments
                    .filter((a) => a.ativo !== false)
                    .map((a, index) => (
                      <span
                        key={`${a.workout_id}-${index}`}
                        className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold"
                      >
                        Treino {a.workout_id}
                      </span>
                    ))
                ) : (
                  <span className="text-sm text-gray-400">
                    Nenhum treino ativo para este aluno.
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>

        {showModal && (
          <AddStudentModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddStudent}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#111] to-[#0A0A0A] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                <Crown size={12} />
                <span>Centro de Comando</span>
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tighter sm:text-5xl">
                  Painel do Professor
                </h1>
                <p className="mt-2 text-sm font-medium text-gray-400">
                  Gerencie sua legião de alunos com visual premium.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowModal(true)}
                disabled={creatingStudent}
                className={`inline-flex items-center gap-2 rounded-2xl bg-gold px-5 py-3 font-black text-black transition-all hover:brightness-110 active:scale-95 ${
                  creatingStudent ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <UserPlus size={18} />
                <span>{creatingStudent ? "Criando..." : "+ Novo Aluno"}</span>
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1A1A1A] px-5 py-3 font-bold text-white transition-all hover:border-red-500/30 hover:text-red-400 active:scale-95"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/5 bg-[#111] p-5 shadow-xl">
            <div className="mb-3 inline-flex rounded-2xl bg-gold/10 p-3 text-gold">
              <Users size={20} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
              Total de Alunos
            </p>
            <p className="mt-2 text-3xl font-black text-white">{alunos.length}</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/5 bg-[#111] p-5 shadow-xl">
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
              Professor Logado
            </p>
            <p className="mt-2 text-lg font-black text-white">{user.nome}</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/5 bg-[#111] p-5 shadow-xl">
            <div className="mb-3 inline-flex rounded-2xl bg-blue-500/10 p-3 text-blue-400">
              <Mail size={20} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
              Conta Atual
            </p>
            <p className="mt-2 truncate text-sm font-bold text-white">
              {user.email}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500">
              Sua Legião de Alunos
            </h2>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/5 bg-[#111] p-10 text-center text-gray-400">
              Carregando...
            </div>
          ) : alunos.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#111] p-10 text-center">
              <p className="text-sm font-bold text-gray-400">
                Nenhum aluno encontrado
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-600">
                Adicione o primeiro atleta da legião
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {alunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="rounded-[2rem] border border-[#222] bg-gradient-to-br from-[#111] to-[#0A0A0A] p-5 shadow-lg transition-all hover:border-gold/40"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={getAvatar(aluno.foto)}
                        alt={aluno.nome}
                        className="h-16 w-16 rounded-2xl border border-gold/20 bg-[#111] object-cover"
                      />

                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-black text-white">
                          {aluno.nome}
                        </h3>

                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                          <Mail size={14} className="shrink-0" />
                          <span className="truncate">{aluno.email}</span>
                        </div>

                        <div className="mt-2 flex items-start gap-2 text-xs text-gold">
                          <Target size={14} className="mt-0.5 shrink-0" />
                          <span className="font-bold">
                            {aluno.objetivo || "Sem objetivo definido"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="flex flex-wrap gap-2">
                        <span className={getStatusBadge(aluno.status)}>
                          {getStatusLabel(aluno.status)}
                        </span>

                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                          Aluno
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedAluno(aluno)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-gold hover:text-black active:scale-95"
                      >
                        <span>Ver Perfil</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <AddStudentModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddStudent}
        />
      )}
    </div>
  );
};

export default ProfessorPainel;