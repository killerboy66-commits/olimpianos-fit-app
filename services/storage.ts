
import { supabase } from './supabase';
import { Usuario, Exercicio, Treino, FichaTreinoItem, Atribuicao, RegistroProgresso, Periodizacao, CronogramaSemanal, AvaliacaoFisica } from '../types';
import { EXERCICIOS_DATA } from '../data/exercicios';

const STORAGE_KEYS = {
  LOGGED_USER: 'wf_current_user',
  LAST_USER: 'wf_last_user'
};

const INITIAL_EXERCISES: Exercicio[] = EXERCICIOS_DATA;

const INITIAL_WORKOUTS: Treino[] = [
  { id: 'A', titulo: 'Superior - Peito/Tríceps', duracao_min: 50 },
  { id: 'B', titulo: 'Inferior - Quadríceps', duracao_min: 60 },
  { id: 'C', titulo: 'Superior - Costas/Bíceps', duracao_min: 50 },
  { id: 'D', titulo: 'Inferior - Posterior/Glúteo', duracao_min: 60 },
  { id: 'E', titulo: 'Ombros e Abdômen', duracao_min: 45 },
  { id: 'F', titulo: 'Cardio e Mobilidade', duracao_min: 40 },
  { id: 'G', titulo: 'Treino G - Personalizado', duracao_min: 45 },
];

