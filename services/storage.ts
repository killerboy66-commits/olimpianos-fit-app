import { supabase } from './supabase';
import {
  Usuario,
  Exercicio,
  FichaTreinoItem,
  MesPeriodizacao,
  Atribuicao,
  CronogramaSemanal,
  AvaliacaoFisica,
  Treino,
} from '../types';

type TemplateItem = {
  id?: string;
  exercise_id: string;
  exercise_name?: string;
  series: number;
  reps: string;
  descanso: string;
  metodo?: string;
  ordem: number;
};

type PeriodizacaoRow = {
  user_id: string;
  meses: MesPeriodizacao[];
};

const handleError = (context: string, error: any) => {
  console.error(`[storage] ${context}:`, error);
  throw error;
};

export const db = {
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('usuarios').select('id').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[storage] testConnection:', error);
      return false;
    }
  },

  async getLoggedUser(): Promise<Usuario | null> {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) return null;

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      return data as Usuario | null;
    } catch (error) {
      handleError('getLoggedUser', error);
      return null;
    }
  },

  async setLoggedUser(user: Usuario | null): Promise<void> {
    try {
      if (!user) {
        localStorage.removeItem('userEmail');
        return;
      }
      localStorage.setItem('userEmail', user.email);
    } catch (error) {
      handleError('setLoggedUser', error);
    }
  },

  async getLastUser(): Promise<string | null> {
    try {
      return localStorage.getItem('lastUserEmail');
    } catch (error) {
      handleError('getLastUser', error);
      return null;
    }
  },

  async setLastUser(email: string): Promise<void> {
    try {
      localStorage.setItem('lastUserEmail', email);
    } catch (error) {
      handleError('setLastUser', error);
    }
  },

  async getUsers(): Promise<Usuario[]> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return (data || []) as Usuario[];
    } catch (error) {
      handleError('getUsers', error);
      return [];
    }
  },

  async addUser(user: Usuario): Promise<Usuario> {
    try {
      const payload = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        objetivo: user.objetivo ?? '',
        foto: user.foto ?? '',
        conquistas_ids: user.conquistas_ids ?? [],
      };

      const { data, error } = await supabase
        .from('usuarios')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as Usuario;
    } catch (error) {
      handleError('addUser', error);
      throw error;
    }
  },

  async saveUsers(users: Usuario[]): Promise<void> {
    try {
      if (!users.length) return;

      const payload = users.map((user) => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        objetivo: user.objetivo ?? '',
        foto: user.foto ?? '',
        conquistas_ids: user.conquistas_ids ?? [],
      }));

      const { error } = await supabase
        .from('usuarios')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveUsers', error);
    }
  },

  async updateUser(userId: string, updates: Partial<Usuario>): Promise<void> {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleError('updateUser', error);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleError('deleteUser', error);
    }
  },

  async getExercises(): Promise<Exercicio[]> {
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        nome: row.nome,
        grupoId: row.grupo_id,
        grupoNome: row.grupo_nome,
        subgrupoId: row.subgrupo_id,
        subgrupoNome: row.subgrupo_nome,
        equipamento: row.equipamento,
        tipo: row.tipo,
        nivel: row.nivel,
        video_url: row.video_url,
        descricao: row.descricao,
        destaque: row.destaque ?? false,
      })) as Exercicio[];
    } catch (error) {
      handleError('getExercises', error);
      return [];
    }
  },

  async saveExercises(exercises: Exercicio[]): Promise<void> {
    try {
      const payload = exercises.map((ex) => ({
        id: ex.id,
        nome: ex.nome,
        grupo_id: ex.grupoId,
        grupo_nome: ex.grupoNome,
        subgrupo_id: ex.subgrupoId,
        subgrupo_nome: ex.subgrupoNome,
        equipamento: ex.equipamento,
        tipo: ex.tipo,
        nivel: ex.nivel,
        video_url: ex.video_url,
        descricao: ex.descricao,
        destaque: ex.destaque ?? false,
      }));

      const { error } = await supabase
        .from('exercicios')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveExercises', error);
    }
  },

  async getWorkouts(): Promise<Treino[]> {
    try {
      const { data, error } = await supabase
        .from('treinos')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: String(row.id),
        titulo: row.titulo ?? row.nome ?? `Treino ${row.id}`,
      })) as Treino[];
    } catch (error) {
      handleError('getWorkouts', error);
      return [];
    }
  },

  async getItems(): Promise<FichaTreinoItem[]> {
    try {
      const { data, error } = await supabase
        .from('ficha_treino_itens')
        .select('*')
        .order('mes', { ascending: true })
        .order('workout_id', { ascending: true })
        .order('ordem', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        workout_id: row.workout_id,
        exercise_id: row.exercise_id,
        series: row.series,
        reps: row.reps,
        descanso: row.descanso,
        metodo: row.metodo ?? '',
        ordem: row.ordem,
        mes: row.mes,
      })) as FichaTreinoItem[];
    } catch (error) {
      handleError('getItems', error);
      return [];
    }
  },

  async saveItems(items: FichaTreinoItem[]): Promise<void> {
    try {
      if (!items.length) return;

      const payload = items.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        workout_id: item.workout_id,
        exercise_id: item.exercise_id,
        series: item.series,
        reps: item.reps,
        descanso: item.descanso,
        metodo: item.metodo ?? '',
        ordem: item.ordem,
        mes: item.mes,
      }));

      const { error } = await supabase
        .from('ficha_treino_itens')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveItems', error);
    }
  },

  async deleteItems(userId: string, workoutId: string, mes: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('ficha_treino_itens')
        .delete()
        .eq('user_id', userId)
        .eq('workout_id', workoutId)
        .eq('mes', mes);

      if (error) throw error;
    } catch (error) {
      handleError('deleteItems', error);
    }
  },

  async deleteMonthItems(userId: string, mes: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('ficha_treino_itens')
        .delete()
        .eq('user_id', userId)
        .eq('mes', mes);

      if (error) throw error;
    } catch (error) {
      handleError('deleteMonthItems', error);
    }
  },

  async getAssignments(): Promise<Atribuicao[]> {
    try {
      const { data, error } = await supabase
        .from('atribuicoes')
        .select('user_id, workout_id, ativo, data_inicio, mes_atual')
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return (data || []) as Atribuicao[];
    } catch (error) {
      handleError('getAssignments', error);
      return [];
    }
  },

  async saveAssignments(assignments: Atribuicao[]): Promise<void> {
    try {
      if (!assignments.length) return;

      const payload = assignments.map((a) => ({
        user_id: a.user_id,
        workout_id: a.workout_id,
        ativo: a.ativo ?? true,
        data_inicio: a.data_inicio ?? new Date().toISOString(),
        mes_atual: a.mes_atual ?? null,
      }));

      const { error } = await supabase
        .from('atribuicoes')
        .upsert(payload, { onConflict: 'user_id,workout_id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveAssignments', error);
    }
  },

  async getTemplates(): Promise<Record<string, TemplateItem[]>> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const mapped: Record<string, TemplateItem[]> = {};

      (data || []).forEach((row: any) => {
        mapped[row.id] = Array.isArray(row.itens) ? row.itens : [];
      });

      return mapped;
    } catch (error) {
      handleError('getTemplates', error);
      return {};
    }
  },

  async saveTemplates(templates: Record<string, TemplateItem[]>): Promise<void> {
    try {
      const payload = Object.entries(templates).map(([id, itens]) => ({
        id,
        nome: `Template ${id}`,
        itens: itens ?? [],
      }));

      if (!payload.length) return;

      const { error } = await supabase
        .from('templates')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveTemplates', error);
    }
  },

  async getPeriodizacao(userId: string): Promise<PeriodizacaoRow | null> {
    try {
      const { data, error } = await supabase
        .from('periodizacoes')
        .select('user_id, meses')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as PeriodizacaoRow | null;
    } catch (error) {
      handleError('getPeriodizacao', error);
      return null;
    }
  },

  async savePeriodizacao(periodizacao: PeriodizacaoRow): Promise<void> {
    try {
      const payload = {
        user_id: periodizacao.user_id,
        meses: periodizacao.meses ?? [],
      };

      const { error } = await supabase
        .from('periodizacoes')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
      handleError('savePeriodizacao', error);
    }
  },

  async getProgress() {
  try {
    const { data, error } = await supabase
      .from('progresso')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: String(row.id),
      user_id: row.user_id,
      workout_id: row.workout_id,
      exercise_id: row.exercise_id,
      date: row.data,
      carga_kg: Number(row.carga ?? 0),
      reps_realizadas: Number(row.reps ?? 0),
      notes: row.observacoes ?? '',
      created_at: row.created_at,
    }));
  } catch (error) {
    handleError('getProgress', error);
    return [];
  }
},
  async saveProgress(progress: any[]): Promise<void> {
    try {
      if (!progress.length) return;

      const { error } = await supabase
        .from('progresso')
        .upsert(progress);

      if (error) throw error;
    } catch (error) {
      handleError('saveProgress', error);
    }
  },

  async getExerciseLoads() {
    try {
      const { data, error } = await supabase
        .from('exercise_loads')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError('getExerciseLoads', error);
      return [];
    }
  },

  async saveExerciseLoads(loads: any[]): Promise<void> {
    try {
      if (!loads.length) return;

      const { error } = await supabase
        .from('exercise_loads')
        .upsert(loads);

      if (error) throw error;
    } catch (error) {
      handleError('saveExerciseLoads', error);
    }
  },

  async getSchedule(userId: string): Promise<CronogramaSemanal | null> {
    try {
      const { data, error } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as CronogramaSemanal | null;
    } catch (error) {
      handleError('getSchedule', error);
      return null;
    }
  },

  async saveSchedule(schedule: CronogramaSemanal): Promise<void> {
    try {
      const payload = {
        user_id: schedule.user_id,
        segunda: schedule.segunda,
        terca: schedule.terca,
        quarta: schedule.quarta,
        quinta: schedule.quinta,
        sexta: schedule.sexta,
        sabado: schedule.sabado,
        domingo: schedule.domingo,
      };

      const { error } = await supabase
        .from('cronogramas')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveSchedule', error);
    }
  },

  async getStudentNotes(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('student_notes')
        .select('notes')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.notes ?? '';
    } catch (error) {
      handleError('getStudentNotes', error);
      return '';
    }
  },

  async saveStudentNotes(userId: string, notes: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('student_notes')
        .upsert({ user_id: userId, notes }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
      handleError('saveStudentNotes', error);
    }
  },

  async getAvaliacoes(userId: string): Promise<AvaliacaoFisica[]> {
    try {
      const { data, error } = await supabase
        .from('avaliacoes_fisicas')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        date: row.date,
        peso: Number(row.peso),
        gordura_percentual:
          row.gordura_percentual === null || row.gordura_percentual === undefined
            ? undefined
            : Number(row.gordura_percentual),
        medidas: row.medidas || {},
      })) as AvaliacaoFisica[];
    } catch (error) {
      handleError('getAvaliacoes', error);
      return [];
    }
  },

  async addAvaliacao(evaluation: AvaliacaoFisica): Promise<void> {
    try {
      const payload = {
        id: evaluation.id,
        user_id: evaluation.user_id,
        date: evaluation.date,
        peso: evaluation.peso,
        gordura_percentual: evaluation.gordura_percentual ?? null,
        medidas: evaluation.medidas ?? {},
      };

      const { error } = await supabase
        .from('avaliacoes_fisicas')
        .insert([payload]);

      if (error) throw error;
    } catch (error) {
      handleError('addAvaliacao', error);
    }
  },
};