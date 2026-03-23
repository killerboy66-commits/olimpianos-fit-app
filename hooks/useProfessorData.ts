
import { useState, useEffect } from 'react';
import { Usuario, Treino, FichaTreinoItem, Exercicio, Atribuicao, RegistroProgresso } from '../types';
import { db } from '../services/storage';

export const useProfessorData = () => {
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [allExercises, setAllExercises] = useState<Exercicio[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [allProgress, setAllProgress] = useState<RegistroProgresso[]>([]);
  const [items, setItems] = useState<FichaTreinoItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, any[]>>({});

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [u, e, t, a, p, temp, i] = await Promise.all([
        db.getUsers(),
        db.getExercises(),
        db.getWorkouts(),
        db.getAssignments(),
        db.getProgress(),
        db.getTemplates(),
        db.getItems()
      ]);
      setAlunos(u.filter(user => user.role === 'aluno'));
      setAllExercises(e);
      setTreinos(t);
      setAssignments(a);
      setAllProgress(p);
      setTemplates(temp);
      setItems(i);
    } catch (error) {
      console.error('Error loading professor data:', error);
    } finally {
      setLoading(false);
    }
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
    refreshData: loadInitialData
  };
};