export const db = {
  testConnection: async () => {
    try {
      const { error } = await supabase.from('usuarios').select('id').limit(1).maybeSingle();
      if (error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase/Supabase configuration.");
        return false;
      }
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  getUsers: async (): Promise<Usuario[]> => {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      const defaultProfAvatar = "/adss.png";
      const defaultStudentAvatar = "/aluno.png";
      const initial = [
        { 
          id: 'prof1', 
          nome: 'Prof. Renato', 
          email: 'renato@vip.com', 
          role: 'professor' as const,
          foto: defaultProfAvatar
        },
        { id: 'aluno1', nome: 'João Atleta', email: 'aluno@teste.com', role: 'aluno' as const, objetivo: 'Hipertrofia e Definição', foto: defaultStudentAvatar }
      ];
      await db.saveUsers(initial);
      return initial;
    }
    return data as Usuario[];
  },

  saveUsers: async (users: Usuario[]) => {
    const { error } = await supabase.from('usuarios').upsert(users);
    if (error) console.error('Error saving users:', error);
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase.from('usuarios').delete().eq('id', userId);
    if (error) console.error('Error deleting user:', error);
  },

  addAchievement: async (userId: string, achievementId: string) => {
    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('conquistas_ids')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user for achievement:', fetchError);
      return false;
    }

    const currentAchievements = user.conquistas_ids || [];
    if (!currentAchievements.includes(achievementId)) {
      const updatedAchievements = [...currentAchievements, achievementId];
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ conquistas_ids: updatedAchievements })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating achievements:', updateError);
        return false;
      }

      const logged = await db.getLoggedUser();
      if (logged && logged.id === userId) {
        await db.setLoggedUser({ ...logged, conquistas_ids: updatedAchievements });
      }
      return true;
    }
    return false;
  },

  getExercises: async (): Promise<Exercicio[]> => {
    const { data, error } = await supabase.from('exercicios').select('*');
    if (error) {
      console.error('Error fetching exercises:', error);
      return INITIAL_EXERCISES;
    }
    if (!data || data.length === 0) {
      await db.saveExercises(INITIAL_EXERCISES);
      return INITIAL_EXERCISES;
    }
    return data as Exercicio[];
  },

  saveExercises: async (exercises: Exercicio[]) => {
    const { error } = await supabase.from('exercicios').upsert(exercises);
    if (error) console.error('Error saving exercises:', error);
  },

  getWorkouts: async (): Promise<Treino[]> => {
    const { data, error } = await supabase.from('treinos').select('*');
    if (error) {
      console.error('Error fetching workouts:', error);
      return INITIAL_WORKOUTS;
    }
    if (!data || data.length === 0) {
      await db.saveWorkouts(INITIAL_WORKOUTS);
      return INITIAL_WORKOUTS;
    }
    return data as Treino[];
  },

  saveWorkouts: async (workouts: Treino[]) => {
    const { error } = await supabase.from('treinos').upsert(workouts);
    if (error) console.error('Error saving workouts:', error);
  },

  addWorkout: async (workout: Treino) => {
    const { error } = await supabase.from('treinos').insert(workout);
    if (error) console.error('Error adding workout:', error);
  },

  getItems: async (): Promise<FichaTreinoItem[]> => {
    const { data, error } = await supabase.from('ficha_treino_itens').select('*');
    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }
    if (!data || data.length === 0) {
      const initial: FichaTreinoItem[] = [
        { id: 'i1', user_id: 'aluno1', workout_id: 'A', exercise_id: '001', series: 4, reps: '10', descanso: '60s', ordem: 1, mes: 1 },
        { id: 'i2', user_id: 'aluno1', workout_id: 'A', exercise_id: '014', series: 3, reps: '12', descanso: '45s', ordem: 2, mes: 1 },
        { id: 'i3', user_id: 'aluno1', workout_id: 'B', exercise_id: '007', series: 4, reps: '10', descanso: '90s', ordem: 1, mes: 1 },
        { id: 'i4', user_id: 'aluno1', workout_id: 'B', exercise_id: '008', series: 3, reps: '15', descanso: '60s', ordem: 2, mes: 1 },
      ];
      await db.saveItems(initial);
      return initial;
    }
    return data as FichaTreinoItem[];
  },

  saveItems: async (items: FichaTreinoItem[]) => {
    const { error } = await supabase.from('ficha_treino_itens').upsert(items);
    if (error) console.error('Error saving items:', error);
  },

  deleteItems: async (userId: string, workoutId: string, mes: number) => {
    const { error } = await supabase
      .from('ficha_treino_itens')
      .delete()
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .eq('mes', mes);
    if (error) console.error('Error deleting items:', error);
  },

  deleteMonthItems: async (userId: string, mes: number) => {
    const { error } = await supabase
      .from('ficha_treino_itens')
      .delete()
      .eq('user_id', userId)
      .eq('mes', mes);
    if (error) console.error('Error deleting month items:', error);
  },

  deleteUserItems: async (userId: string) => {
    const { error } = await supabase
      .from('ficha_treino_itens')
      .delete()
      .eq('user_id', userId);
    if (error) console.error('Error deleting user items:', error);
  },

  getAssignments: async (): Promise<Atribuicao[]> => {
    const { data, error } = await supabase.from('atribuicoes').select('*');
    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
    if (!data || data.length === 0) {
       const initial: Atribuicao[] = [{ user_id: 'aluno1', workout_id: 'A', ativo: true, data_inicio: new Date().toISOString() }];
       await db.saveAssignments(initial);
       return initial;
    }
    return data as Atribuicao[];
  },

  saveAssignments: async (assignments: Atribuicao[]) => {
    const { error } = await supabase.from('atribuicoes').upsert(assignments);
    if (error) console.error('Error saving assignments:', error);
  },

  deleteAssignment: async (userId: string, workoutId: string) => {
    const { error } = await supabase
      .from('atribuicoes')
      .delete()
      .eq('user_id', userId)
      .eq('workout_id', workoutId);
    if (error) console.error('Error deleting assignment:', error);
  },

  getPeriodizacao: async (userId: string): Promise<Periodizacao | null> => {
    const { data, error } = await supabase
      .from('periodizacoes')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching periodizacao:', error);
      return null;
    }
    return data as Periodizacao;
  },

  savePeriodizacao: async (periodizacao: Periodizacao) => {
    const { error } = await supabase.from('periodizacoes').upsert(periodizacao);
    if (error) console.error('Error saving periodizacao:', error);
  },

  deletePeriodizacao: async (userId: string) => {
    const { error } = await supabase.from('periodizacoes').delete().eq('user_id', userId);
    if (error) console.error('Error deleting periodizacao:', error);
  },

  getProgress: async (): Promise<RegistroProgresso[]> => {
    const { data, error } = await supabase.from('progresso').select('*');
    if (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
    return data as RegistroProgresso[];
  },

  addProgress: async (entry: RegistroProgresso) => {
    const { error } = await supabase.from('progresso').insert(entry);
    if (error) console.error('Error adding progress:', error);
  },

  getAvaliacoes: async (userId: string): Promise<AvaliacaoFisica[]> => {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    if (error) {
      console.error('Error fetching avaliacoes:', error);
      return [];
    }
    return data as AvaliacaoFisica[];
  },

  addAvaliacao: async (entry: AvaliacaoFisica) => {
    const { error } = await supabase.from('avaliacoes').insert(entry);
    if (error) console.error('Error adding avaliacao:', error);
  },

  getLoggedUser: async (): Promise<Usuario | null> => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGGED_USER);
    if (!data) return null;
    return JSON.parse(data) as Usuario;
  },

  setLoggedUser: async (user: Usuario | null) => {
    if (user) localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.LOGGED_USER);
  },

  getExerciseLoad: async (userId: string, workoutId: string, exerciseId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('exercise_loads')
      .select('load')
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .eq('exercise_id', exerciseId)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching exercise load:', error);
      return '';
    }
    return data.load;
  },

  setExerciseLoad: async (userId: string, workoutId: string, exerciseId: string, load: string) => {
    const { error } = await supabase.from('exercise_loads').upsert({
      user_id: userId,
      workout_id: workoutId,
      exercise_id: exerciseId,
      load
    });
    if (error) console.error('Error saving exercise load:', error);
  },

  getSchedule: async (userId: string): Promise<CronogramaSemanal | null> => {
    const { data, error } = await supabase
      .from('cronogramas')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching schedule:', error);
      return null;
    }
    return data as CronogramaSemanal;
  },

  saveSchedule: async (schedule: CronogramaSemanal) => {
    const { error } = await supabase.from('cronogramas').upsert(schedule);
    if (error) console.error('Error saving schedule:', error);
  },

  getStudentNotes: async (userId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('student_notes')
      .select('notes')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching student notes:', error);
      return '';
    }
    return data.notes;
  },

  saveStudentNotes: async (userId: string, notes: string) => {
    const { error } = await supabase.from('student_notes').upsert({ user_id: userId, notes });
    if (error) console.error('Error saving student notes:', error);
  },

  getTemplates: async (): Promise<Record<string, any[]>> => {
    const { data, error } = await supabase.from('templates').select('*');
    if (error) {
      console.error('Error fetching templates:', error);
      return {};
    }
    const templates: Record<string, any[]> = {};
    data.forEach(t => {
      templates[t.name] = t.data;
    });
    return templates;
  },

  saveTemplates: async (templates: Record<string, any[]>) => {
    const entries = Object.entries(templates).map(([name, data]) => ({ name, data }));
    const { error } = await supabase.from('templates').upsert(entries);
    if (error) console.error('Error saving templates:', error);
  },

  getLastUser: async (): Promise<string | null> => {
    return localStorage.getItem(STORAGE_KEYS.LAST_USER);
  },

  setLastUser: async (email: string | null) => {
    if (email) localStorage.setItem(STORAGE_KEYS.LAST_USER, email);
    else localStorage.removeItem(STORAGE_KEYS.LAST_USER);
  }
};
