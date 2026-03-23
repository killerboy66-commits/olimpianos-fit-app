
export type UserRole = 'aluno' | 'professor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  objetivo?: string;
  foto?: string;
  conquistas_ids?: string[];
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  categoria: 'consistencia' | 'forca' | 'evolucao' | 'especial';
  raridade: 'comum' | 'raro' | 'epico' | 'lendario';
}

export interface Exercicio {
  id: string;
  nome: string;
  grupoId: string;
  grupoNome: string;
  subgrupoId: string;
  subgrupoNome: string;
  equipamento: string;
  tipo: string;
  nivel: string;
  video_url: string;
  descricao: string;
  destaque?: boolean;
}

export interface Treino {
  id: string; // A, B, C, D, E, F, G
  titulo: string;
  duracao_min: number;
}

export interface FichaTreinoItem {
  id: string;
  user_id: string;
  workout_id: string;
  exercise_id: string;
  series: number;
  reps: string;
  descanso: string;
  ordem: number;
  mes: number; // Mês do ciclo (1 a 12)
  metodo?: string; // Drop Set, Cluster Set, Rest-Pause, etc.
}

export interface Atribuicao {
  user_id: string;
  workout_id: string;
  ativo: boolean;
  data_inicio: string;
  mes_atual?: number;
}

export interface CronogramaSemanal {
  user_id: string;
  segunda: string;
  terca: string;
  quarta: string;
  quinta: string;
  sexta: string;
  sabado: string;
  domingo: string;
}

export interface RegistroProgresso {
  id: string;
  user_id: string;
  date: string;
  workout_id: string;
  exercise_id: string;
  carga_kg?: number;
  reps_realizadas: number;
  notes?: string;
}

export interface AvaliacaoFisica {
  id: string;
  user_id: string;
  date: string;
  peso: number;
  gordura_percentual?: number;
  medidas: {
    pescoco?: number;
    ombros?: number;
    torax?: number;
    cintura?: number;
    abdomem?: number;
    quadril?: number;
    braco_d?: number;
    braco_e?: number;
    antebraco_d?: number;
    antebraco_e?: number;
    coxa_d?: number;
    coxa_e?: number;
    panturrilha_d?: number;
    panturrilha_e?: number;
  };
}

export interface MesPeriodizacao {
  mes: number;
  fase: string;
  objetivo: string;
  intensidade?: number;
  volume?: number;
}

export interface Periodizacao {
  user_id: string;
  meses: MesPeriodizacao[];
}

export enum Route {
  LOGIN = 'login',
  ALUNO = 'aluno',
  TREINO = 'treino',
  PROGRESSO = 'progresso',
  PROFESSOR = 'professor',
  NUTRICIONISTA = 'nutricionista',
  SUPLEMENTOS = 'suplementos',
  PSICOLOGIA = 'psicologia',
  EXERCICIOS = 'exercicios',
  DESAFIO = 'desafio',
  AICHAT = 'aichat'
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  GENERATE = 'GENERATE',
  PLANS = 'PLANS',
  CHAT = 'CHAT'
}

export interface UserProfile {
  name: string;
  level: 'iniciante' | 'intermediário' | 'avançado';
  goal: string;
  equipment: string[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  category: string;
  duration: string;
  objective: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    description: string;
  }[];
}
