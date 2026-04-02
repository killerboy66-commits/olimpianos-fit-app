import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Usuario,
  Route,
  Treino,
  Periodizacao,
  Conquista,
  CronogramaSemanal,
  RegistroProgresso,
  Atribuicao,
} from '../types';
import { db } from '../services/storage';
import { CONQUISTAS_DATA } from '../data/conquistas';
import * as Icons from 'lucide-react';
import {
  Play,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  ListChecks,
  Trophy,
  Zap,
  CalendarRange,
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  Shield,
  Star,
  X,
  Info,
  Sword,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlunoDashboardProps {
  user: Usuario;
  onStartWorkout: (id: string) => void;
  onNavigate: (route: Route) => void;
  onLogout: () => void;
}

const AlunoDashboard: React.FC<AlunoDashboardProps> = ({
  user,
  onStartWorkout,
  onNavigate,
  onLogout,
}) => {
  const [schedule, setSchedule] = useState<CronogramaSemanal | null>(null);
  const [progress, setProgress] = useState<RegistroProgresso[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [periodizacao, setPeriodizacao] = useState<Periodizacao | null>(null);
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConquista, setSelectedConquista] = useState<Conquista | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const achievementScrollRef = useRef<HTMLDivElement>(null);

  const normalizeText = (value: unknown) =>
    String(value ?? '')
      .trim()
      .toLowerCase();

  const isAssignmentActive = (assignment: any) => {
    if (assignment?.ativo === false) return false;
    if (assignment?.active === false) return false;
    if (assignment?.status && normalizeText(assignment.status) === 'inativo') return false;
    return true;
  };

  const assignmentBelongsToUser = (assignment: any, currentUser: Usuario) => {
    const currentUserId = normalizeText(currentUser.id);
    const currentUserEmail = normalizeText(currentUser.email);

    const possibleIds = [
      assignment?.user_id,
      assignment?.aluno_id,
      assignment?.student_id,
      assignment?.usuario_id,
      assignment?.cliente_id,
    ]
      .map(normalizeText)
      .filter(Boolean);

    const possibleEmails = [
      assignment?.email,
      assignment?.user_email,
      assignment?.aluno_email,
      assignment?.student_email,
    ]
      .map(normalizeText)
      .filter(Boolean);

    return possibleIds.includes(currentUserId) || possibleEmails.includes(currentUserEmail);
  };

  const getAssignmentWorkoutId = (assignment: any): string | null => {
    const value =
      assignment?.workout_id ??
      assignment?.treino_id ??
      assignment?.treinoId ??
      assignment?.workoutId ??
      null;

    if (!value) return null;
    return String(value);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [s, p, t, per, a] = await Promise.all([
          db.getSchedule(user.id),
          db.getProgress(),
          db.getWorkouts(),
          db.getPeriodizacao(user.id),
          db.getAssignments(),
        ]);

        const progressList = Array.isArray(p) ? p : [];
        const workoutsList = Array.isArray(t) ? t : [];
        const assignmentsList = Array.isArray(a) ? a : [];

        const myAssignments = assignmentsList.filter(
          (item: any) => isAssignmentActive(item) && assignmentBelongsToUser(item, user)
        );

        console.log('ALUNO LOGADO:', {
          id: user.id,
          email: user.email,
          nome: user.nome,
        });

        console.log('ASSIGNMENTS RAW:', assignmentsList);
        console.log('ASSIGNMENTS FILTRADOS DO ALUNO:', myAssignments);
        console.log(
          'WORKOUT IDS NORMALIZADOS DO ALUNO:',
          myAssignments.map((item: any) => ({
            original: item,
            workoutId: getAssignmentWorkoutId(item),
          }))
        );
        console.log('TREINOS CARREGADOS:', workoutsList);

        setSchedule(s);
        setProgress(progressList.filter((item) => item.user_id === user.id));
        setTreinos(workoutsList);
        setPeriodizacao(per);
        setAssignments(myAssignments);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const assignmentWorkoutIds = useMemo(() => {
    return assignments
      .map((a: any) => getAssignmentWorkoutId(a))
      .filter((id): id is string => Boolean(id));
  }, [assignments]);

  const activeWorkouts = useMemo(() => {
    return treinos
      .filter((t) => t && t.id)
      .filter((t) => assignmentWorkoutIds.includes(String(t.id)))
      .filter((t, index, self) => index === self.findIndex((x) => x.id === t.id));
  }, [treinos, assignmentWorkoutIds]);

  const scrollAchievements = (direction: 'left' | 'right') => {
    if (achievementScrollRef.current) {
      const { scrollLeft } = achievementScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 150 : scrollLeft + 150;
      achievementScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const date = new Date();
  const dayIndex = date.getDay();
  const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

  const DIAS_KEYS: any[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const DIAS_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
  const todayKey = DIAS_KEYS[adjustedDayIndex];

  const workoutIdToday = schedule ? (schedule as any)[todayKey] : null;
  const workoutToday =
    workoutIdToday && workoutIdToday !== 'Descanso'
      ? activeWorkouts.find((t) => String(t.id) === String(workoutIdToday)) || null
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const checkWorkoutDoneOnDay = (dayOffsetFromMonday: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayOffsetFromMonday);

    const targetDateStr = targetDate.toLocaleDateString();

    return progress.some((p) => new Date(p.date).toLocaleDateString() === targetDateStr);
  };

  const getCurrentPhase = () => {
    if (!periodizacao || assignments.length === 0) return null;

    const withStartDate = assignments.filter((item: any) => item?.data_inicio);

    if (withStartDate.length === 0) return null;

    const firstAssignment = withStartDate.reduce((prev: any, curr: any) =>
      new Date(prev.data_inicio) < new Date(curr.data_inicio) ? prev : curr
    );

    const startDate = new Date(firstAssignment.data_inicio);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth());
    const monthIndex = Math.min(Math.max(diffMonths, 0), 11);

    return periodizacao.meses[monthIndex];
  };

  const currentPhase = getCurrentPhase();

  const handleDayClick = (dayKey: string) => {
    const workoutId = schedule ? (schedule as any)[dayKey] : null;

    if (workoutId && workoutId !== 'Descanso') {
      const treinoValido = activeWorkouts.find((t) => String(t.id) === String(workoutId));
      if (treinoValido) {
        onStartWorkout(treinoValido.id);
        return;
      }
    }

    if (activeWorkouts.length > 0) {
      onStartWorkout(activeWorkouts[0].id);
    }
  };

  const getRank = (workoutCount: number) => {
    if (workoutCount >= 100) {
      return {
        title: 'Soberano do Olimpo',
        color: 'text-gold',
        icon: <Zap size={10} />,
        bg: 'bg-gold/10',
      };
    }
    if (workoutCount >= 50) {
      return {
        title: 'Semideus Imortal',
        color: 'text-amber-400',
        icon: <Zap size={10} />,
        bg: 'bg-amber-400/10',
      };
    }
    if (workoutCount >= 25) {
      return {
        title: 'Herói Lendário',
        color: 'text-emerald-400',
        icon: <Trophy size={10} />,
        bg: 'bg-emerald-400/10',
      };
    }
    if (workoutCount >= 10) {
      return {
        title: 'Guerreiro de Elite',
        color: 'text-blue-400',
        icon: <Shield size={10} />,
        bg: 'bg-blue-400/10',
      };
    }
    return {
      title: 'Recruta Espartano',
      color: 'text-gray-400',
      icon: <Sword size={10} />,
      bg: 'bg-gray-400/10',
    };
  };

  const rank = getRank(progress.length);
  const defaultAvatar = '/aluno.png';

  const getAvatar = (foto?: string) => {
    if (!foto || foto.includes('dicebear.com')) return defaultAvatar;
    return foto;
  };

  const userConquistas = CONQUISTAS_DATA.filter((c) => user.conquistas_ids?.includes(c.id));

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
              🔥 ALUNO DASHBOARD CERTO
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-2">
              <p className="text-gray-500 text-[11px] sm:text-sm font-medium">
                Bora, <span className="text-gold font-bold">{user.nome.split(' ')[0]}</span>!
              </p>
              <div
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border border-current w-fit ${rank.color} ${rank.bg}`}
              >
                {rank.icon}
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">
                  {rank.title}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="sm:hidden px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 active:scale-95 transition-all flex items-center gap-1.5"
            aria-label="Sair"
          >
            <Icons.LogOut size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
          </button>
        </div>

        <button
          onClick={() => setShowProfile(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-gold/50 p-1 shadow-xl shadow-gold/20 hover:scale-110 hover:border-gold transition-all active:scale-90 group relative"
        >
          <div className="absolute inset-0 bg-gold/20 rounded-lg sm:rounded-xl blur-md group-hover:blur-lg transition-all"></div>
          <img
            src={getAvatar(user.foto)}
            className="w-full h-full rounded-lg sm:rounded-xl bg-[#111] object-cover group-hover:brightness-125 transition-all relative z-10"
            alt="Perfil"
          />
        </button>
      </header>

      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-[80px] -mr-24 -mt-24 rounded-full"></div>

              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/20 rounded-3xl blur-2xl animate-pulse"></div>
                  <img
                    src={getAvatar(user.foto)}
                    className="w-32 h-32 bg-[#111] rounded-[2rem] border-4 border-gold/30 object-cover relative z-10 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gold text-black p-2 rounded-xl z-20 shadow-xl">
                    <Icons.User size={20} />
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-1">
                    {user.nome}
                  </h3>
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-current ${rank.color} ${rank.bg}`}
                  >
                    {rank.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {rank.title}
                    </span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left">
                    <p className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">
                      E-mail
                    </p>
                    <p className="text-xs font-bold text-gray-300 truncate">{user.email}</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left">
                    <p className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">
                      Total Treinos
                    </p>
                    <p className="text-xs font-bold text-gray-300">{progress.length} Sessões</p>
                  </div>
                </div>

                <div className="w-full bg-white/5 border border-white/5 p-5 rounded-3xl text-left">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target size={14} className="text-gold" />
                    <p className="text-[9px] font-black text-gold uppercase tracking-widest">
                      Objetivo Atual
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white leading-relaxed italic">
                    "{user.objetivo || 'Foco total na evolução e performance olímpica.'}"
                  </p>
                </div>

                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full bg-gold text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-gold/20 active:scale-95 transition-all hover:brightness-110"
                >
                  Voltar ao Santuário
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {currentPhase && (
        <section className="animate-in zoom-in-95 duration-500 delay-100">
          <div className="bg-[#111] border border-[#222] p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
              <CalendarRange size={80} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold/10 text-gold rounded-lg sm:rounded-xl flex items-center justify-center font-black text-sm sm:text-base">
                  {currentPhase.mes}
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Mês Vigente
                  </p>
                  <h4 className="text-lg sm:text-xl font-black text-white uppercase italic">
                    {currentPhase.fase}
                  </h4>
                </div>
              </div>
              <div className="flex justify-between sm:justify-end gap-4 sm:space-x-3 bg-black/20 p-2 rounded-xl sm:bg-transparent sm:p-0">
                <div className="text-center">
                  <p className="text-[7px] font-black text-gray-600 uppercase mb-1">
                    Intensidade
                  </p>
                  <div className="flex space-x-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < (currentPhase.intensidade || 5) ? 'bg-gold' : 'bg-white/5'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[7px] font-black text-gray-600 uppercase mb-1">Volume</p>
                  <div className="flex space-x-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < (currentPhase.volume || 5) ? 'bg-emerald-500' : 'bg-white/5'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-[#222]">
              <p className="text-[9px] font-black text-gold uppercase tracking-wider mb-1 flex items-center">
                <Target size={10} className="mr-1" /> Foco do Período
              </p>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{currentPhase.objetivo || 'Siga as orientações das fichas abaixo para este mês.'}"
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="animate-in slide-in-from-right-4 duration-500 delay-200">
        <a
          href="https://olimpianosfit.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-5 bg-gold/5 border border-gold/20 rounded-3xl hover:bg-gold/10 hover:border-gold/40 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
              <ExternalLink size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase italic text-white">
                Acessar Site Oficial
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Conteúdos exclusivos e novidades
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-gold group-hover:translate-x-1 transition-transform"
          />
        </a>
      </section>

      <section>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-gold/20 p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <p className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  Agenda Semanal
                </p>
                <h4 className="text-xl sm:text-2xl font-black text-white uppercase italic">
                  Sessão de Hoje
                </h4>
              </div>
              <div className="p-2 sm:p-3 bg-gold/10 rounded-xl sm:rounded-2xl">
                <CalendarDays size={20} className="text-gold" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6 sm:mb-8">
              {DIAS_KEYS.map((key, idx) => {
                const isToday = key === todayKey;
                const isDone = checkWorkoutDoneOnDay(idx);

                return (
                  <div key={key} className="flex flex-col">
                    <button
                      onClick={() => handleDayClick(key)}
                      className={`w-full flex flex-col items-center justify-center py-2 sm:py-4 rounded-xl sm:rounded-2xl transition-all border relative ${
                        isToday
                          ? 'border-gold bg-gold/10 scale-105 shadow-lg shadow-gold/10'
                          : isDone
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-[#222] bg-[#111] hover:border-gold/30'
                      }`}
                    >
                      <span
                        className={`text-[7px] sm:text-[8px] font-black uppercase mb-0.5 sm:mb-1 ${
                          isToday
                            ? 'text-gold'
                            : isDone
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {DIAS_LABELS[idx]}
                      </span>

                      <div className="flex flex-col items-center">
                        {isDone ? (
                          <CheckCircle2 size={10} className="text-emerald-500" />
                        ) : (
                          <Circle size={10} className="text-gray-800" />
                        )}
                      </div>

                      {isToday && !isDone && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gold rounded-full animate-ping"></span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                const treinoParaAbrir = workoutToday?.id || activeWorkouts[0]?.id;
                if (treinoParaAbrir) {
                  onStartWorkout(treinoParaAbrir);
                }
              }}
              disabled={activeWorkouts.length === 0}
              className="w-full bg-gold text-[#0A0A0A] py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-xl flex items-center justify-center space-x-2 sm:space-x-3 hover:brightness-110 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play fill="currentColor" size={20} />
              <span className="uppercase tracking-widest">
                {activeWorkouts.length > 0 ? 'Iniciar Treino' : 'Sem treino liberado'}
              </span>
            </button>

            {workoutToday && (
              <p className="mt-5 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">
                Sugerido: Ficha {workoutToday.id} • {workoutToday.titulo}
              </p>
            )}

            {!workoutToday && activeWorkouts.length > 0 && (
              <p className="mt-5 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">
                Fichas liberadas: {activeWorkouts.map((t) => t.id).join(' • ')}
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <button
          onClick={() => onNavigate(Route.DESAFIO)}
          className="w-full bg-gradient-to-r from-gold/10 to-transparent border border-gold/30 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-gold transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gold text-black rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20">
              <Trophy size={24} />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="bg-gold text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                  Ativo
                </span>
                <p className="font-black text-lg text-white">Desafio GymRats</p>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                Veja sua posição no ranking mundial
              </p>
            </div>
          </div>
          <Zap size={20} className="text-gold animate-pulse" />
        </button>
      </section>

      <section className="animate-in slide-in-from-left-4 duration-500 delay-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase tracking-[0.2em] flex items-center">
            <div className="w-6 h-6 bg-gold/10 rounded-lg flex items-center justify-center mr-2 border border-gold/20">
              <Star className="text-gold animate-pulse" size={12} />
            </div>
            <span className="text-gold font-black text-xs sm:text-sm">
              Conquistas Desbloqueadas
            </span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-1000"
                style={{ width: `${(userConquistas.length / CONQUISTAS_DATA.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-gold uppercase">
              {userConquistas.length} / {CONQUISTAS_DATA.length}
            </span>
          </div>
        </div>

        <div className="relative group/scroll">
          <button
            onClick={() => scrollAchievements('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/60 text-gold rounded-full border border-gold/20 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity -ml-2"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>

          <div
            ref={achievementScrollRef}
            className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth"
          >
            {CONQUISTAS_DATA.map((conquista) => {
              const isEarned = user.conquistas_ids?.includes(conquista.id);
              const Icon = (Icons as any)[conquista.icone] || Trophy;

              const getRarityStyles = (rarity: string, earned: boolean) => {
                if (!earned) {
                  return {
                    card: 'bg-black/60 border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300',
                    icon: 'bg-white/10 text-gray-300',
                    badge: 'bg-white/5 text-gray-500',
                  };
                }

                switch (rarity) {
                  case 'lendario':
                    return {
                      card: 'bg-gradient-to-br from-purple-900/30 via-black to-black border-purple-500 shadow-2xl shadow-purple-500/30 scale-[1.02]',
                      icon: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/50',
                      badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
                    };
                  case 'epico':
                    return {
                      card: 'bg-gradient-to-br from-blue-900/30 via-black to-black border-blue-500 shadow-2xl shadow-blue-500/30 scale-[1.02]',
                      icon: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50',
                      badge: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
                    };
                  case 'raro':
                    return {
                      card: 'bg-gradient-to-br from-amber-900/30 via-black to-black border-gold shadow-2xl shadow-gold/30 scale-[1.02]',
                      icon: 'bg-gradient-to-br from-gold to-amber-500 text-black shadow-lg shadow-gold/50',
                      badge: 'bg-gradient-to-r from-gold to-amber-500 text-black',
                    };
                  default:
                    return {
                      card: 'bg-gradient-to-br from-emerald-900/20 via-black to-black border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02]',
                      icon: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40',
                      badge: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white',
                    };
                }
              };

              const styles = getRarityStyles(conquista.raridade, isEarned || false);

              return (
                <button
                  key={conquista.id}
                  onClick={() => setSelectedConquista(conquista)}
                  className={`flex-shrink-0 w-32 p-4 rounded-3xl border text-center transition-all active:scale-95 group ${styles.card}`}
                >
                  <div
                    className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${styles.icon}`}
                    style={
                      isEarned
                        ? {
                            backgroundColor: `${conquista.cor}40`,
                            color: '#FFFFFF',
                            boxShadow: `0 0 30px ${conquista.cor}60`,
                            border: `1px solid ${conquista.cor}50`,
                          }
                        : {}
                    }
                  >
                    <Icon
                      size={32}
                      strokeWidth={isEarned ? 2.5 : 2}
                      style={
                        isEarned
                          ? { filter: `drop-shadow(0 0 12px ${conquista.cor})` }
                          : {}
                      }
                    />
                  </div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-tighter leading-tight mb-2 ${
                      isEarned ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {conquista.titulo}
                  </p>
                  <div
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block shadow-sm ${styles.badge}`}
                  >
                    {conquista.raridade}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollAchievements('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/60 text-gold rounded-full border border-gold/20 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity -mr-2"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </section>

      <AnimatePresence>
        {selectedConquista && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#111] border-2 border-gold/20 rounded-[2.5rem] p-8 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl"></div>

              <button
                onClick={() => setSelectedConquista(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-all duration-700 ${
                    user.conquistas_ids?.includes(selectedConquista.id)
                      ? 'border border-white/20'
                      : 'bg-white/5 text-gray-700 border border-white/10'
                  }`}
                  style={
                    user.conquistas_ids?.includes(selectedConquista.id)
                      ? {
                          backgroundColor: `${selectedConquista.cor}40`,
                          color: '#FFFFFF',
                          boxShadow: `0 0 50px ${selectedConquista.cor}60`,
                          border: `2px solid ${selectedConquista.cor}60`,
                        }
                      : {}
                  }
                >
                  {React.createElement((Icons as any)[selectedConquista.icone] || Trophy, {
                    size: 56,
                    strokeWidth: user.conquistas_ids?.includes(selectedConquista.id) ? 2.5 : 2,
                    style: user.conquistas_ids?.includes(selectedConquista.id)
                      ? { filter: `drop-shadow(0 0 15px ${selectedConquista.cor})` }
                      : {},
                  })}
                </div>

                <div
                  className={`text-[11px] font-black uppercase px-4 py-1.5 rounded-full mb-4 shadow-lg ${
                    selectedConquista.raridade === 'lendario'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : selectedConquista.raridade === 'epico'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : selectedConquista.raridade === 'raro'
                      ? 'bg-gradient-to-r from-gold to-amber-500 text-black'
                      : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white'
                  }`}
                >
                  {selectedConquista.raridade}
                </div>

                <h4 className="text-3xl font-black text-white uppercase italic mb-3 tracking-tighter">
                  {selectedConquista.titulo}
                </h4>

                <div className="bg-black/60 p-6 rounded-3xl border border-white/5 mb-8 w-full shadow-inner">
                  <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-3 flex items-center justify-center">
                    <Info size={14} className="mr-2" /> Como Conquistar
                  </p>
                  <p className="text-base text-gray-300 leading-relaxed italic font-medium">
                    {selectedConquista.descricao}
                  </p>
                </div>

                {user.conquistas_ids?.includes(selectedConquista.id) ? (
                  <div className="flex items-center space-x-3 text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Conquista Desbloqueada
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-gray-500 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                    <Clock size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Ainda Bloqueada
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section>
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center">
          <ListChecks className="text-gold mr-2" size={14} />
          <span>Suas Fichas do Mês</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeWorkouts.length > 0 ? (
            activeWorkouts.map((t) => (
              <button
                key={t.id}
                onClick={() => onStartWorkout(t.id)}
                className="card-premium p-4 rounded-[1.5rem] flex flex-col items-center text-center group hover:border-gold transition-all relative overflow-hidden"
              >
                <div className="w-8 h-8 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center text-gold font-black text-sm mb-3 group-hover:bg-gold group-hover:text-black transition-colors shrink-0">
                  {t.id}
                </div>
                <div className="w-full">
                  <p className="font-black text-[11px] uppercase tracking-tighter line-clamp-1">
                    {t.titulo}
                  </p>
                  <p className="text-[7px] text-gray-500 font-black uppercase mt-1">
                    Ver Treino
                  </p>
                </div>
                <ChevronRight
                  size={12}
                  className="absolute top-4 right-4 text-gray-800 group-hover:text-gold"
                />
              </button>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-[#111] rounded-[2.5rem] border border-[#222]">
              <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">
                Aguardando Fichas do Professor
              </p>
              <p className="text-gray-500 text-[10px] mt-2">
                Verifique se a atribuição do treino está ligada ao aluno certo.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 pb-10">
        <div className="card-premium p-6 rounded-[2rem] text-center border-l-4 border-l-gold">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
            Total Séries
          </p>
          <p className="text-2xl font-black text-white">{progress.length}</p>
        </div>
        <button
          onClick={() => onNavigate(Route.PROGRESSO)}
          className="card-premium p-6 rounded-[2rem] text-center bg-gold/5 border-gold/20"
        >
          <p className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">
            Evolução
          </p>
          <p className="text-xl font-black text-white flex items-center justify-center">
            Gráficos <ChevronRight size={16} />
          </p>
        </button>
      </div>
    </div>
  );
};

export default AlunoDashboard;