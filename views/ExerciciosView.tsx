import React, { useState, useMemo, useEffect, useRef } from 'react';
import { db } from '../services/storage';
import { useNotification } from '../components/Notification';
import {
  Search,
  Youtube,
  Dumbbell,
  Plus,
  Check,
  Trash2,
  Wand2,
  X,
  UserPlus,
  Save,
  Hash,
  Repeat,
  Timer,
  Settings2,
  Library,
  Star,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  CalendarDays,
  CalendarRange,
  Target,
  Trophy,
  CheckCircle2,
  GripVertical,
  Copy,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Exercicio, FichaTreinoItem, MesPeriodizacao, Usuario, Atribuicao } from '../types';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const FASES_PERIODIZACAO = [
  'Adaptação',
  'Hipertrofia I',
  'Hipertrofia II',
  'Força Máxima',
  'Resistência Muscular',
  'Cutting / Definição',
  'Deload / Recuperação',
  'Pico de Performance',
];

const SHEETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const normalizeExercise = (ex: any): Exercicio => ({
  id: ex.id,
  nome: ex.nome ?? '',
  grupoId: ex.grupoId ?? ex.grupo_id ?? '',
  grupoNome: ex.grupoNome ?? ex.grupo_nome ?? '',
  subgrupoId: ex.subgrupoId ?? ex.subgrupo_id ?? '',
  subgrupoNome: ex.subgrupoNome ?? ex.subgrupo_nome ?? '',
  equipamento: ex.equipamento ?? '',
  tipo: ex.tipo ?? '',
  nivel: ex.nivel ?? '',
  video_url: ex.video_url ?? '',
  descricao: ex.descricao ?? '',
  destaque: ex.destaque ?? false,
});

