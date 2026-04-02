import { useState, useEffect } from 'react';
import {
  Usuario,
  Treino,
  FichaTreinoItem,
  Exercicio,
  Atribuicao,
  RegistroProgresso,
} from '../types';
import { db } from '../services/storage';

const WORKOUTS_PADRAO: Treino[] = [
  { id: 'A', titulo: 'Treino A', duracao_min: 60 },
  { id: 'B', titulo: 'Treino B', duracao_min: 60 },
  { id: 'C', titulo: 'Treino C', duracao_min: 60 },
  { id: 'D', titulo: 'Treino D', duracao_min: 60 },
  { id: 'E', titulo: 'Treino E', duracao_min: 60 },
  { id: 'F', titulo: 'Treino F', duracao_min: 60 },
  { id: 'G', titulo: 'Treino G', duracao_min: 60 },
];

export const useProfessorData = () => {
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [allExercises, setAllExercises] = useState<Exercicio[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>(WORKOUTS_PADRAO);
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [allProgress, setAllProgress] = useState<RegistroProgresso[]>([]);
  const [items, setItems] = useState<FichaTreinoItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, any[]>>({});

  const loadInitialData = async () => {
    setLoading(true);

    try {
      const usersResult = await db.getUsers();
      console.log('USUARIOS RAW:', usersResult);

      const usuariosNormalizados: Usuario[] = (usersResult || []).map((user: any) => ({
        ...user,
        role: user.role || 'aluno',
      }));

      const somenteAlunos = usuariosNormalizados.filter(
        (user: Usuario) => user.role === 'aluno'
      );

      console.log('ALUNOS FILTRADOS:', somenteAlunos);
      setAlunos(somenteAlunos);
    } catch (error) {
      console.error('Erro carregando usuários/alunos:', error);
      setAlunos([]);
    }

    try {
      const exercisesResult = await db.getExercises();
      setAllExercises(exercisesResult || []);
    } catch (error) {
      console.error('Erro carregando exercícios:', error);
      setAllExercises([]);
    }

    try {
      const assignmentsResult = await db.getAssignments();
      console.log('ASSIGNMENTS:', assignmentsResult);
      setAssignments(assignmentsResult || []);
    } catch (error) {
      console.error('Erro carregando atribuições:', error);
      setAssignments([]);
    }

    try {
      const progressResult = await db.getProgress();
      console.log('PROGRESS:', progressResult);
      setAllProgress((progressResult || []) as RegistroProgresso[]);
    } catch (error) {
      console.error('Erro carregando progresso:', error);
      setAllProgress([]);
    }

    try {
      const templatesResult = await db.getTemplates();
      setTemplates(templatesResult || {});
    } catch (error) {
      console.error('Erro carregando templates:', error);
      setTemplates({});
    }

    try {
      const itemsResult = await db.getItems();
      console.log('ITEMS:', itemsResult);
      setItems(itemsResult || []);
    } catch (error) {
      console.error('Erro carregando itens:', error);
      setItems([]);
    }

    setTreinos(WORKOUTS_PADRAO);
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return {
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
    refreshData: loadInitialData,
  };
};