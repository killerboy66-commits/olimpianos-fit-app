
import React, { useState, useEffect, useRef } from 'react';
import { Usuario, Treino, FichaTreinoItem, Exercicio, Atribuicao, CronogramaSemanal, Periodizacao, MesPeriodizacao, AvaliacaoFisica, RegistroProgresso } from '../types';
import { db } from '../services/storage';
import { achievementService } from '../services/achievementService';
import { CONQUISTAS_DATA } from '../data/conquistas';
import { useNotification } from '../components/Notification';
import { useProfessorData } from '../hooks/useProfessorData';
import { FASES_PERIODIZACAO } from '../constants';
import AddStudentModal from '../components/AddStudentModal';
import ExerciseModal from '../components/ExerciseModal';
import EvaluationModal from '../components/EvaluationModal';
import ReviewWindow from '../components/ReviewWindow';
import * as Icons from 'lucide-react';
import ExerciciosView from './ExerciciosView';
import { 
  Users, 
  Dumbbell, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Trash2, 
  Save, 
  X, 
  ShieldCheck, 
  Check, 
  CalendarDays, 
  StickyNote, 
  UserPlus, 
  Settings2, 
  ArrowLeft, 
  ArrowRight,
  Target, 
  Trophy, 
  Wand2, 
  CalendarRange,
  Eye,
  LayoutDashboard,
  ClipboardCheck,
  Zap,
  TrendingUp,
  Scale,
  Ruler,
  Layers,
  Percent,
  ShoppingBag,
  Apple,
  Activity,
  Clock,
  ExternalLink,
  Package,
  Youtube,
  Search,
  Star,
  Sword,
  Shield,
  RotateCcw,
  ChevronDown,
  Bird,
  Mountain,
  Gem,
  Flame,
  Crown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';

interface ProfessorPainelProps {
  user: Usuario;
  onLogout: () => void;
}

const ProfessorPainel: React.FC<ProfessorPainelProps> = ({ user, onLogout }) => {
  const { notify, confirm } = useNotification();
  const {
    loading,
    alunos,
    setAlunos,
    allExercises,
    setAllExercises,
    treinos,
    setTreinos,
    assignments,
    setAssignments,
    allProgress,
    setAllProgress,
    items,
    setItems,
    templates,
    setTemplates,
    refreshData
  } = useProfessorData();

  const [selectedAluno, setSelectedAluno] = useState<Usuario | null>(null);
  const [viewMode, setViewMode] = useState<'prescricao' | 'evolucao' | 'suplementacao' | 'biblioteca'>('prescricao');
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [periodizacao, setPeriodizacao] = useState<MesPeriodizacao[]>([]);
  const [editingMonth, setEditingMonth] = useState<number>(1);
  const [dashboardMonth, setDashboardMonth] = useState<number>(1);
  const dashboardMonthScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const [alunoSchedule, setAlunoSchedule] = useState<CronogramaSemanal | null>(null);
  const [alunoAvaliacoes, setAlunoAvaliacoes] = useState<AvaliacaoFisica[]>([]);
  const [alunoProgress, setAlunoProgress] = useState<RegistroProgresso[]>([]);

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Partial<Exercicio> | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const getRank = (count: number) => {
    if (count >= 100) return { title: 'Lendário', icon: <Crown size={10} />, color: 'text-gold', bg: 'bg-gold/10' };
    if (count >= 50) return { title: 'Elite', icon: <Zap size={10} />, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    if (count >= 20) return { title: 'Avançado', icon: <TrendingUp size={10} />, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    return { title: 'Iniciante', icon: <Dumbbell size={10} />, color: 'text-gray-400', bg: 'bg-gray-400/10' };
  };

  const activityFeed = allProgress
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(p => ({
      user_id: p.user_id,
      workout_id: p.workout_id,
      lastUpdate: p.date,
      sets: p.reps_realizadas
    }));

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString();
    return {
      name: d.toLocaleDateString([], { weekday: 'short' }),
      count: allProgress.filter(p => new Date(p.date).toLocaleDateString() === dateStr).length
    };
  });

  const growthData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const year = d.getFullYear();
    return {
      name: d.toLocaleDateString([], { month: 'short' }),
      count: allProgress.filter(p => {
        const pd = new Date(p.date);
        return pd.getMonth() === month && pd.getFullYear() === year;
      }).length
    };
  });

  const scrollDashboardMonths = (direction: 'left' | 'right') => {
    if (dashboardMonthScrollRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      dashboardMonthScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleStartEditWorkout = (workoutId: string) => {
    setEditingWorkout(workoutId);
    setEditingMonth(dashboardMonth);
    setViewMode('prescricao');
  };


  useEffect(() => {
    if (selectedAluno) {
      const loadAlunoData = async () => {
        try {
          const [s, n, av, p, per] = await Promise.all([
            db.getSchedule(selectedAluno.id),
            db.getStudentNotes(selectedAluno.id),
            db.getAvaliacoes(selectedAluno.id),
            db.getProgress(),
            db.getPeriodizacao(selectedAluno.id)
          ]);
          
          setAlunoSchedule(s);
          setStudentNotes(n);
          setAlunoAvaliacoes(av);
          setAlunoProgress(p.filter(item => item.user_id === selectedAluno.id));
          
          if (per) {
            setPeriodizacao(per.meses);
          } else {
            const initial = Array.from({ length: 12 }, (_, i) => ({
              mes: i + 1,
              fase: FASES_PERIODIZACAO[0],
              objetivo: ''
            }));
            setPeriodizacao(initial);
          }

          const currentMonth = getStudentCurrentMonth(selectedAluno.id, assignments);
          setDashboardMonth(currentMonth);
        } catch (error) {
          console.error('Error loading aluno data:', error);
        }
      };
      loadAlunoData();
    }
  }, [selectedAluno, assignments]);

  const getStudentCurrentMonth = (studentId: string, currentAssignments: Atribuicao[]) => {
    const studentAssignments = currentAssignments.filter(a => a.user_id === studentId && a.ativo);
    if (studentAssignments.length === 0) return 1;
    
    const manualMonth = studentAssignments.find(a => a.mes_atual !== undefined)?.mes_atual;
    if (manualMonth) return manualMonth;
    
    const firstAssignment = studentAssignments.sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())[0];
    const startDate = new Date(firstAssignment.data_inicio);
    const now = new Date();
    const diffMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.min(Math.max(diffMonths, 0), 11) + 1;
  };

  const handleToggleAssignment = async (workoutId: string) => {
    if (!selectedAluno) return;
    
    const index = assignments.findIndex(a => a.user_id === selectedAluno.id && a.workout_id === workoutId);
    
    let updated: Atribuicao[];
    let targetAssignment: Atribuicao;

    if (index > -1) {
      updated = [...assignments];
      updated[index] = { ...updated[index], ativo: !updated[index].ativo };
      targetAssignment = updated[index];
    } else {
      targetAssignment = { 
        user_id: selectedAluno.id, 
        workout_id: workoutId, 
        ativo: true, 
        data_inicio: new Date().toISOString() 
      };
      updated = [...assignments, targetAssignment];
    }
    
    try {
      await db.saveAssignments([targetAssignment]);
      setAssignments(updated);
    } catch (error) {
      console.error('Error toggling assignment:', error);
      notify('Erro ao atualizar atribuição', 'error');
    }
  };

  const handleUpdateSchedule = async (dia: keyof CronogramaSemanal, valor: string) => {
    if (!selectedAluno) return;
    
    const currentSchedule = alunoSchedule || {
      user_id: selectedAluno.id,
      segunda: 'Descanso', terca: 'Descanso', quarta: 'Descanso', quinta: 'Descanso',
      sexta: 'Descanso', sabado: 'Descanso', domingo: 'Descanso'
    };

    const newSchedule = { ...currentSchedule, [dia]: valor };
    await db.saveSchedule(newSchedule);
    setAlunoSchedule(newSchedule);
  };

  const handleSaveNotes = async (val: string) => {
    if (!selectedAluno) return;
    setStudentNotes(val);
    await db.saveStudentNotes(selectedAluno.id, val);
  };

  const handleAddMonth = async () => {
    const nextMonth = periodizacao.length + 1;
    const newMonth: MesPeriodizacao = {
      mes: nextMonth,
      fase: FASES_PERIODIZACAO[0],
      objetivo: '',
      intensidade: 5,
      volume: 5
    };
    const newP = [...periodizacao, newMonth];
    setPeriodizacao(newP);
    if (selectedAluno) {
      await db.savePeriodizacao({ user_id: selectedAluno.id, meses: newP });
    }
  };

  const handleRemoveMonth = async () => {
    if (periodizacao.length <= 1) return;
    if (await confirm({ 
      title: "Remover Mês", 
      message: "Deseja remover o último mês do ciclo?", 
      confirmText: "Remover", 
      cancelText: "Cancelar" 
    })) {
      const newP = periodizacao.slice(0, -1);
      setPeriodizacao(newP);
      if (selectedAluno) {
        await db.savePeriodizacao({ user_id: selectedAluno.id, meses: newP });
      }
    }
  };

  const handleAddStudent = async (student: { nome: string; email: string; objetivo: string; foto: string }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newUser: Usuario = {
      id,
      nome: student.nome,
      email: student.email,
      role: 'aluno',
      foto: student.foto || "/aluno.png",
      objetivo: student.objetivo
    };
    
    try {
      await db.saveUsers([newUser]);
      setAlunos(prev => [...prev, newUser]);
      
      // Initial assignment
      const newAssignment: Atribuicao = {
        user_id: id,
        workout_id: 'A',
        ativo: true,
        mes_atual: 1,
        data_inicio: new Date().toISOString().split('T')[0]
      };
      await db.saveAssignments([newAssignment]);
      setAssignments(prev => [...prev, newAssignment]);
      
      // Initial periodization
      const initialP = Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        fase: FASES_PERIODIZACAO[0],
        objetivo: '',
        intensidade: 5,
        volume: 5
      }));
      
      await db.savePeriodizacao({ user_id: id, meses: initialP });
      
      setShowAddStudentModal(false);
      notify("Novo aluno recrutado para a legião!", 'success');
      setSelectedAluno(newUser);
    } catch (error) {
      console.error('Error adding student:', error);
      notify('Erro ao adicionar atleta', 'error');
    }
  };

  const handleUpdatePeriodizacao = async (index: number, field: keyof MesPeriodizacao, value: string | number) => {
    const newP = [...periodizacao];
    newP[index] = { ...newP[index], [field]: value };
    setPeriodizacao(newP);
    if (selectedAluno) {
      await db.savePeriodizacao({ user_id: selectedAluno.id, meses: newP });
    }
  };

  const handleCopyPreviousMonth = async (idx: number) => {
    if (idx === 0) return;
    const prevMonth = periodizacao[idx - 1];
    const newP = [...periodizacao];
    newP[idx] = { 
      ...newP[idx], 
      fase: prevMonth.fase, 
      objetivo: prevMonth.objetivo,
      intensidade: prevMonth.intensidade || 5,
      volume: prevMonth.volume || 5
    };
    setPeriodizacao(newP);
    if (selectedAluno) {
      await db.savePeriodizacao({ user_id: selectedAluno.id, meses: newP });
    }
  };

  const applyPeriodizacaoTemplate = async (templateName: string) => {
    const templatesList: Record<string, MesPeriodizacao[]> = {
      "Bulking (Ganho de Massa)": [
        { mes: 1, fase: "Adaptação", objetivo: "Preparar articulações e técnica", intensidade: 6, volume: 7 },
        { mes: 2, fase: "Hipertrofia I", objetivo: "Aumento de volume e densidade", intensidade: 7, volume: 8 },
        { mes: 3, fase: "Hipertrofia II", objetivo: "Foco em progressão de carga", intensidade: 8, volume: 8 },
        { mes: 4, fase: "Força Máxima", objetivo: "Pico de força e recrutamento", intensidade: 10, volume: 5 },
        { mes: 5, fase: "Deload / Recuperação", objetivo: "Recuperação ativa e regeneração", intensidade: 4, volume: 4 },
        { mes: 6, fase: "Pico de Performance", objetivo: "Consolidação dos ganhos", intensidade: 9, volume: 7 },
        { mes: 7, fase: "Hipertrofia I", objetivo: "Novo estímulo de volume", intensidade: 7, volume: 9 },
        { mes: 8, fase: "Hipertrofia II", objetivo: "Progressão de carga", intensidade: 8, volume: 9 },
        { mes: 9, fase: "Força Máxima", objetivo: "Superação de marcas", intensidade: 10, volume: 6 },
        { mes: 10, fase: "Resistência Muscular", objetivo: "Densidade e vascularização", intensidade: 7, volume: 10 },
        { mes: 11, fase: "Deload / Recuperação", objetivo: "Preparação para novo ciclo", intensidade: 4, volume: 4 },
        { mes: 12, fase: "Pico de Performance", objetivo: "Máximo volume muscular", intensidade: 10, volume: 8 }
      ],
      "Cutting (Definição Extrema)": [
        { mes: 1, fase: "Adaptação", objetivo: "Manutenção de massa e cardio", intensidade: 6, volume: 8 },
        { mes: 2, fase: "Resistência Muscular", objetivo: "Aumento do gasto calórico", intensidade: 7, volume: 10 },
        { mes: 3, fase: "Hipertrofia I", objetivo: "Manter densidade em déficit", intensidade: 8, volume: 7 },
        { mes: 4, fase: "Cutting / Definição", objetivo: "Máxima queima de gordura", intensidade: 9, volume: 6 },
        { mes: 5, fase: "Cutting / Definição", objetivo: "Ajustes finais e vascularização", intensidade: 9, volume: 5 },
        { mes: 6, fase: "Deload / Recuperação", objetivo: "Estabilização metabólica", intensidade: 5, volume: 5 },
        { mes: 7, fase: "Resistência Muscular", objetivo: "Manter metabolismo alto", intensidade: 7, volume: 11 },
        { mes: 8, fase: "Hipertrofia I", objetivo: "Preservação de massa magra", intensidade: 8, volume: 8 },
        { mes: 9, fase: "Cutting / Definição", objetivo: "Foco em áreas críticas", intensidade: 9, volume: 6 },
        { mes: 10, fase: "Cutting / Definição", objetivo: "Pico de condicionamento", intensidade: 10, volume: 5 },
        { mes: 11, fase: "Deload / Recuperação", objetivo: "Recuperação hormonal", intensidade: 4, volume: 4 },
        { mes: 12, fase: "Pico de Performance", objetivo: "Estética de palco/competição", intensidade: 10, volume: 6 }
      ],
      "Recomposição Corporal": [
        { mes: 1, fase: "Adaptação", objetivo: "Equilíbrio calórico e técnica", intensidade: 6, volume: 7 },
        { mes: 2, fase: "Hipertrofia I", objetivo: "Ganho de massa magra", intensidade: 7, volume: 8 },
        { mes: 3, fase: "Resistência Muscular", objetivo: "Aumento de densidade", intensidade: 8, volume: 9 },
        { mes: 4, fase: "Hipertrofia II", objetivo: "Consolidação muscular", intensidade: 8, volume: 8 },
        { mes: 5, fase: "Cutting / Definição", objetivo: "Redução de gordura residual", intensidade: 9, volume: 6 },
        { mes: 6, fase: "Pico de Performance", objetivo: "Estética final e força", intensidade: 9, volume: 7 },
        { mes: 7, fase: "Hipertrofia I", objetivo: "Novo ciclo de ganhos", intensidade: 7, volume: 8 },
        { mes: 8, fase: "Hipertrofia II", objetivo: "Foco em pontos fracos", intensidade: 8, volume: 8 },
        { mes: 9, fase: "Resistência Muscular", objetivo: "Refinamento muscular", intensidade: 8, volume: 10 },
        { mes: 10, fase: "Cutting / Definição", objetivo: "Definição aprimorada", intensidade: 9, volume: 6 },
        { mes: 11, fase: "Deload / Recuperação", objetivo: "Descanso sistêmico", intensidade: 4, volume: 4 },
        { mes: 12, fase: "Pico de Performance", objetivo: "Melhor versão do ano", intensidade: 10, volume: 7 }
      ]
    };

    const selected = templatesList[templateName];
    if (selected && selectedAluno) {
      setPeriodizacao(selected);
      await db.savePeriodizacao({ user_id: selectedAluno.id, meses: selected });
    }
  };

  const handleResetCycle = async () => {
    if (!selectedAluno) return;
    if (await confirm({ 
      title: "Limpar Ciclo", 
      message: "Deseja realmente limpar todo o planejamento do ciclo?", 
      confirmText: "Limpar", 
      cancelText: "Cancelar" 
    })) {
      const initial = Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        fase: FASES_PERIODIZACAO[0],
        objetivo: '',
        intensidade: 5,
        volume: 5
      }));
      setPeriodizacao(initial);
      await db.savePeriodizacao({ user_id: selectedAluno.id, meses: initial });
    }
  };

  const handleGlobalSave = async () => {
    if (!selectedAluno) return;
    
    // 1. Save Periodization
    await db.savePeriodizacao({ user_id: selectedAluno.id, meses: periodizacao });
    
    // 2. Save Schedule
    if (alunoSchedule) {
      await db.saveSchedule(alunoSchedule);
    }
    
    // 3. Save Notes
    await db.saveStudentNotes(selectedAluno.id, studentNotes);
    
    // 4. Save Assignments
    await db.saveAssignments(assignments);
    
    notify("Todas as configurações do Ciclo de Treino Olimpiano e Exercícios foram salvas com sucesso!", 'success');
  };

  const handleSaveEval = async (evaluation: Partial<AvaliacaoFisica>) => {
    if (!selectedAluno) return;
    if (!evaluation.peso) {
      notify("Por favor, insira pelo menos o peso.", 'error');
      return;
    }
    
    const parseNum = (val: any) => {
      if (val === undefined || val === null || val === '') return undefined;
      if (typeof val === 'number') return val;
      const num = Number(val.replace(',', '.'));
      return isNaN(num) ? undefined : num;
    };

    const entry: AvaliacaoFisica = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: selectedAluno.id,
      date: new Date().toISOString(),
      peso: parseNum(evaluation.peso) || 0,
      gordura_percentual: parseNum(evaluation.gordura_percentual),
      medidas: {
        pescoco: parseNum(evaluation.medidas?.pescoco),
        ombros: parseNum(evaluation.medidas?.ombros),
        torax: parseNum(evaluation.medidas?.torax),
        cintura: parseNum(evaluation.medidas?.cintura),
        abdomem: parseNum(evaluation.medidas?.abdomem),
        quadril: parseNum(evaluation.medidas?.quadril),
        braco_d: parseNum(evaluation.medidas?.braco_d),
        braco_e: parseNum(evaluation.medidas?.braco_e),
        antebraco_d: parseNum(evaluation.medidas?.antebraco_d),
        antebraco_e: parseNum(evaluation.medidas?.antebraco_e),
        coxa_d: parseNum(evaluation.medidas?.coxa_d),
        coxa_e: parseNum(evaluation.medidas?.coxa_e),
        panturrilha_d: parseNum(evaluation.medidas?.panturrilha_d),
        panturrilha_e: parseNum(evaluation.medidas?.panturrilha_e),
      }
    };
    await db.addAvaliacao(entry);
    achievementService.checkEvaluationAchievements(selectedAluno.id);
    const updatedAvaliacoes = await db.getAvaliacoes(selectedAluno.id);
    setAlunoAvaliacoes(updatedAvaliacoes);
    notify("Avaliação física registrada com sucesso para o aluno!", 'success');
    setShowAddModal(false);
  };

  const handleSaveExercise = async (exercise: Partial<Exercicio>) => {
    if (!exercise) return;

    let updated;
    if (allExercises.find(ex => ex.id === exercise.id)) {
      updated = allExercises.map(ex => ex.id === exercise.id ? (exercise as Exercicio) : ex);
    } else {
      updated = [...allExercises, exercise as Exercicio];
    }

    setAllExercises(updated);
    await db.saveExercises(updated);
    setShowExerciseModal(false);
    setEditingExercise(null);
    notify("Exercício salvo na biblioteca!", 'success');
  };

  const handleDeleteExercise = async (id: string) => {
    if (!await confirm({ 
      title: "Remover Exercício", 
      message: "Tem certeza que deseja remover este exercício da biblioteca?", 
      confirmText: "Remover", 
      cancelText: "Cancelar" 
    })) return;
    const updated = allExercises.filter(ex => ex.id !== id);
    setAllExercises(updated);
    await db.saveExercises(updated);
  };

  const handleUpdateCurrentMonth = async (month: number) => {
    if (!selectedAluno) return;
    const newA = assignments.map(a => a.user_id === selectedAluno.id ? { ...a, mes_atual: month } : a);
    setAssignments(newA);
    await db.saveAssignments(newA);
    setDashboardMonth(month);
  };

  const handleUpdateStartDate = async (date: string) => {
    if (!selectedAluno) return;
    const newA = assignments.map(a => a.user_id === selectedAluno.id ? { ...a, data_inicio: date } : a);
    setAssignments(newA);
    await db.saveAssignments(newA);
  };

  const renderMedidaItem = (label: string, value?: number) => {
    if (value === undefined || value === 0) return null;
    return (
      <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#222]">
        <p className="text-[7px] text-gray-600 font-black uppercase mb-0.5">{label}</p>
        <p className="text-[10px] font-black text-white">{value}cm</p>
      </div>
    );
  };

  // Gráfico de Carga (Performance)
  const chartPerformanceData = alunoProgress.slice(-7).map(h => ({
    name: new Date(h.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
    peso: h.carga_kg || 0
  }));

  // Gráfico de Peso (Físico)
  const chartFisicoData = alunoAvaliacoes.map(a => ({
    name: new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: a.peso
  }));

  const latestEval = alunoAvaliacoes[alunoAvaliacoes.length - 1];


  return (
    <div className="space-y-8 pb-20">
      
      {showAddStudentModal && (
        <AddStudentModal 
          onClose={() => setShowAddStudentModal(false)}
          onAdd={handleAddStudent}
        />
      )}

      {showExerciseModal && (
        <ExerciseModal 
          onClose={() => {
            setShowExerciseModal(false);
            setEditingExercise(null);
          }}
          onSave={handleSaveExercise}
          initialExercise={editingExercise || {}}
          isEditing={!!editingExercise?.id}
        />
      )}
      {showAddModal && (
        <EvaluationModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveEval}
          selectedAluno={selectedAluno}
        />
      )}

      {showReview && (
        <ReviewWindow 
          onClose={() => setShowReview(false)}
          selectedAluno={selectedAluno}
          alunoSchedule={alunoSchedule}
        />
      )}
      
      <header className="flex justify-between items-start px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Centro de Comando VIP</h2>
          <p className="text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Gestão da Legião Olimpiana</p>
        </div>
      </header>

      {/* Dashboard Bento Grid */}
      {!editingWorkout && !selectedAluno && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-min md:auto-rows-[130px] animate-in fade-in slide-in-from-top-4 duration-700">
          
          {/* Bloco 1: Atletas Ativos + Crescimento */}
          <div className="card-premium p-5 rounded-[2.5rem] border-white/5 bg-gold/5 flex flex-col justify-between group hover:border-gold/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                <Users size={16} />
              </div>
              <div className="h-8 w-16 min-w-[64px] min-h-[32px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={growthData}>
                    <Bar dataKey="total" fill="#C6A15B" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-black text-white">{alunos.length}</h4>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Atletas Ativos</p>
            </div>
          </div>

          {/* Bloco 2: Treinos Hoje */}
          <div className="card-premium p-4 rounded-[1.5rem] border-white/5 bg-emerald-500/5 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <Zap size={16} />
              </div>
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-2 bg-emerald-500/40 rounded-full animate-pulse"></div>
                <div className="w-0.5 h-2 bg-emerald-500/60 rounded-full animate-pulse delay-75"></div>
              </div>
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-black text-white">
                {allProgress.filter(p => new Date(p.date).toLocaleDateString() === new Date().toLocaleDateString()).length}
              </h4>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Treinos Hoje</p>
            </div>
          </div>

          {/* Bloco 3: Feed de Atividade (Grande) */}
          <div className="col-span-2 md:row-span-2 card-premium p-5 rounded-[2rem] border-white/5 bg-[#0D0D0D] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -mr-12 -mt-12 opacity-50"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                <h3 className="text-[9px] font-black text-white uppercase tracking-[0.15em]">Atividade</h3>
              </div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Tempo Real</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar relative z-10 max-h-[180px] md:max-h-none">
              {activityFeed.length > 0 ? activityFeed.slice(0, 5).map((item, idx) => {
                const aluno = alunos.find(u => u.id === item.user_id);
                const time = new Date(item.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold/20 transition-all group/item">
                    <div className="flex items-center space-x-2.5">
                      <img src={(!aluno?.foto || aluno?.foto.includes('dicebear.com')) ? "/aluno.png" : aluno?.foto} className="w-7 h-7 rounded-lg bg-[#111] object-cover" alt="" />
                      <div>
                        <p className="text-[10px] font-black text-white leading-tight">{aluno?.nome.split(' ')[0]} <span className="text-gray-600">treinou</span> {item.workout_id}</p>
                        <p className="text-[7px] text-gray-500 font-bold uppercase">{time} • {item.sets} séries</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedAluno(aluno || null)} className="p-1.5 text-gray-700 group-hover/item:text-gold transition-colors">
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-4">
                  <Zap size={24} className="mb-1" />
                  <p className="text-[8px] font-black uppercase tracking-widest">Aguardando...</p>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 4: Evolução (Sparkline) */}
          <div className="card-premium p-5 rounded-[1.5rem] border-white/5 bg-blue-500/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <TrendingUp size={16} />
              </div>
              <div className="h-8 w-20 min-w-[80px] min-h-[32px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-black text-white">{allProgress.length}</h4>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Registros Totais</p>
            </div>
          </div>

          {/* Bloco 5: Biblioteca */}
          <div 
            onClick={() => setViewMode('biblioteca')}
            className="card-premium p-4 rounded-[1.5rem] border-white/5 bg-purple-500/5 flex flex-col justify-between group hover:border-purple-500/30 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                <Dumbbell size={16} />
              </div>
              <Plus size={12} className="text-purple-500/50 group-hover:rotate-90 transition-transform" />
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-black text-white">{allExercises.length}</h4>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Biblioteca</p>
            </div>
          </div>

          {/* Bloco 6: Site Oficial (Largo) */}
          <div className="col-span-2 card-premium p-1 rounded-[1.5rem] border-white/5 bg-gradient-to-r from-gold/10 to-transparent group hover:border-gold/30 transition-all">
            <a 
              href="https://olimpianosfit.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 h-full"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                  <ExternalLink size={20} />
                </div>
                <div>
                  <h4 className="font-black text-[11px] uppercase italic text-white">Portal Olimpianos</h4>
                  <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Conteúdos da Legião</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all">
                <ChevronRight size={16} />
              </div>
            </a>
          </div>

        </section>
      )}

      {editingWorkout ? (
        <div className="animate-in slide-in-from-right duration-300">
          <div className="mb-8 flex items-center justify-between">
            <button onClick={() => setEditingWorkout(null)} className="text-gold text-sm font-bold flex items-center hover:translate-x-[-4px] transition-transform shrink-0">
              <ArrowLeft className="mr-2" size={20} /> Voltar ao Perfil do Aluno
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-gold/30 p-0.5">
                <img src={(!selectedAluno?.foto || selectedAluno?.foto.includes('dicebear.com')) ? "/aluno.png" : selectedAluno?.foto} className="w-full h-full rounded-full bg-[#111] object-cover" alt="Perfil" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{selectedAluno?.nome}</p>
                <p className="text-[7px] text-gold font-bold uppercase tracking-widest mt-1">Editando Ficha {editingWorkout}</p>
              </div>
            </div>
          </div>
          <ExerciciosView 
            defaultAlunoId={selectedAluno?.id} 
            initialSheet={editingWorkout} 
            initialMonth={editingMonth} 
            onUpdate={refreshData}
          />
        </div>
      ) : viewMode === 'biblioteca' ? (
        <div className="animate-in slide-in-from-right duration-300">
          <div className="mb-8">
            <button onClick={() => setViewMode('prescricao')} className="text-gold text-sm font-bold flex items-center hover:translate-x-[-4px] transition-transform shrink-0">
              <ArrowLeft className="mr-2" size={20} /> Voltar ao Painel
            </button>
          </div>
          <ExerciciosView defaultAlunoId="global" />
        </div>
      ) : selectedAluno ? (
        <div className="animate-in slide-in-from-right duration-300 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSelectedAluno(null)} className="text-gold text-sm font-bold flex items-center active:scale-95 transition-transform hover:translate-x-[-4px]">
                <ArrowLeft className="mr-2" size={20} /> Voltar
              </button>
              <button onClick={() => setShowReview(true)} className="bg-gradient-to-r from-gold/20 to-gold/5 text-gold border border-gold/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:from-gold hover:to-[#A6813B] hover:text-black transition-all shadow-lg shadow-gold/5">
                <Eye size={14} className="mr-2" /> Resumo Geral
              </button>
            </div>
            <div className="flex bg-[#111] p-1 rounded-2xl border border-[#222] overflow-x-auto gold-scrollbar">
               <button onClick={() => setViewMode('prescricao')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode === 'prescricao' ? 'bg-gradient-to-r from-gold to-[#A6813B] text-black shadow-lg shadow-gold/20' : 'text-gray-500 hover:text-white'}`}>Prescrição</button>
               <button onClick={() => setViewMode('evolucao')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode === 'evolucao' ? 'bg-gradient-to-r from-gold to-[#A6813B] text-black shadow-lg shadow-gold/20' : 'text-gray-500 hover:text-white'}`}>Evolução</button>
               <button onClick={() => setViewMode('suplementacao')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode === 'suplementacao' ? 'bg-gradient-to-r from-gold to-[#A6813B] text-black shadow-lg shadow-gold/20' : 'text-gray-500 hover:text-white'}`}>Suplementos</button>
            </div>
          </div>

          {viewMode === 'prescricao' ? (
            <div className="card-premium p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] relative overflow-hidden">
               {/* Pre-existing prescription UI */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6 mb-12">
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-gold/30 p-1.5 shadow-2xl shadow-gold/10 relative shrink-0">
                    <img src={(!selectedAluno.foto || selectedAluno.foto.includes('dicebear.com')) ? "/aluno.png" : selectedAluno.foto} className="w-full h-full rounded-[1.5rem] bg-[#111] object-cover" alt="Perfil" />
                    <div className="absolute -bottom-2 -right-2 bg-gold text-black p-1.5 rounded-xl shadow-lg">
                      <Crown size={14} />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h3 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{selectedAluno.nome}</h3>
                        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border border-current w-fit mx-auto sm:mx-0 shadow-lg ${getRank(alunoProgress.length).color} ${getRank(alunoProgress.length).bg}`}>
                          {getRank(alunoProgress.length).icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{getRank(alunoProgress.length).title}</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleGlobalSave}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                      >
                        <Save size={18} className="mr-3 group-hover:scale-110 transition-transform" /> Salvar Tudo
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
                      <div className="flex flex-col items-center sm:items-start shrink-0">
                        <span className="text-[8px] font-black text-gold uppercase tracking-[0.3em] mb-1.5 opacity-60">Objetivo Principal</span>
                        <div className="bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 text-white text-[11px] font-black uppercase tracking-widest shadow-inner">
                          {selectedAluno.objetivo || 'Alta Performance'}
                        </div>
                      </div>
                     
                      <div className="flex items-center space-x-4 bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/10 shrink-0 group hover:border-gold/50 transition-all shadow-inner">
                        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                          <Target size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Mês Ativo</span>
                          <div className="relative flex items-center">
                            <select 
                              className="bg-transparent text-sm font-black text-white outline-none cursor-pointer appearance-none pr-8"
                              value={getStudentCurrentMonth(selectedAluno.id, assignments)}
                              onChange={(e) => handleUpdateCurrentMonth(parseInt(e.target.value))}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                <option key={m} value={m} className="bg-[#111]">Mês {m}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="text-gold absolute right-0 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/10 shrink-0 group hover:border-blue-500/50 transition-all shadow-inner">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <CalendarDays size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Início do Ciclo</span>
                          <input 
                            type="date" 
                            className="bg-transparent text-sm font-black text-white outline-none cursor-pointer"
                            value={assignments.find(a => a.user_id === selectedAluno.id)?.data_inicio.split('T')[0] || ''}
                            onChange={(e) => handleUpdateStartDate(new Date(e.target.value).toISOString())}
                          />
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
              
              <div className="bg-[#111] border border-[#222] p-6 rounded-[2.5rem] mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
                    <Star className="text-gold mr-2" size={14} />
                    <span>Conquistas Desbloqueadas</span>
                  </h4>
                  <span className="text-[10px] font-black text-gold uppercase">
                    {(selectedAluno.conquistas_ids?.length || 0)} / {CONQUISTAS_DATA.length}
                  </span>
                </div>
                
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {CONQUISTAS_DATA.map((conquista) => {
                    const isEarned = selectedAluno.conquistas_ids?.includes(conquista.id);
                    const Icon = (Icons as any)[conquista.icone] || Trophy;
                    
                    return (
                      <div 
                        key={conquista.id}
                        className={`flex-shrink-0 w-24 p-3 rounded-2xl border text-center transition-all duration-500 ${
                          isEarned 
                            ? 'bg-white/5 border-white/10 shadow-xl' 
                            : 'bg-black/20 border-white/5 opacity-40 grayscale hover:opacity-60 transition-opacity'
                        }`}
                        title={conquista.descricao}
                      >
                        <div 
                          className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all duration-500 ${
                            isEarned ? 'shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-gray-600'
                          }`}
                          style={isEarned ? { 
                            backgroundColor: `${conquista.cor}30`, 
                            color: '#FFFFFF', // White icon for maximum contrast
                            boxShadow: `0 0 25px ${conquista.cor}60`,
                            border: `1px solid ${conquista.cor}40`
                          } : {}}
                        >
                          <Icon size={20} strokeWidth={isEarned ? 2.5 : 2} style={isEarned ? { filter: `drop-shadow(0 0 8px ${conquista.cor})` } : {}} />
                        </div>
                        <p className={`text-[8px] font-black uppercase tracking-tighter leading-tight ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                          {conquista.titulo}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center"><CalendarDays size={14} className="mr-2 text-gold" /> Divisão Semanal</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => (
                      <div key={dia} className="flex flex-col space-y-1">
                        <label className="text-[7px] font-black uppercase text-gray-600 text-center">{dia.substring(0, 3)}</label>
                        <select value={alunoSchedule ? (alunoSchedule as any)[dia] : 'Descanso'} onChange={(e) => handleUpdateSchedule(dia as any, e.target.value)} className={`w-full py-3 rounded-xl font-black text-center text-[9px] outline-none transition-all border-2 appearance-none ${(alunoSchedule as any)?.[dia] !== 'Descanso' ? 'bg-gold text-black border-gold' : 'bg-[#1A1A1A] border-[#222] text-gray-700'}`}>
                          <option value="Descanso">OFF</option>
                          {treinos.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center"><StickyNote size={14} className="mr-2 text-gold" /> Notas do Prontuário</h4>
                  <textarea className="w-full h-[140px] bg-[#1A1A1A] border-2 border-[#222] rounded-3xl p-6 text-sm text-gray-300 focus:border-gold outline-none transition-all resize-none" placeholder="Feedback do professor..." value={studentNotes} onChange={(e) => handleSaveNotes(e.target.value)} />
                </div>
              </div>

              <div className="mb-16">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
                  <div>
                    <h4 className="text-[11px] font-black text-gold uppercase tracking-[0.3em] flex items-center mb-2">
                      <CalendarRange size={16} className="mr-3" /> Ciclo de Treino Olimpiano
                    </h4>
                    <p className="text-xs text-gray-500 font-medium tracking-tight">Planejamento estratégico de 12 meses para evolução contínua.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 overflow-x-auto gold-scrollbar pb-2 w-full lg:w-auto">
                    <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/5 shrink-0">
                      {["Bulking", "Cutting", "Recomposição"].map(t => (
                        <button 
                          key={t}
                          onClick={() => applyPeriodizacaoTemplate(t)}
                          className="px-5 py-2.5 hover:bg-gold hover:text-black rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap shrink-0 text-gray-400"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={handleAddMonth}
                        className="w-11 h-11 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
                        title="Adicionar Mês"
                      >
                        <Plus size={20} />
                      </button>
                      <button 
                        onClick={handleRemoveMonth}
                        className="w-11 h-11 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/5"
                        title="Remover Mês"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button 
                        onClick={handleResetCycle}
                        className="w-11 h-11 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/5"
                        title="Limpar Ciclo"
                      >
                        <RotateCcw size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Macro-ciclos Visual Refinado */}
                <div className="relative mb-16 px-4">
                   <div className="flex h-3 rounded-full overflow-hidden bg-white/5 mb-6 border border-white/5 p-0.5">
                     <div className="w-1/3 bg-gradient-to-r from-gold/20 to-gold/40 h-full rounded-full border-r border-black/20"></div>
                     <div className="w-1/3 bg-gradient-to-r from-gold/40 to-gold/70 h-full rounded-full border-r border-black/20 mx-0.5"></div>
                     <div className="w-1/3 bg-gradient-to-r from-gold/70 to-gold h-full rounded-full"></div>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] overflow-x-auto gold-scrollbar pb-2">
                     <div className="text-center min-w-[100px] flex-1 group">
                       <p className="text-gold/40 group-hover:text-gold/60 transition-colors mb-2">Fase Base</p>
                       <div className="w-2 h-2 bg-gold/20 rounded-full mx-auto mb-2"></div>
                       <p className="text-[7px] text-gray-600 leading-relaxed">Fundação, Técnica e<br/>Adaptação Estrutural</p>
                     </div>
                     <div className="text-center min-w-[100px] flex-1 group">
                       <p className="text-gold/60 group-hover:text-gold/80 transition-colors mb-2">Fase Específica</p>
                       <div className="w-2 h-2 bg-gold/40 rounded-full mx-auto mb-2"></div>
                       <p className="text-[7px] text-gray-600 leading-relaxed">Aumento de Volume e<br/>Intensidade Progressiva</p>
                     </div>
                     <div className="text-center min-w-[100px] flex-1 group">
                       <p className="text-gold group-hover:scale-110 transition-all mb-2">Fase de Pico</p>
                       <div className="w-2 h-2 bg-gold rounded-full mx-auto mb-2 shadow-lg shadow-gold/20"></div>
                       <p className="text-[7px] text-gray-600 leading-relaxed">Performance Máxima e<br/>Supercompensação</p>
                     </div>
                   </div>
                </div>

                <div className="flex overflow-x-auto gold-scrollbar gap-6 pb-10 -mx-6 px-6 snap-x">
                  {periodizacao.map((mes, idx) => {
                    const isCurrentMonth = selectedAluno ? getStudentCurrentMonth(selectedAluno.id, assignments) === mes.mes : false;
                    return (
                      <div key={mes.mes} className={`flex-none w-[300px] sm:w-[340px] snap-start bg-gradient-to-b from-[#111] to-black border-2 rounded-[3rem] p-8 relative group transition-all duration-500 ${isCurrentMonth ? 'border-gold shadow-2xl shadow-gold/10' : 'border-white/5 hover:border-gold/30'}`}>
                        {isCurrentMonth && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-[8px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-2xl z-20 whitespace-nowrap">
                            Mês Ativo do Aluno
                          </div>
                        )}
                        
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                          <Trophy size={100} />
                        </div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              {isCurrentMonth && <div className="absolute inset-0 bg-gold blur-lg opacity-40 animate-pulse"></div>}
                              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl transition-all duration-500 z-10 ${isCurrentMonth ? 'bg-gold text-black shadow-gold/30 scale-110' : 'bg-white/5 text-gray-500 group-hover:text-gold group-hover:bg-gold/10'}`}>
                                {mes.mes}
                              </div>
                            </div>
                            <div>
                              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrentMonth ? 'text-gold' : 'text-gray-500'}`}>Mês do Ciclo</p>
                              <h4 className="text-white font-black uppercase text-sm tracking-widest mt-0.5">PLANEJAMENTO</h4>
                            </div>
                          </div>
                          
                          {idx > 0 && (
                            <button 
                              onClick={() => handleCopyPreviousMonth(idx)}
                              className="w-10 h-10 bg-white/5 text-gold hover:bg-gold hover:text-black rounded-xl flex items-center justify-center transition-all group/clone"
                              title={`Clonar dados do M${mes.mes - 1}`}
                            >
                              <RotateCcw size={16} className="group-hover/clone:rotate-180 transition-transform duration-500" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-8 relative z-10">
                          <button 
                            onClick={() => {
                              setDashboardMonth(mes.mes);
                              const element = document.getElementById('fichas-ativas');
                              if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-emerald-500 text-white py-4 rounded-2xl text-[8px] font-black uppercase flex flex-col items-center justify-center space-y-1.5 hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <Plus size={16} strokeWidth={3} />
                            <span>Adicionar</span>
                          </button>
                          <button 
                            onClick={() => setDashboardMonth(mes.mes)}
                            className={`py-4 rounded-2xl text-[8px] font-black uppercase flex flex-col items-center justify-center space-y-1.5 transition-all shadow-lg ${
                              dashboardMonth === mes.mes 
                                ? 'bg-gold text-black shadow-gold/30' 
                                : 'bg-blue-500 text-white hover:brightness-110 shadow-blue-500/20'
                            }`}
                          >
                            <Target size={16} strokeWidth={3} />
                            <span>Ajuste Mês</span>
                          </button>
                          <button 
                            onClick={() => setExpandedMonth(expandedMonth === mes.mes ? null : mes.mes)}
                            className={`py-4 rounded-2xl text-[8px] font-black uppercase flex flex-col items-center justify-center space-y-1.5 transition-all shadow-lg ${
                              expandedMonth === mes.mes 
                                ? 'bg-purple-500 text-white shadow-purple-500/30' 
                                : 'bg-[#1A1A1A] text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white'
                            }`}
                          >
                            <Layers size={16} strokeWidth={3} />
                            <span>Lógica Ciclo</span>
                          </button>
                        </div>
                        
                        {(expandedMonth === mes.mes || dashboardMonth === mes.mes) && (
                          <div className="space-y-6 animate-in slide-in-from-top-2 duration-300 pt-6 border-t border-white/5 relative z-10">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gold uppercase tracking-[0.2em] flex items-center opacity-70">
                                <Target size={12} className="mr-2" /> Fase do Ciclo
                              </label>
                              <div className="relative group/select">
                                <select 
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-xs font-black text-white outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                                  value={mes.fase}
                                  onChange={(e) => handleUpdatePeriodizacao(idx, 'fase', e.target.value)}
                                >
                                  {FASES_PERIODIZACAO.map(f => (
                                    <option key={f} value={f} className="bg-[#0A0A0A]">{f.toUpperCase()}</option>
                                  ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none group-hover/select:scale-110 transition-transform" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gold uppercase tracking-[0.2em] flex items-center opacity-70">
                                <Wand2 size={12} className="mr-2" /> Objetivo / Notas
                              </label>
                              <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold text-white outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all min-h-[120px] resize-none placeholder:text-gray-800"
                                placeholder="Ex: Focar em amplitude máxima e controle de carga..."
                                value={mes.objetivo}
                                onChange={(e) => handleUpdatePeriodizacao(idx, 'objetivo', e.target.value)}
                              />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-gold uppercase tracking-widest">Resumo das Fichas</span>
                                <div className="flex -space-x-2">
                                  {treinos.filter(t => assignments.some(a => a.user_id === selectedAluno!.id && a.workout_id === t.id && a.ativo)).map((t, i) => {
                                    const hasEx = items.some(item => item.user_id === selectedAluno!.id && item.workout_id === t.id && (item.mes === mes.mes || (!item.mes && mes.mes === 1)));
                                    return (
                                      <div 
                                        key={t.id} 
                                        className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black transition-all ${hasEx ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-[#1A1A1A] text-gray-600'}`}
                                        style={{ zIndex: 10 - i }}
                                        title={`Ficha ${t.id}: ${hasEx ? 'Configurada' : 'Vazia'}`}
                                      >
                                        {t.id}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {treinos.filter(t => assignments.some(a => a.user_id === selectedAluno!.id && a.workout_id === t.id && a.ativo)).map(t => {
                                  const exercises = items.filter(item => item.user_id === selectedAluno!.id && item.workout_id === t.id && (item.mes === mes.mes || (!item.mes && mes.mes === 1)));
                                  if (exercises.length === 0) return null;
                                  
                                  return (
                                    <div key={t.id} className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between group/workout">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-[9px] font-black">{t.id}</div>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">{t.titulo}</span>
                                      </div>
                                      <span className="text-[8px] font-black text-gold bg-gold/10 px-2 py-0.5 rounded-md">{exercises.length} EX</span>
                                    </div>
                                  );
                                })}
                                {treinos.filter(t => assignments.some(a => a.user_id === selectedAluno!.id && a.workout_id === t.id && a.ativo)).every(t => items.filter(item => item.user_id === selectedAluno!.id && item.workout_id === t.id && (item.mes === mes.mes || (!item.mes && mes.mes === 1))).length === 0) && (
                                  <div className="py-4 text-center border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Nenhum exercício configurado</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-8">
                  <button 
                    onClick={handleGlobalSave}
                    className="bg-gradient-to-r from-gold to-amber-500 text-black px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all flex items-center shadow-2xl shadow-gold/20 active:scale-95"
                  >
                    <Save size={18} className="mr-3" /> Salvar Planejamento do Ciclo
                  </button>
                </div>
              </div>

              <div className="mb-12" id="fichas-ativas">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h4 className="text-[11px] font-black text-gold uppercase tracking-[0.3em] flex items-center mb-1">
                      <Dumbbell size={16} className="mr-3" /> Gestão de Fichas (ABC...)
                    </h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Selecione o mês para configurar as fichas correspondentes</p>
                  </div>
                  
                  <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    <button 
                      onClick={() => scrollDashboardMonths('left')}
                      className="w-9 h-9 flex items-center justify-center text-gold hover:bg-gold/10 rounded-xl transition-all active:scale-90"
                    >
                      <ChevronLeft size={18} strokeWidth={3} />
                    </button>
                    
                    <div 
                      ref={dashboardMonthScrollRef}
                      className="flex items-center space-x-1 overflow-x-auto gold-scrollbar max-w-[140px] xs:max-w-[200px] sm:max-w-[300px] scroll-smooth pb-1 px-2"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                        <button 
                          key={m} 
                          onClick={() => setDashboardMonth(m)}
                          className={`min-w-[40px] h-9 rounded-xl text-[10px] font-black transition-all shrink-0 flex items-center justify-center ${dashboardMonth === m ? 'bg-gold text-black shadow-lg shadow-gold/20 scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                          M{m}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => scrollDashboardMonths('right')}
                      className="w-9 h-9 flex items-center justify-center text-gold hover:bg-gold/10 rounded-xl transition-all active:scale-90"
                    >
                      <ChevronRight size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {treinos.map(t => {
                    const isAssigned = assignments.some(a => a.user_id === selectedAluno.id && a.workout_id === t.id && a.ativo);
                    const hasExercisesThisMonth = items.some(i => i.user_id === selectedAluno.id && i.workout_id === t.id && (i.mes === dashboardMonth || (!i.mes && dashboardMonth === 1)));
                    
                    return (
                      <div key={t.id} className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${isAssigned ? 'border-gold/30 bg-gradient-to-b from-gold/5 to-transparent' : 'border-white/5 opacity-40 hover:opacity-60'}`}>
                        {isAssigned && (
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Dumbbell size={60} />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl transition-all ${isAssigned ? 'bg-gold text-black shadow-gold/20' : 'bg-[#1A1A1A] text-gray-700'}`}>
                              {t.id}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-white uppercase tracking-widest leading-tight">{t.titulo}</p>
                              <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isAssigned ? 'text-gold' : 'text-gray-600'}`}>
                                {isAssigned ? 'Ficha Ativa' : 'Inativa'}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleToggleAssignment(t.id)} 
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isAssigned ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                            title={isAssigned ? 'Desativar Ficha' : 'Ativar Ficha'}
                          >
                            {isAssigned ? <X size={16} /> : <Plus size={16} />}
                          </button>
                        </div>

                        {isAssigned && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <button 
                              onClick={() => handleStartEditWorkout(t.id)} 
                              className="w-full py-3.5 bg-white text-black rounded-2xl font-black text-[9px] uppercase hover:bg-gold transition-all flex items-center justify-center shadow-xl active:scale-95"
                            >
                              <Settings2 size={14} className="mr-2" />
                              Configurar Exercícios
                            </button>
                            
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Status no Ciclo Anual</p>
                                {!hasExercisesThisMonth && (
                                  <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                                )}
                              </div>
                              <div className="flex justify-between items-center gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                                  const hasEx = items.some(i => i.user_id === selectedAluno.id && i.workout_id === t.id && (i.mes === m || (!i.mes && m === 1)));
                                  const isCurrent = dashboardMonth === m;
                                  return (
                                    <button 
                                      key={m} 
                                      onClick={(e) => { e.stopPropagation(); setDashboardMonth(m); }}
                                      className={`group/dot relative flex flex-col items-center flex-1`}
                                    >
                                      <div className={`w-full h-1 rounded-full transition-all ${hasEx ? 'bg-gold' : 'bg-white/5'} ${isCurrent ? 'ring-2 ring-white/20' : ''}`}></div>
                                      <span className={`text-[5px] font-black mt-1.5 transition-colors ${isCurrent ? 'text-gold' : 'text-gray-700 group-hover/dot:text-gray-400'}`}>M{m}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {!hasExercisesThisMonth && (
                                <p className="text-[7px] font-black text-red-500/80 uppercase mt-3 text-center tracking-tighter italic">
                                  ⚠️ Sem exercícios configurados para o Mês {dashboardMonth}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : viewMode === 'evolucao' ? (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center"><Activity size={14} className="mr-2 text-gold" /> Painel de Evolução Física</h4>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gold text-black px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-gold/20 active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  <span>Nova Avaliação</span>
                </button>
              </div>
              {/* Evolution Dashboard for Professor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-premium p-6 rounded-[2.5rem] border-l-4 border-l-gold">
                  <div className="flex items-center space-x-2 mb-2 text-gray-500"><Scale size={14} /><span className="text-[9px] font-black uppercase">Peso Atual</span></div>
                  <p className="text-3xl font-black">{latestEval?.peso || '--'} <span className="text-xs text-gray-600">KG</span></p>
                </div>
                <div className="card-premium p-6 rounded-[2.5rem] border-l-4 border-l-emerald-500">
                  <div className="flex items-center space-x-2 mb-2 text-gray-500"><Percent size={14} /><span className="text-[9px] font-black uppercase">Gordura Est.</span></div>
                  <p className="text-3xl font-black">{latestEval?.gordura_percentual || '--'} <span className="text-xs text-gray-600">%</span></p>
                </div>
                <div className="card-premium p-6 rounded-[2.5rem] border-l-4 border-l-blue-500">
                  <div className="flex items-center space-x-2 mb-2 text-gray-500"><TrendingUp size={14} /><span className="text-[9px] font-black uppercase">Séries Totais</span></div>
                  <p className="text-3xl font-black">{alunoProgress.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-premium p-8 rounded-[3rem]">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-8 flex items-center"><Scale size={14} className="mr-2 text-gold" /> Tendência de Peso</h4>
                  <div className="h-48 w-full min-h-[192px]">
                    {chartFisicoData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={chartFisicoData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                          <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="peso" stroke="#C6A15B" strokeWidth={4} dot={{ r: 4, fill: '#C6A15B' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-gray-700 italic text-[10px]">Aguardando mais avaliações...</div>}
                  </div>
                </div>

                <div className="card-premium p-8 rounded-[3rem]">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-8 flex items-center"><TrendingUp size={14} className="mr-2 text-gold" /> Volume de Carga Recente</h4>
                  <div className="h-48 w-full min-h-[192px]">
                    {chartPerformanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={chartPerformanceData}>
                          <defs>
                            <linearGradient id="colorProfPerf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#C6A15B" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                          <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="peso" stroke="#C6A15B" strokeWidth={3} fill="url(#colorProfPerf)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-gray-700 italic text-[10px]">Sem registros de treino.</div>}
                  </div>
                </div>
              </div>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center"><Ruler size={16} className="mr-2 text-gold" /> Histórico de Medidas Detalhado</h4>
                <div className="space-y-4">
                   {alunoAvaliacoes.length > 0 ? alunoAvaliacoes.slice().reverse().map(ev => (
                     <div key={ev.id} className="bg-[#111] border border-[#222] p-6 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222]">
                          <span className="text-xs font-black text-white italic">{new Date(ev.date).toLocaleDateString()}</span>
                          <span className="bg-gold text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase">{ev.peso} KG</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {renderMedidaItem("Pescoço", ev.medidas.pescoco)}
                          {renderMedidaItem("Ombros", ev.medidas.ombros)}
                          {renderMedidaItem("Tórax", ev.medidas.torax)}
                          {renderMedidaItem("Cintura", ev.medidas.cintura)}
                          {renderMedidaItem("Abdomem", ev.medidas.abdomem)}
                          {renderMedidaItem("Quadril", ev.medidas.quadril)}
                          {renderMedidaItem("Braço D", ev.medidas.braco_d)}
                          {renderMedidaItem("Braço E", ev.medidas.braco_e)}
                          {renderMedidaItem("Anteb. D", ev.medidas.antebraco_d)}
                          {renderMedidaItem("Anteb. E", ev.medidas.antebraco_e)}
                          {renderMedidaItem("Coxa D", ev.medidas.coxa_d)}
                          {renderMedidaItem("Coxa E", ev.medidas.coxa_e)}
                          {renderMedidaItem("Pant. D", ev.medidas.panturrilha_d)}
                          {renderMedidaItem("Pant. E", ev.medidas.panturrilha_e)}
                        </div>
                     </div>
                   )) : (
                    <div className="py-20 text-center border-2 border-dashed border-[#222] rounded-[3rem] text-gray-700 font-bold uppercase text-[10px]">O aluno ainda não registrou avaliações.</div>
                   )}
                </div>
              </section>
            </div>
          ) : (
            /* NOVA ABA DE SUPLEMENTAÇÃO NO PAINEL DO PROFESSOR */
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
               <div className="bg-[#111] border border-[#222] p-8 rounded-[3.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShoppingBag size={120} />
                  </div>
                  <div className="flex items-center space-x-4 mb-8">
                     <div className="p-4 bg-gold/10 rounded-2xl text-gold">
                        <Apple size={28} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black italic uppercase">Plano de Suplementação</h4>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Recomendações atuais para {selectedAluno.nome}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-black/40 border border-[#222] p-6 rounded-[2rem] hover:border-gold/30 transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                           <Zap className="text-gold" size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Estratégia Pré-Treino</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">Creatina 5g + Cafeína 200mg + Beta-Alanina para maximizar o volume de carga.</p>
                        <div className="flex items-center space-x-2 text-[9px] font-black text-gold uppercase">
                           <Target size={12} />
                           <span>Foco em Performance Explosiva</span>
                        </div>
                     </div>

                     <div className="bg-black/40 border border-[#222] p-6 rounded-[2rem] hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                           <Package className="text-emerald-500" size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Estratégia Recuperação</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">Whey Isolate 30g + Glutamina 5g. Manter aporte proteico constante.</p>
                        <div className="flex items-center space-x-2 text-[9px] font-black text-emerald-500 uppercase">
                           <Check size={12} />
                           <span>Protocolo Pós-Sessão VIP</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-[#222]">
                     <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Produtos Recomendados (Loja Parceira)</h5>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { name: "Whey Protein", icon: Package },
                          { name: "Creatina", icon: Zap },
                          { name: "Multivitamínico", icon: Target }
                        ].map((prod, i) => (
                           <div key={i} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-[#222]">
                              <prod.icon className="text-gold" size={16} />
                              <span className="text-xs font-bold text-white">{prod.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="bg-gold/5 border border-gold/10 p-6 rounded-[2rem] flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-medium max-w-md">Para alterar os links de compra ou cupons, acesse a <span className="text-gold font-bold">Aba de Loja</span> na navegação principal.</p>
                  <button className="bg-gold text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2">
                     <Save size={14} />
                     <span>Editar Protocolo</span>
                  </button>
               </div>
            </div>
          )}
        </div>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
              <Users className="text-gold mr-2" size={14} />
              <span>Sua Legião de Atletas</span>
            </h3>
            <button 
              onClick={() => setShowAddStudentModal(true)}
              className="bg-gold text-black px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-gold/10 active:scale-95 transition-all hover:brightness-110"
            >
              <UserPlus size={14} />
              <span>Novo Aluno</span>
            </button>
          </div>
          <div className="space-y-4">
            {alunos.map(aluno => {
              const studentProgress = allProgress.filter(p => p.user_id === aluno.id);
              const trainedToday = studentProgress.some(p => new Date(p.date).toLocaleDateString() === new Date().toLocaleDateString());
              
              const rank = getRank(studentProgress.length);

              const defaultAvatar = "/aluno.png";
              
              const getAvatar = (foto?: string) => {
                if (!foto || foto.includes('dicebear.com')) return defaultAvatar;
                return foto;
              };

              return (
                <button key={aluno.id} onClick={() => setSelectedAluno(aluno)} className="w-full card-premium p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-gold transition-all shadow-lg text-left">
                  <div className="flex items-center space-x-5">
                    <div className="relative">
                      <img 
                        src={getAvatar(aluno.foto)} 
                        className="w-16 h-16 bg-[#111] rounded-2xl border-2 border-gold/20 object-cover shadow-2xl group-hover:border-gold transition-all" 
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[#0A0A0A] shadow-lg ${trainedToday ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                        {trainedToday ? <Check size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-black text-xl text-white group-hover:text-gold transition-colors">{aluno.nome}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-current flex items-center space-x-1 ${rank.color} ${rank.bg}`}>
                          {rank.icon}
                          <span>{rank.title}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{aluno.objetivo || 'Foco em Performance'}</p>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <p className={`text-[10px] font-bold ${trainedToday ? 'text-emerald-500' : 'text-gray-600'}`}>
                          {trainedToday ? 'TREINOU HOJE' : 'AINDA NÃO TREINOU'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-[#1A1A1A] rounded-2xl text-gray-600 group-hover:bg-gold group-hover:text-black transition-all"><ChevronRight size={20} /></div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfessorPainel;