const SortableItem = ({ item, index, allExercises, toggleSelection, updateConfig, isOverlay = false }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item?.id || 'overlay' });

  if (!item) return null;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : isOverlay ? 100 : 'auto',
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  const ex = allExercises.find((e: any) => e.id === item.exerciseId);
  if (!ex) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card-premium p-3 rounded-2xl border border-[#222] bg-[#111]/50 group relative ${
        isOverlay ? 'shadow-2xl border-gold/50 bg-[#1A1A1A]' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 bg-[#1A1A1A] rounded-lg border border-[#222] text-gray-600 hover:text-gold transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="flex-none w-4 h-4 rounded bg-gold/10 text-gold flex items-center justify-center text-[8px] font-black">
                {index + 1}
              </span>
              <h4 className="font-black text-white text-xs truncate">{ex.nome}</h4>
            </div>
            <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest truncate">
              {ex.grupoNome} • {ex.equipamento}
            </p>
          </div>
        </div>
        {!isOverlay && (
          <button
            onClick={() => toggleSelection(item.exerciseId)}
            className="p-1.5 bg-[#1A1A1A] text-gray-600 hover:text-red-500 rounded-lg border border-[#222] transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-black/40 p-2 rounded-xl border border-[#222] focus-within:border-gold/50 transition-colors">
          <label className="text-[6px] text-gray-500 font-black uppercase mb-0.5 tracking-widest flex items-center">
            <Hash size={7} className="mr-1 text-gold" /> Séries
          </label>
          <input
            type="number"
            className="bg-transparent text-white font-black text-sm outline-none w-full"
            value={item.series}
            onChange={(e) => updateConfig(item.id, 'series', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="bg-black/40 p-2 rounded-xl border border-[#222] focus-within:border-gold/50 transition-colors">
          <label className="text-[6px] text-gray-500 font-black uppercase mb-0.5 tracking-widest flex items-center">
            <Repeat size={7} className="mr-1 text-gold" /> Reps
          </label>
          <input
            type="text"
            className="bg-transparent text-white font-black text-sm outline-none w-full"
            value={item.reps}
            onChange={(e) => updateConfig(item.id, 'reps', e.target.value)}
          />
        </div>

        <div className="bg-black/40 p-2 rounded-xl border border-[#222] focus-within:border-gold/50 transition-colors">
          <label className="text-[6px] text-gray-500 font-black uppercase mb-0.5 tracking-widest flex items-center">
            <Timer size={7} className="mr-1 text-gold" /> Pausa
          </label>
          <input
            type="text"
            className="bg-transparent text-white font-black text-sm outline-none w-full"
            value={item.descanso}
            onChange={(e) => updateConfig(item.id, 'descanso', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-1.5 bg-black/40 p-2 rounded-xl border border-[#222] focus-within:border-gold/50 transition-colors relative">
        <label className="text-[6px] text-gray-500 font-black uppercase mb-0.5 tracking-widest flex items-center">
          <Settings2 size={7} className="mr-1 text-gold" /> Método / Técnica
        </label>
        <div className="relative">
          <select
            className="bg-transparent text-white font-black text-[10px] outline-none w-full cursor-pointer pr-6 appearance-none"
            value={item.metodo || ''}
            onChange={(e) => updateConfig(item.id, 'metodo', e.target.value)}
          >
            <option value="" className="bg-[#111]">
              Padrão (Séries Normais)
            </option>
            <option value="Drop Set" className="bg-[#111]">
              Drop Set
            </option>
            <option value="Cluster Set" className="bg-[#111]">
              Cluster Set
            </option>
            <option value="Rest-Pause" className="bg-[#111]">
              Rest-Pause
            </option>
            <option value="Bi-Set" className="bg-[#111]">
              Bi-Set
            </option>
            <option value="Tri-Set" className="bg-[#111]">
              Tri-Set
            </option>
            <option value="GVT" className="bg-[#111]">
              GVT (10x10)
            </option>
            <option value="FST-7" className="bg-[#111]">
              FST-7
            </option>
            <option value="Pirâmide" className="bg-[#111]">
              Pirâmide
            </option>
          </select>
          <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

interface ExerciciosViewProps {
  defaultAlunoId?: string;
  initialSheet?: string;
  initialMonth?: number;
  onUpdate?: () => void;
}

const ExerciciosView: React.FC<ExerciciosViewProps> = ({
  defaultAlunoId,
  initialSheet,
  initialMonth,
  onUpdate,
}) => {
  const { notify, confirm } = useNotification();

  const [user, setUser] = useState<Usuario | null>(null);
  const [allExercises, setAllExercises] = useState<Exercicio[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [items, setItems] = useState<FichaTreinoItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, any[]>>({});
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSheet, setActiveSheet] = useState<string>(initialSheet || 'A');
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth || 1);
  const [subTab, setSubTab] = useState<'library' | 'config' | 'periodizacao'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('all');
  const [targetAlunoId, setTargetAlunoId] = useState<string>(defaultAlunoId || '');
  const [showToast, setShowToast] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [selectedList, setSelectedList] = useState<
    { id: string; exerciseId: string; series: number; reps: string; descanso: string; metodo?: string }[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [periodizacao, setPeriodizacao] = useState<MesPeriodizacao[]>([]);
  const [showCloneMenu, setShowCloneMenu] = useState<'sheet' | 'month' | null>(null);
  const [sheetCounts, setSheetCounts] = useState<Record<string, number>>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
  });

  const monthScrollRef = useRef<HTMLDivElement>(null);
  const groupScrollRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const grupos = useMemo(() => {
    const map = new Map<string, string>();
    allExercises.forEach((e) => {
      if (e.grupoId && e.grupoNome) {
        map.set(e.grupoId, e.grupoNome);
      }
    });
    const list = Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    return [...list, ['templates', 'Templates']];
  }, [allExercises]);

  const equipamentos = useMemo(() => {
    const set = new Set<string>();
    allExercises.forEach((e) => {
      if (e.equipamento) set.add(e.equipamento);
    });
    return Array.from(set).sort();
  }, [allExercises]);

  const filtrados = useMemo(() => {
    if (selectedGroupId === 'templates') return [];
    const term = searchTerm.trim().toLowerCase();

    return allExercises.filter((e) => {
      const okGrupo =
        selectedGroupId === 'all'
          ? true
          : selectedGroupId === 'destaques'
          ? !!e.destaque
          : e.grupoId === selectedGroupId;

      const okEquip = selectedEquipmentId === 'all' ? true : e.equipamento === selectedEquipmentId;
      const okBusca =
        !term ||
        e.nome.toLowerCase().includes(term) ||
        e.subgrupoNome.toLowerCase().includes(term);

      return okGrupo && okEquip && okBusca;
    });
  }, [allExercises, selectedGroupId, selectedEquipmentId, searchTerm]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [u, e, users, i, t, a] = await Promise.all([
          db.getLoggedUser(),
          db.getExercises(),
          db.getUsers(),
          db.getItems(),
          db.getTemplates(),
          db.getAssignments(),
        ]);

        const normalizedExercises = (e || []).map((ex: any) => normalizeExercise(ex));

        setUser(u);
        setAllExercises(normalizedExercises);
        setAlunos((users || []).filter((currentUser) => currentUser.role === 'aluno'));
        setItems(i || []);
        setTemplates(t || {});
        setAssignments(a || []);

        console.log('ALL EXERCISES NORMALIZED:', normalizedExercises);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setAllExercises([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadSheetCounts = (sourceItems = items, sourceTemplates = templates) => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };

    if (targetAlunoId === 'global') {
      Object.keys(sourceTemplates).forEach((id) => {
        if (counts[id] !== undefined) {
          counts[id] = sourceTemplates[id]?.length || 0;
        }
      });
    } else if (targetAlunoId) {
      const filteredItems = sourceItems.filter(
        (item) => item.user_id === targetAlunoId && item.mes === selectedMonth
      );
      filteredItems.forEach((item) => {
        if (counts[item.workout_id] !== undefined) {
          counts[item.workout_id]++;
        }
      });
    }

    setSheetCounts(counts);
  };

  useEffect(() => {
    loadSheetCounts();
  }, [selectedMonth, items, templates, targetAlunoId]);

  useEffect(() => {
    const loadPeriodizacao = async () => {
      if (targetAlunoId && targetAlunoId !== 'global') {
        try {
          const saved = await db.getPeriodizacao(targetAlunoId);
          if (saved) {
            setPeriodizacao(saved.meses);
          } else {
            const initial = Array.from({ length: 12 }, (_, i) => ({
              mes: i + 1,
              fase: FASES_PERIODIZACAO[0],
              objetivo: '',
            }));
            setPeriodizacao(initial);
          }
        } catch (error) {
          console.error('Error loading periodizacao:', error);
        }
      }
    };

    loadPeriodizacao();
  }, [targetAlunoId]);

  useEffect(() => {
    let mapped: any[] = [];

    if (targetAlunoId === 'global') {
      const templateItems = templates[activeSheet] || [];
      mapped = templateItems.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        exerciseId: item.exercise_id,
        series: item.series,
        reps: item.reps,
        descanso: item.descanso,
        metodo: item.metodo || '',
      }));
    } else if (targetAlunoId) {
      const existingItems = items
        .filter(
          (i) =>
            i.user_id === targetAlunoId &&
            i.workout_id === activeSheet &&
            i.mes === selectedMonth
        )
        .sort((a, b) => a.ordem - b.ordem);

      mapped = existingItems.map((item) => ({
        id: item.id,
        exerciseId: item.exercise_id,
        series: item.series,
        reps: item.reps,
        descanso: item.descanso,
        metodo: item.metodo || '',
      }));
    }

    setSelectedList(mapped);

    if (subTab !== 'periodizacao') {
      setSubTab(mapped.length > 0 ? 'config' : 'library');
    }
  }, [targetAlunoId, activeSheet, selectedMonth, items, templates]);

  useEffect(() => {
    setShowCloneMenu(null);
  }, [activeSheet, selectedMonth, targetAlunoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'professor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <X className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acesso Negado</h2>
        <p className="text-gray-500 mt-2">Apenas professores podem acessar o Construtor VIP.</p>
      </div>
    );
  }

  const scrollMonths = (direction: 'left' | 'right') => {
    if (monthScrollRef.current) {
      const { scrollLeft } = monthScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 80 : scrollLeft + 80;
      monthScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const scrollGroups = (direction: 'left' | 'right') => {
    if (groupScrollRef.current) {
      const { scrollLeft } = groupScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 150 : scrollLeft + 150;
      groupScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const scrollSheets = (direction: 'left' | 'right') => {
    if (sheetScrollRef.current) {
      const { scrollLeft } = sheetScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 100 : scrollLeft + 100;
      sheetScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const triggerSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleSelection = (exerciseId: string) => {
    setSelectedList((prev) => {
      const exists = prev.some((item) => item.exerciseId === exerciseId);

      if (exists) {
        return prev.filter((item) => item.exerciseId !== exerciseId);
      }

      return [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          exerciseId,
          series: 3,
          reps: '12',
          descanso: '60s',
          metodo: '',
        },
      ];
    });
  };

  const updateConfig = (
    id: string,
    field: 'series' | 'reps' | 'descanso' | 'metodo',
    value: string | number
  ) => {
    setSelectedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const updatePeriodizacao = (index: number, field: keyof MesPeriodizacao, value: string) => {
    const newP = [...periodizacao];
    newP[index] = { ...newP[index], [field]: value };
    setPeriodizacao(newP);
  };

  const handleSavePeriodizacao = async () => {
    if (!targetAlunoId) return;

    try {
      await db.savePeriodizacao({
        user_id: targetAlunoId,
        meses: periodizacao,
      });
      triggerSuccessToast();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving periodizacao:', error);
      notify('Erro ao salvar periodização', 'error');
    }
  };

  const handleCopyPreviousMonthPeriodizacao = (idx: number) => {
    if (idx === 0) return;

    const prevMonth = periodizacao[idx - 1];
    const newP = [...periodizacao];
    newP[idx] = {
      ...newP[idx],
      fase: prevMonth.fase,
      objetivo: prevMonth.objetivo,
    };
    setPeriodizacao(newP);
  };

  const handleSaveSheet = async () => {
    if (!targetAlunoId) {
      notify('Selecione um aluno antes de salvar a ficha', 'error');
      return;
    }

    if (targetAlunoId === 'global') {
      const templateData = selectedList.map((item, index) => ({
        id: item.id,
        exercise_id: item.exerciseId,
        exercise_name: allExercises.find((ex) => ex.id === item.exerciseId)?.nome,
        series: item.series,
        reps: item.reps,
        descanso: item.descanso,
        metodo: item.metodo || '',
        ordem: index + 1,
      }));

      const updatedTemplates = {
        ...templates,
        [activeSheet]: templateData,
      };

      try {
        await db.saveTemplates(updatedTemplates);
        setTemplates(updatedTemplates);
        loadSheetCounts(items, updatedTemplates);
        triggerSuccessToast();
        onUpdate?.();
      } catch (error) {
        console.error('Error saving templates:', error);
        notify('Erro ao salvar templates', 'error');
      }
      return;
    }

    const cleanedItems = items.filter(
      (i) =>
        !(
          i.user_id === targetAlunoId &&
          i.workout_id === activeSheet &&
          i.mes === selectedMonth
        )
    );

    const newItems: FichaTreinoItem[] = selectedList.map((item, index) => ({
      id: item.id,
      user_id: targetAlunoId,
      workout_id: activeSheet,
      exercise_id: item.exerciseId,
      series: item.series,
      reps: item.reps,
      descanso: item.descanso,
      metodo: item.metodo || '',
      ordem: index + 1,
      mes: selectedMonth,
    }));

    try {
      await db.deleteItems(targetAlunoId, activeSheet, selectedMonth);

      if (newItems.length > 0) {
        await db.saveItems(newItems);
      }

      const updatedItems = [...cleanedItems, ...newItems];
      setItems(updatedItems);

      const exists = assignments.find(
        (a) => a.user_id === targetAlunoId && a.workout_id === activeSheet
      );

      if (!exists && newItems.length > 0) {
        const newAssignment: Atribuicao = {
          user_id: targetAlunoId,
          workout_id: activeSheet,
          ativo: true,
          data_inicio: new Date().toISOString(),
        };

        const updatedAssignments = [...assignments, newAssignment];
        await db.saveAssignments(updatedAssignments);
        setAssignments(updatedAssignments);
      }

      loadSheetCounts(updatedItems, templates);
      triggerSuccessToast();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving sheet:', error);
      notify('Erro ao salvar ficha', 'error');
    }
  };

  const handleCloneSheet = async (targetSheet: string) => {
    if (targetSheet === activeSheet) return;

    if (targetAlunoId === 'global') {
      const updatedTemplates = {
        ...templates,
        [targetSheet]: [...(templates[activeSheet] || [])],
      };

      try {
        await db.saveTemplates(updatedTemplates);
        setTemplates(updatedTemplates);
        loadSheetCounts(items, updatedTemplates);
        triggerSuccessToast();
        setActiveSheet(targetSheet);
        setShowCloneMenu(null);
      } catch (error) {
        console.error('Error cloning template:', error);
        notify('Erro ao clonar template', 'error');
      }
      return;
    }

    const clonedItems: FichaTreinoItem[] = selectedList.map((item, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      user_id: targetAlunoId || '',
      workout_id: targetSheet,
      exercise_id: item.exerciseId,
      series: item.series,
      reps: item.reps,
      descanso: item.descanso,
      metodo: item.metodo || '',
      ordem: index + 1,
      mes: selectedMonth,
    }));

    try {
      if (targetAlunoId) {
        await db.deleteItems(targetAlunoId, targetSheet, selectedMonth);
        if (clonedItems.length > 0) {
          await db.saveItems(clonedItems);
        }
      }

      const updatedItems = [
        ...items.filter(
          (i) =>
            !(
              i.user_id === targetAlunoId &&
              i.workout_id === targetSheet &&
              i.mes === selectedMonth
            )
        ),
        ...clonedItems,
      ];

      setItems(updatedItems);

      if (targetAlunoId) {
        const exists = assignments.find(
          (a) => a.user_id === targetAlunoId && a.workout_id === targetSheet
        );

        if (!exists && clonedItems.length > 0) {
          const newAssignment: Atribuicao = {
            user_id: targetAlunoId,
            workout_id: targetSheet,
            ativo: true,
            data_inicio: new Date().toISOString(),
          };

          const updatedAssignments = [...assignments, newAssignment];
          await db.saveAssignments(updatedAssignments);
          setAssignments(updatedAssignments);
        }
      }

      loadSheetCounts(updatedItems, templates);
      triggerSuccessToast();
      onUpdate?.();
      setActiveSheet(targetSheet);
      setShowCloneMenu(null);
    } catch (error) {
      console.error('Error cloning sheet:', error);
      notify('Erro ao clonar ficha', 'error');
    }
  };

  const handleCloneMonth = async (targetMonth: number) => {
    if (targetMonth === selectedMonth || targetAlunoId === 'global') return;

    const currentMonthItems = items.filter(
      (i) => i.user_id === targetAlunoId && i.mes === selectedMonth
    );

    const clonedItems: FichaTreinoItem[] = currentMonthItems.map((item) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      mes: targetMonth,
    }));

    try {
      if (targetAlunoId) {
        await db.deleteMonthItems(targetAlunoId, targetMonth);
        if (clonedItems.length > 0) {
          await db.saveItems(clonedItems);
        }
      }

      const updatedItems = [
        ...items.filter((i) => !(i.user_id === targetAlunoId && i.mes === targetMonth)),
        ...clonedItems,
      ];
      setItems(updatedItems);

      if (targetAlunoId) {
        const uniqueWorkouts = Array.from(new Set(clonedItems.map((i) => i.workout_id)));
        const newAssignments: Atribuicao[] = [];

        uniqueWorkouts.forEach((wid) => {
          const exists = assignments.find(
            (a) => a.user_id === targetAlunoId && a.workout_id === wid
          );
          if (!exists) {
            newAssignments.push({
              user_id: targetAlunoId,
              workout_id: wid,
              ativo: true,
              data_inicio: new Date().toISOString(),
            });
          }
        });

        if (newAssignments.length > 0) {
          const updatedAssignments = [...assignments, ...newAssignments];
          await db.saveAssignments(updatedAssignments);
          setAssignments(updatedAssignments);
        }

        const currentPeriod = await db.getPeriodizacao(targetAlunoId);
        if (currentPeriod) {
          const sourceData = currentPeriod.meses.find((m) => m.mes === selectedMonth);
          if (sourceData) {
            const newMeses = currentPeriod.meses.map((m) =>
              m.mes === targetMonth
                ? { ...m, fase: sourceData.fase, objetivo: sourceData.objetivo }
                : m
            );
            const updatedPeriod = { ...currentPeriod, meses: newMeses };
            await db.savePeriodizacao(updatedPeriod);
            setPeriodizacao(updatedPeriod.meses);
          }
        }
      }

      loadSheetCounts(updatedItems, templates);
      triggerSuccessToast();
      onUpdate?.();
      setSelectedMonth(targetMonth);
      setShowCloneMenu(null);
    } catch (error) {
      console.error('Error cloning month:', error);
      notify('Erro ao clonar mês', 'error');
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    const itemsToLoad = templates[templateId];
    if (!itemsToLoad || itemsToLoad.length === 0) return;

    if (
      await confirm({
        title: 'Carregar Template',
        message: `Deseja carregar o Template ${templateId}? Isso substituirá os exercícios atuais.`,
        confirmText: 'Carregar',
        cancelText: 'Cancelar',
      })
    ) {
      const mapped = itemsToLoad.map((item: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        exerciseId: item.exercise_id,
        series: item.series,
        reps: item.reps,
        descanso: item.descanso,
        metodo: item.metodo || '',
      }));
      setSelectedList(mapped);
      setSubTab('config');
      triggerSuccessToast();
    }
  };

  const selectedCount = selectedList.length;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSelectedList((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(currentItems, oldIndex, newIndex);
        }
        return currentItems;
      });
    }
  };

  const getYoutubeId = (url: string | undefined | null) => {
    if (!url) return null;

    try {
      const cleanUrl = url.trim();

      const shortDomainMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortDomainMatch) return shortDomainMatch[1];

      const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];

      const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (watchMatch) return watchMatch[1];

      const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      return null;
    } catch {
      return null;
    }
  };

  const renderVideoModal = () => {
    if (!activeVideo) return null;
    const videoId = getYoutubeId(activeVideo);

    return (
      <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
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
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-40">
      {renderVideoModal()}

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-300">
          <div className="bg-[#111] border-2 border-gold rounded-2xl px-6 py-4 shadow-2xl flex items-center space-x-3 backdrop-blur-xl">
            <div className="bg-gold/20 p-2 rounded-full">
              <CheckCircle2 className="text-gold" size={20} />
            </div>
            <span className="text-white font-black uppercase text-xs tracking-widest">
              Salvo com sucesso!
            </span>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#0A0A0A] p-5 sm:p-6 rounded-[2.5rem] border border-white/5 mb-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-[80px] -mr-24 -mt-24 rounded-full"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-[#A6813B] text-black rounded-xl flex items-center justify-center shadow-xl shadow-gold/10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <CalendarRange size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-tighter leading-tight">
              Ciclo de Treino Olimpiano
            </h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] flex items-center">
              <span className="w-6 h-[1px] bg-gold/30 mr-2"></span>
              Jornada de 12 meses do atleta
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 relative z-10">
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center ml-1 opacity-70">
              <UserPlus size={12} className="mr-2" /> Destinatário do Planejamento
            </label>
            <div className="flex items-center gap-3">
              <div className="relative group flex-1">
                <select
                  className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-xs font-black text-white outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all appearance-none min-w-[200px] cursor-pointer group-hover:border-white/20"
                  value={targetAlunoId}
                  onChange={(e) => setTargetAlunoId(e.target.value)}
                >
                  <option value="" className="bg-[#0A0A0A]">
                    Selecione um Aluno
                  </option>
                  <option value="global" className="bg-[#0A0A0A] text-gold font-black">
                    ⭐ BIBLIOTECA GLOBAL (TEMPLATES)
                  </option>
                  <optgroup label="ALUNOS ATIVOS" className="bg-[#0A0A0A] text-gray-500">
                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id} className="bg-[#0A0A0A] text-white">
                        {aluno.nome.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold group-hover:scale-110 transition-transform">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[72px] z-40 -mx-4 px-4 py-4 bg-[#0A0A0A]/95 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-all duration-300" size={18} />
            <input
              type="text"
              placeholder="Buscar exercício na biblioteca..."
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-3.5 pl-14 pr-6 focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all text-xs text-white font-black uppercase tracking-widest placeholder:text-gray-700 placeholder:font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 overflow-x-auto gold-scrollbar pb-2">
              {targetAlunoId !== 'global' && (
                <div className="relative group/scroll-month flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shrink-0 shadow-inner">
                  <button
                    onClick={() => scrollMonths('left')}
                    className="absolute left-0 z-10 w-6 h-6 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-gold opacity-0 group-hover/scroll-month:opacity-100 transition-opacity -ml-2"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div
                    ref={monthScrollRef}
                    className="flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] scroll-smooth"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMonth(m)}
                        className={`min-w-[36px] h-8 rounded-lg font-black text-[10px] transition-all shrink-0 flex items-center justify-center ${
                          selectedMonth === m
                            ? 'bg-gold text-black shadow-lg shadow-gold/20 scale-105'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        M{m}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => scrollMonths('right')}
                    className="absolute right-0 z-10 w-6 h-6 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-gold opacity-0 group-hover/scroll-month:opacity-100 transition-opacity -mr-2"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              <div className="relative group/scroll-sheet flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shrink-0 shadow-inner">
                <button
                  onClick={() => scrollSheets('left')}
                  className="absolute left-0 z-10 w-6 h-6 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-gold opacity-0 group-hover/scroll-sheet:opacity-100 transition-opacity -ml-2"
                >
                  <ChevronLeft size={14} />
                </button>

                <div
                  ref={sheetScrollRef}
                  className="flex items-center overflow-x-auto no-scrollbar max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] scroll-smooth"
                >
                  {SHEETS.map((letter) => {
                    const isActive = activeSheet === letter;
                    const count = sheetCounts[letter] || 0;
                    return (
                      <button
                        key={letter}
                        onClick={() => setActiveSheet(letter)}
                        className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all relative mx-0.5 shrink-0 flex items-center justify-center ${
                          isActive
                            ? 'bg-white text-black shadow-2xl scale-110 z-10'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {letter}
                        {count > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border-2 border-[#0A0A0A] bg-gold text-black">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => scrollSheets('right')}
                  className="absolute right-0 z-10 w-6 h-6 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-gold opacity-0 group-hover/scroll-sheet:opacity-100 transition-opacity -mr-2"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10 shrink-0 shadow-inner w-fit">
              {[
                { id: 'library', icon: Library, label: 'Biblioteca' },
                { id: 'config', icon: Target, label: 'Ajuste' },
                ...(targetAlunoId !== 'global'
                  ? [{ id: 'periodizacao', icon: CalendarDays, label: 'Ciclo' }]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                    subTab === tab.id
                      ? 'bg-gold/10 text-gold shadow-lg shadow-gold/5'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  <tab.icon size={14} />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {subTab === 'library' && (
        <section className="space-y-6 animate-in fade-in duration-300">
          <div className="relative flex items-center group/scroll">
            <button
              onClick={() => scrollGroups('left')}
              className="absolute left-0 z-10 w-8 h-8 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-gold opacity-0 group-hover/scroll:opacity-100 transition-opacity -ml-3"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={groupScrollRef}
              className="flex items-center space-x-3 overflow-x-auto gold-scrollbar pb-4 scroll-smooth"
            >
              <button
                onClick={() => setSelectedGroupId('all')}
                className={`flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                  selectedGroupId === 'all'
                    ? 'bg-gold border-gold text-black shadow-xl shadow-gold/20'
                    : 'bg-[#111] border-white/5 text-gray-600 hover:border-gold/30'
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => setSelectedGroupId('destaques')}
                className={`flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 flex items-center space-x-2 ${
                  selectedGroupId === 'destaques'
                    ? 'bg-amber-500 border-amber-500 text-black shadow-amber-500/20'
                    : 'bg-[#111] border-white/5 text-gray-600 hover:border-amber-500/30'
                }`}
              >
                <Star size={14} className={selectedGroupId === 'destaques' ? 'fill-black' : 'fill-amber-500'} />
                <span>Destaques</span>
              </button>

              {grupos.map(([id, nome]) => {
                const groupColors: Record<string, string> = {
                  peito: 'bg-red-600 border-red-600 text-white shadow-red-600/20',
                  costas: 'bg-blue-600 border-blue-600 text-white shadow-blue-600/20',
                  ombros: 'bg-orange-600 border-orange-600 text-white shadow-orange-600/20',
                  bracos: 'bg-purple-600 border-purple-600 text-white shadow-purple-600/20',
                  pernas: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20',
                  'abdomen-core': 'bg-cyan-600 border-cyan-600 text-white shadow-cyan-600/20',
                  funcional: 'bg-yellow-600 border-yellow-600 text-white shadow-yellow-600/20',
                };

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedGroupId(id)}
                    className={`flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                      selectedGroupId === id
                        ? groupColors[id] || 'bg-gold border-gold text-black shadow-gold/20'
                        : 'bg-[#111] border-white/5 text-gray-600 hover:border-white/20'
                    }`}
                  >
                    {nome}
                  </button>
                );
              })}

              <button
                onClick={() => setSelectedGroupId('templates')}
                className={`flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 flex items-center space-x-2 ${
                  selectedGroupId === 'templates'
                    ? 'bg-white border-white text-black shadow-white/20'
                    : 'bg-[#111] border-white/5 text-gray-600 hover:border-white/20'
                }`}
              >
                <Layers size={14} />
                <span>Templates</span>
              </button>
            </div>

            <button
              onClick={() => scrollGroups('right')}
              className="absolute right-0 z-10 w-8 h-8 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-gold opacity-0 group-hover/scroll:opacity-100 transition-opacity -mr-3"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto gold-scrollbar pb-4 -mb-4 px-1">
            <button
              onClick={() => setSelectedEquipmentId('all')}
              className={`flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border-2 flex items-center space-x-2 ${
                selectedEquipmentId === 'all'
                  ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5'
                  : 'bg-[#111] border-white/5 text-gray-600 hover:border-white/10'
              }`}
            >
              <Dumbbell size={12} />
              <span>Todos</span>
            </button>

            {['Halter', 'Barra', 'Máquina', 'Peso do Corpo'].map((equip) => (
              <button
                key={equip}
                onClick={() => setSelectedEquipmentId(equip)}
                className={`flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border-2 ${
                  selectedEquipmentId === equip
                    ? 'bg-gold/20 border-gold/40 text-gold shadow-lg shadow-gold/5'
                    : 'bg-[#111] border-white/5 text-gray-600 hover:border-white/10'
                }`}
              >
                {equip === 'Halter' ? 'Halteres' : equip}
              </button>
            ))}

            <div className="w-px h-6 bg-white/10 mx-2 shrink-0"></div>

            {equipamentos
              .filter((e) => !['Halter', 'Barra', 'Máquina', 'Peso do Corpo'].includes(e))
              .map((equip) => (
                <button
                  key={equip}
                  onClick={() => setSelectedEquipmentId(equip)}
                  className={`flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border-2 ${
                    selectedEquipmentId === equip
                      ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5'
                      : 'bg-[#111] border-white/5 text-gray-600 hover:border-white/10'
                  }`}
                >
                  {equip}
                </button>
              ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {selectedGroupId === 'templates' ? (
              SHEETS.map((t) => {
                const templateItems = templates[t] || [];
                const count = templateItems.length;

                return (
                  <div
                    key={t}
                    className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:border-gold/30 transition-all cursor-pointer"
                    onClick={() => handleLoadTemplate(t)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${
                        count > 0
                          ? 'bg-gold text-black shadow-lg shadow-gold/20'
                          : 'bg-white/5 text-gray-600 group-hover:bg-white/10'
                      }`}
                    >
                      <Layers size={20} />
                    </div>
                    <h4 className="text-white font-black uppercase tracking-widest text-xs">Template {t}</h4>
                    <p className={`text-[9px] font-bold mt-1 uppercase ${count > 0 ? 'text-gold' : 'text-gray-600'}`}>
                      {count} Exercícios
                    </p>
                    {count > 0 && (
                      <button className="mt-3 text-[7px] font-black text-black bg-gold px-3 py-1.5 rounded-lg uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        Carregar
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              filtrados.map((ex) => {
                const isSelected = !!selectedList.find((item) => item.exerciseId === ex.id);
                const ytId = getYoutubeId(ex.video_url);
                const thumbUrl = ytId
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : `https://picsum.photos/seed/${ex.id}/400/225`;

                return (
                  <div
                    key={ex.id}
                    className={`bg-[#111] border rounded-[2rem] p-4 transition-all duration-500 hover:border-gold/50 flex flex-col gap-4 group/card relative overflow-hidden ${
                      isSelected
                        ? 'border-gold/40 bg-gradient-to-b from-gold/10 to-transparent shadow-2xl shadow-gold/5'
                        : 'border-white/5 hover:bg-white/[0.02]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold/10 blur-3xl rounded-full pointer-events-none"></div>
                    )}

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-black text-white leading-tight group-hover/card:text-gold transition-colors line-clamp-2 uppercase tracking-tighter">
                          {ex.nome}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            {ex.equipamento}
                          </span>
                          <span
                            className={`text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                              ex.grupoId === 'peito'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : ex.grupoId === 'costas'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : ex.grupoId === 'pernas'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-gold/10 text-gold/80 border-gold/20'
                            }`}
                          >
                            {ex.grupoNome}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSelection(ex.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${
                          isSelected
                            ? 'bg-gold text-black shadow-2xl shadow-gold/40 scale-110 rotate-[360deg]'
                            : 'bg-white/5 text-gray-600 hover:text-gold hover:bg-gold/10 hover:scale-110'
                        }`}
                      >
                        {isSelected ? <Check size={22} strokeWidth={4} /> : <Plus size={22} strokeWidth={3} />}
                      </button>
                    </div>

                    <div className="relative h-28 rounded-2xl overflow-hidden group/thumb border border-white/10 shadow-inner">
                      <img
                        src={thumbUrl}
                        alt={ex.nome}
                        className="w-full h-full object-cover opacity-40 group-hover/thumb:scale-110 group-hover/thumb:opacity-60 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center space-x-1">
                          <Target size={10} className="text-gold" />
                          <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                            {ex.subgrupoNome}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveVideo(ex.video_url)}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-all duration-500"
                      >
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover/thumb:scale-100 transition-all duration-500">
                          <Youtube size={24} className="text-white" fill="currentColor" />
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1 px-1">
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest italic">
                        Execução Técnica
                      </p>
                      <div className="flex space-x-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-gold/20"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedCount > 0 && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
              <button
                onClick={() => setSubTab('config')}
                className="bg-gold text-black px-8 py-5 rounded-full font-black uppercase tracking-widest flex items-center space-x-3 shadow-2xl active:scale-95 transition-all"
              >
                <span>
                  Revisar Ficha {activeSheet} - Mês {selectedMonth}
                </span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </section>
      )}

      {subTab === 'config' && (
        <section className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col gap-4 items-center text-center">
            <div>
              <h3 className="text-sm font-black italic uppercase text-white">
                Ajuste Fino: Mês {selectedMonth} | Ficha {activeSheet}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                Configure o volume para este período específico.
              </p>
            </div>

            <div className="flex space-x-2 justify-center">
              <div className="relative">
                <button
                  onClick={() => setShowCloneMenu(showCloneMenu === 'sheet' ? null : 'sheet')}
                  className="bg-[#1A1A1A] text-gold border border-gold/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center space-x-2 hover:bg-gold/10 transition-all"
                >
                  <Copy size={14} />
                  <span>Clonar Ficha</span>
                </button>

                {showCloneMenu === 'sheet' && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[8px] font-black text-gray-500 uppercase p-2 tracking-widest">
                      Clonar para:
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {SHEETS.map((letter) => (
                        <button
                          key={letter}
                          onClick={() => handleCloneSheet(letter)}
                          disabled={letter === activeSheet}
                          className={`py-2 rounded-lg text-[10px] font-black transition-all ${
                            letter === activeSheet
                              ? 'bg-white/5 text-gray-700 cursor-not-allowed'
                              : 'bg-black/40 text-white hover:bg-gold hover:text-black'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowCloneMenu(showCloneMenu === 'month' ? null : 'month')}
                  className="bg-[#1A1A1A] text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center space-x-2 hover:bg-emerald-500/10 transition-all"
                >
                  <CalendarDays size={14} />
                  <span>Clonar Mês</span>
                </button>

                {showCloneMenu === 'month' && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[8px] font-black text-gray-500 uppercase p-2 tracking-widest">
                      Clonar para:
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <button
                          key={m}
                          onClick={() => handleCloneMonth(m)}
                          disabled={m === selectedMonth}
                          className={`py-2 rounded-lg text-[10px] font-black transition-all ${
                            m === selectedMonth
                              ? 'bg-white/5 text-gray-700 cursor-not-allowed'
                              : 'bg-black/40 text-white hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          M{m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={selectedList.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {selectedList.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    index={index}
                    allExercises={allExercises}
                    toggleSelection={toggleSelection}
                    updateConfig={updateConfig}
                  />
                ))}
              </SortableContext>

              <DragOverlay
                dropAnimation={{
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.3',
                      },
                    },
                  }),
                }}
              >
                {activeId ? (
                  <SortableItem
                    item={selectedList.find((i) => i.id === activeId)}
                    index={selectedList.findIndex((i) => i.id === activeId)}
                    allExercises={allExercises}
                    toggleSelection={toggleSelection}
                    updateConfig={updateConfig}
                    isOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveSheet}
              className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-600/20 flex items-center justify-center space-x-2 active:scale-95 transition-all hover:brightness-110"
            >
              <Save size={20} /> <span>SALVAR TREINO</span>
            </button>

            <button
              onClick={async () => {
                const id = prompt(
                  'Salvar como Template (A, B, C, D, E, F ou G)?',
                  activeSheet
                )?.toUpperCase();

                if (id && SHEETS.includes(id as any)) {
                  const itemsToSave = selectedList.map((item, index) => ({
                    exercise_id: item.exerciseId,
                    exercise_name:
                      allExercises.find((e) => e.id === item.exerciseId)?.nome || 'Exercício',
                    series: item.series,
                    reps: item.reps,
                    descanso: item.descanso,
                    metodo: item.metodo || '',
                    ordem: index + 1,
                  }));

                  const updatedTemplates = { ...templates, [id]: itemsToSave };

                  try {
                    await db.saveTemplates(updatedTemplates);
                    setTemplates(updatedTemplates);
                    loadSheetCounts(items, updatedTemplates);
                    triggerSuccessToast();
                  } catch (error) {
                    console.error('Error saving template:', error);
                    notify('Erro ao salvar template', 'error');
                  }
                }
              }}
              className="flex-1 bg-[#1A1A1A] text-gold border border-gold/20 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all hover:bg-gold/10"
            >
              <Layers size={16} /> <span>Salvar Template</span>
            </button>
          </div>
        </section>
      )}

      {subTab === 'periodizacao' && (
        <section className="space-y-6 animate-in slide-in-from-left duration-300">
          {!targetAlunoId ? (
            <div className="p-20 text-center bg-[#111] rounded-[3rem] border border-dashed border-[#333]">
              <UserPlus size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                Selecione um aluno no topo para montar a periodização
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white">
                    Planejamento Anual
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Defina a lógica do ciclo. Os treinos criados nas etapas anteriores serão distribuídos conforme esta periodização.
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Defina a jornada de 12 meses para{' '}
                    <span className="text-gold">
                      {alunos.find((a) => a.id === targetAlunoId)?.nome}
                    </span>
                    .
                  </p>
                </div>

                <button
                  onClick={handleSavePeriodizacao}
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-2 text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-purple-600/20 hover:brightness-110"
                >
                  <Save size={18} /> <span>Salvar Ciclo</span>
                </button>
              </div>

              <div className="flex overflow-x-auto gold-scrollbar gap-6 pb-10 -mx-6 px-6 snap-x">
                {periodizacao.map((mes, idx) => (
                  <div
                    key={mes.mes}
                    className="flex-none w-[300px] sm:w-[340px] snap-start card-premium p-8 rounded-[3rem] border border-white/5 bg-gradient-to-b from-[#111] to-black relative overflow-hidden group hover:border-gold/30 transition-all duration-500 shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12">
                      <Trophy size={100} />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gold blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <button
                            onClick={() => {
                              setSelectedMonth(mes.mes);
                              setSubTab('library');
                            }}
                            className="relative w-14 h-14 bg-gradient-to-br from-gold to-[#A6813B] text-black rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl shadow-gold/20 hover:scale-110 transition-transform active:scale-95 z-10"
                          >
                            {mes.mes}
                          </button>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block">
                            Mês do Ciclo
                          </span>
                          <h4 className="text-white font-black uppercase text-sm tracking-widest mt-0.5">
                            PLANEJAMENTO
                          </h4>
                        </div>
                      </div>

                      {idx > 0 && (
                        <button
                          onClick={() => handleCopyPreviousMonthPeriodizacao(idx)}
                          className="w-10 h-10 bg-white/5 text-gold hover:bg-gold hover:text-black rounded-xl flex items-center justify-center transition-all group/clone"
                          title={`Clonar dados do M${mes.mes - 1}`}
                        >
                          <RotateCcw
                            size={16}
                            className="group-hover/clone:rotate-180 transition-transform duration-500"
                          />
                        </button>
                      )}
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gold uppercase tracking-[0.2em] flex items-center opacity-70">
                          <Target size={12} className="mr-2" /> Fase do Ciclo
                        </label>
                        <div className="relative group/select">
                          <select
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-xs font-black text-white outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                            value={mes.fase}
                            onChange={(e) => updatePeriodizacao(idx, 'fase', e.target.value)}
                          >
                            {FASES_PERIODIZACAO.map((f) => (
                              <option key={f} value={f} className="bg-[#0A0A0A]">
                                {f.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none group-hover/select:scale-110 transition-transform"
                          />
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
                          onChange={(e) => updatePeriodizacao(idx, 'objetivo', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {filtrados.length === 0 && subTab === 'library' && (
        <div className="py-20 text-center">
          <Dumbbell size={48} className="mx-auto text-gray-800 mb-4" />
          <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
            Nenhum exercício encontrado
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciciosView;