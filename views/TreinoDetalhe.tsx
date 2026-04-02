import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Usuario,
  RegistroProgresso,
  Treino,
  FichaTreinoItem,
  Periodizacao,
  Atribuicao,
  Exercicio,
} from '../types';
import { db } from '../services/storage';
import { achievementService } from '../services/achievementService';
import { useNotification } from '../components/Notification';
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Youtube,
  Plus,
  Check,
  Timer,
  X,
  Zap,
  Dumbbell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface TreinoDetalheProps {
  user: Usuario;
  initialWorkoutId: string;
  onBack: () => void;
}

const TreinoDetalhe: React.FC<TreinoDetalheProps> = ({ user, initialWorkoutId, onBack }) => {
  const { notify } = useNotification();

  const [allWorkouts, setAllWorkouts] = useState<Treino[]>([]);
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [periodizacao, setPeriodizacao] = useState<Periodizacao | null>(null);
  const [workoutItems, setWorkoutItems] = useState<FichaTreinoItem[]>([]);
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [allProgress, setAllProgress] = useState<RegistroProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeWorkoutId, setActiveWorkoutId] = useState(initialWorkoutId);

  const [seriesCompleted, setSeriesCompleted] = useState<Record<string, number>>({});
  const [exerciseLoads, setExerciseLoads] = useState<Record<string, string>>({});
  const [exerciseReps, setExerciseReps] = useState<Record<string, string>>({});
  const [sessionHistory, setSessionHistory] = useState<RegistroProgresso[]>([]);

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<number | null>(null);

  const getWorkoutMonth = (wId: string, currentAssignments: Atribuicao[]) => {
    const assignment = currentAssignments.find((a) => a.workout_id === wId);
    if (!assignment) return 1;

    if ((assignment as any).mes_atual !== undefined && (assignment as any).mes_atual !== null) {
      return Number((assignment as any).mes_atual) || 1;
    }

    if (!assignment.data_inicio) return 1;

    const startDate = new Date(assignment.data_inicio);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth());

    return Math.min(Math.max(diffMonths, 0), 11) + 1;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [w, a, p, e, prog] = await Promise.all([
          db.getWorkouts(),
          db.getAssignments(),
          db.getPeriodizacao(user.id),
          db.getExercises(),
          db.getProgress(),
        ]);

        const safeWorkouts = Array.isArray(w) ? w : [];
        const safeAssignments = Array.isArray(a) ? a : [];
        const safeExercises = Array.isArray(e) ? e : [];
        const safeProgress = Array.isArray(prog) ? prog : [];

        setAllWorkouts(safeWorkouts);

        const userAssignments = safeAssignments.filter(
          (item) => item.user_id === user.id && item.ativo !== false
        );

        setAssignments(userAssignments);
        setPeriodizacao(p);
        setExercises(safeExercises);
        setAllProgress(safeProgress);

        console.log('TREINO DETALHE - WORKOUTS:', safeWorkouts);
        console.log('TREINO DETALHE - ASSIGNMENTS DO ALUNO:', userAssignments);
      } catch (error) {
        console.error('Error loading initial workout data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user.id]);

  const viewMonth = useMemo(
    () => getWorkoutMonth(activeWorkoutId, assignments),
    [activeWorkoutId, assignments]
  );

  useEffect(() => {
    if (loading || !activeWorkoutId) return;

    const loadWorkoutDetails = async () => {
      try {
        const items = await db.getItems();
        const safeItems = Array.isArray(items) ? items : [];

        const sameWorkoutItems = safeItems.filter((i: any) => {
          const sameUser = i.user_id === user.id;
          const sameWorkout =
            String(i.workout_id ?? i.ficha ?? '') === String(activeWorkoutId);
          return sameUser && sameWorkout;
        });

        let currentItems = sameWorkoutItems
          .filter((i: any) => Number(i.mes || 1) === Number(viewMonth))
          .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));

        if (currentItems.length === 0) {
          currentItems = sameWorkoutItems
            .filter((i: any) => i.mes === undefined || i.mes === null)
            .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
        }

        if (currentItems.length === 0 && sameWorkoutItems.length > 0) {
          const availableMonths = Array.from(
            new Set(
              sameWorkoutItems
                .map((i: any) => Number(i.mes))
                .filter((m: number) => !Number.isNaN(m))
            )
          ).sort((a, b) => a - b);

          const fallbackMonth =
            availableMonths.find((m) => m >= Number(viewMonth)) ??
            availableMonths[availableMonths.length - 1];

          currentItems = sameWorkoutItems
            .filter((i: any) => Number(i.mes || 1) === Number(fallbackMonth))
            .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
        }

        console.log('TREINO DETALHE - ACTIVE WORKOUT:', activeWorkoutId);
        console.log('TREINO DETALHE - VIEW MONTH:', viewMonth);
        console.log('TREINO DETALHE - ITEMS DO MES:', currentItems);

        setWorkoutItems(currentItems);

        const initialLoads: Record<string, string> = {};
        const initialReps: Record<string, string> = {};

        const getExerciseLoadSafe = async (
          userId: string,
          workoutId: string,
          exerciseId: string
        ) => {
          const fn = (db as any).getExerciseLoad;
          if (typeof fn !== 'function') return '';
          try {
            const result = await fn(userId, workoutId, exerciseId);
            return result ?? '';
          } catch {
            return '';
          }
        };

        const loadPromises = currentItems.map(async (item: any) => {
          initialLoads[item.exercise_id] = await getExerciseLoadSafe(
            user.id,
            activeWorkoutId,
            item.exercise_id
          );
          initialReps[item.exercise_id] = String(item.reps?.split('-')[0] || '12');
        });

        await Promise.all(loadPromises);

        setExerciseLoads(initialLoads);
        setExerciseReps(initialReps);

        const today = new Date().toLocaleDateString();
        const todayProgress = allProgress.filter(
          (p) =>
            p.user_id === user.id &&
            String(p.workout_id) === String(activeWorkoutId) &&
            new Date(p.date).toLocaleDateString() === today
        );

        setSessionHistory(todayProgress);

        const completedMap: Record<string, number> = {};
        currentItems.forEach((item: any) => {
          completedMap[item.id] = todayProgress.filter(
            (p) => String(p.exercise_id) === String(item.exercise_id)
          ).length;
        });

        setSeriesCompleted(completedMap);
      } catch (error) {
        console.error('Error loading workout details:', error);
      }
    };

    loadWorkoutDetails();
  }, [activeWorkoutId, user.id, loading, assignments, allProgress, viewMonth]);

  const activeWorkout = allWorkouts.find((t) => String(t.id) === String(activeWorkoutId));

  const assignedWorkouts = useMemo(() => {
    const ids = Array.from(new Set(assignments.map((a) => String(a.workout_id))));
    return allWorkouts.filter((w) => ids.includes(String(w.id)));
  }, [allWorkouts, assignments]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const parseRestTime = (restStr: string): number => {
    const num = parseInt((restStr || '').replace(/\D/g, ''));
    if ((restStr || '').toLowerCase().includes('min')) return num * 60;
    return num || 60;
  };

  const handleRegisterSet = async (itemId: string, exerciseId: string, restTimeStr: string) => {
    const item = workoutItems.find((i) => i.id === itemId);
    const totalSets = item?.series || 1;
    const currentCompleted = seriesCompleted[itemId] || 0;

    if (currentCompleted >= totalSets) return;

    const currentLoad = exerciseLoads[exerciseId] || '0';
    const currentReps = exerciseReps[exerciseId] || '10';

    const entry: RegistroProgresso = {
      id: crypto.randomUUID(),
      user_id: user.id,
      date: new Date().toISOString(),
      workout_id: activeWorkoutId,
      exercise_id: exerciseId,
      carga_kg: Number(currentLoad),
      reps_realizadas: Number(currentReps),
      notes: `Série ${currentCompleted + 1}`,
    };

    const addProgressFn = (db as any).addProgress;
    if (typeof addProgressFn === 'function') {
      await addProgressFn(entry);
    } else {
      console.warn('db.addProgress não existe no storage.');
    }

    setAllProgress((prev) => [...prev, entry]);

    try {
      achievementService.checkWorkoutAchievements(user.id);
    } catch (error) {
      console.error('Erro ao checar conquistas:', error);
    }

    setSessionHistory((prev) => [...prev, entry]);
    setSeriesCompleted((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

    const setExerciseLoadFn = (db as any).setExerciseLoad;
    if (typeof setExerciseLoadFn === 'function') {
      await setExerciseLoadFn(user.id, activeWorkoutId, exerciseId, currentLoad);
    }

    if (currentCompleted + 1 === totalSets) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    const seconds = parseRestTime(restTimeStr);
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setTimerActive(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeWorkout) {
    return <div className="p-10 text-center text-gray-500">Selecione uma ficha válida.</div>;
  }

  const renderVideoModal = () => {
    if (!activeVideo) return null;
    const videoId = getYoutubeId(activeVideo);

    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <button
          onClick={() => setActiveVideo(null)}
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <Youtube size={64} className="mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-xs">
                Vídeo não disponível ou formato inválido
              </p>
              <a
                href={activeVideo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-gold underline text-xs font-bold"
              >
                Abrir link externo
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getExerciseDescription = (ex: Exercicio) => {
    return ex.descricao || 'Sem observações cadastradas para este exercício.';
  };

  return (
    <div className="pb-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {renderVideoModal()}

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gold text-black px-6 sm:px-10 py-4 sm:py-6 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col items-center border-4 border-white/20">
              <Zap size={48} className="mb-2 animate-bounce" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                Exercício Concluído!
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Digno de um Herói
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-md pt-4 pb-6 z-20 border-b border-[#222] -mx-4 px-4">
        <header className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 -ml-2 text-gold">
            <ArrowLeft size={24} />
          </button>

          <div className="text-center flex-1">
            <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-1">
              Ciclo de Treino Olimpiano
            </h2>
            <p className="text-white font-black text-sm uppercase">
              Ficha {activeWorkout.id}: {activeWorkout.titulo}
            </p>
          </div>

          <div className="w-10"></div>
        </header>

        <div className="flex justify-center mb-6">
          <div className="bg-gold/10 border border-gold/20 px-6 py-2 rounded-2xl flex items-center space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">
              Você está no Mês {viewMonth} do seu Ciclo
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar justify-center">
          {assignedWorkouts.map((w) => {
            const isActive = String(activeWorkoutId) === String(w.id);
            const hasProgressToday = allProgress.some(
              (p) =>
                p.user_id === user.id &&
                String(p.workout_id) === String(w.id) &&
                new Date(p.date).toLocaleDateString() === new Date().toLocaleDateString()
            );

            return (
              <button
                key={w.id}
                onClick={() => setActiveWorkoutId(String(w.id))}
                className={`flex-none w-14 h-14 rounded-2xl font-black text-lg transition-all border-2 flex items-center justify-center relative ${
                  isActive
                    ? 'bg-gold text-[#0A0A0A] border-gold scale-110 shadow-lg shadow-gold/20'
                    : 'bg-[#111] text-gray-500 border-[#222]'
                }`}
              >
                {w.id}
                {hasProgressToday && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center">
                    <Check size={10} className="text-white" strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {workoutItems.length > 0 ? (
          workoutItems.map((item) => {
            const ex = exercises.find((e) => String(e.id) === String(item.exercise_id));
            if (!ex) return null;

            const doneSets = seriesCompleted[item.id] || 0;
            const isFullDone = doneSets >= item.series;
            const exerciseProgress = sessionHistory.filter(
              (p) => String(p.exercise_id) === String(ex.id)
            );

            return (
              <div
                key={item.id}
                className={`card-premium p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
                  isFullDone ? 'border-emerald-500/20 opacity-80' : 'border-[#222]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-gold/10 text-gold text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        {ex.grupoNome}
                      </span>
                      {isFullDone && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>

                    <h4 className="text-xl font-black text-white leading-tight">{ex.nome}</h4>

                    {item.metodo && (
                      <div className="mt-1 flex items-center space-x-1.5">
                        <Zap size={10} className="text-gold" />
                        <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                          {item.metodo}
                        </span>
                      </div>
                    )}
                  </div>

                  {ex.video_url && ex.video_url !== '#' && (
                    <button
                      onClick={() => setActiveVideo(ex.video_url)}
                      className="text-red-500 p-2.5 bg-red-500/10 rounded-2xl ml-2 active:scale-95 transition-transform"
                    >
                      <Youtube size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-[#1A1A1A] p-3 rounded-2xl text-center border border-[#222]">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter mb-1">
                      Séries
                    </p>
                    <p className="text-sm font-black text-white">
                      {doneSets}/{item.series}
                    </p>
                  </div>

                  <div className="bg-[#1A1A1A] p-3 rounded-2xl text-center border border-[#222]">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter mb-1">
                      Meta
                    </p>
                    <p className="text-sm font-black text-white">{item.reps}</p>
                  </div>

                  <div className="bg-[#1A1A1A] p-3 rounded-2xl text-center border border-[#222]">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter mb-1">
                      Pausa
                    </p>
                    <p className="text-sm font-black text-white">{item.descanso}</p>
                  </div>
                </div>

                {!isFullDone && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#0F0F0F] border border-[#222] p-3 rounded-2xl">
                      <p className="text-[8px] text-gray-500 font-black uppercase text-center mb-1">
                        Carga (KG)
                      </p>
                      <input
                        type="number"
                        className="bg-transparent text-white font-black text-2xl text-center outline-none w-full"
                        value={exerciseLoads[ex.id] || ''}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setExerciseLoads((prev) => ({ ...prev, [ex.id]: val }));

                          const setExerciseLoadFn = (db as any).setExerciseLoad;
                          if (typeof setExerciseLoadFn === 'function') {
                            await setExerciseLoadFn(user.id, activeWorkoutId, ex.id, val);
                          }
                        }}
                      />
                    </div>

                    <div className="bg-[#0F0F0F] border border-[#222] p-3 rounded-2xl">
                      <p className="text-[8px] text-gray-500 font-black uppercase text-center mb-1">
                        Repetições
                      </p>
                      <input
                        type="number"
                        className="bg-transparent text-white font-black text-2xl text-center outline-none w-full"
                        value={exerciseReps[ex.id] || ''}
                        onChange={(e) =>
                          setExerciseReps((prev) => ({ ...prev, [ex.id]: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}

                {exerciseProgress.length > 0 && (
                  <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {exerciseProgress.map((p, idx) => (
                      <div
                        key={p.id}
                        className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl"
                      >
                        <span className="text-[9px] font-black text-emerald-400">
                          S{idx + 1}: {p.carga_kg}kg × {p.reps_realizadas}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    className="p-4 bg-[#1A1A1A] rounded-2xl text-gray-500 border border-[#222]"
                    onClick={() => notify(getExerciseDescription(ex), 'info')}
                  >
                    <Info size={20} />
                  </button>

                  <button
                    onClick={() => handleRegisterSet(item.id, item.exercise_id, item.descanso)}
                    disabled={isFullDone}
                    className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 transition-all ${
                      isFullDone
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-gold text-black'
                    }`}
                  >
                    {isFullDone ? (
                      <Check size={20} strokeWidth={3} />
                    ) : (
                      <Plus size={20} strokeWidth={3} />
                    )}
                    <span className="uppercase tracking-widest text-xs">
                      {isFullDone ? 'Ficha Concluída' : `Registrar Série ${doneSets + 1}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 text-center bg-[#111] rounded-[2.5rem] border border-[#222]">
            <Dumbbell size={40} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 font-bold">
              Nenhum treino programado pelo professor para o Mês {viewMonth} da Ficha{' '}
              {activeWorkout.id}.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {timerActive && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <div className="bg-[#111] border-2 border-gold rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-gold/30 w-full"></div>
              <div
                className="absolute top-0 left-0 h-1 bg-gold transition-all duration-1000"
                style={{ width: `${initialTime > 0 ? (timeLeft / initialTime) * 100 : 0}%` }}
              ></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-4 rounded-2xl ${
                      timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-gold text-black'
                    }`}
                  >
                    <Timer size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Descanso Ativo
                    </p>
                    <p
                      className={`text-4xl font-black tabular-nums ${
                        timeLeft <= 10 ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setTimeLeft((prev) => prev + 30)}
                    className="p-3 bg-[#1A1A1A] text-white rounded-xl border border-[#333] text-[10px] font-black uppercase"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setTimeLeft(0)}
                    className="px-4 py-2 bg-white text-black rounded-xl font-black uppercase text-[10px]"
                  >
                    Pular
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 mb-10 text-center">
        <button
          onClick={onBack}
          className="px-12 py-5 bg-[#111] border border-[#222] rounded-full text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Finalizar Treino
        </button>
      </div>
    </div>
  );
};

export default TreinoDetalhe;