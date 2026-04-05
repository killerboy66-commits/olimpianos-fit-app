import { db } from "./storage";

type ProgressItem = {
  user_id: string;
  date: string;
};

type AvaliacaoItem = {
  gordura_percentual?: number | string | null;
};

const normalizeDay = (dateValue: string): string => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const diffInDays = (dateA: string, dateB: string): number => {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
};

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const achievementService = {
  checkWorkoutAchievements: async (userId: string): Promise<string[]> => {
    const allProgress = (await db.getProgress()) as ProgressItem[];
    const progress = allProgress.filter((p) => p.user_id === userId);

    if (progress.length === 0) return [];

    const earned: string[] = [];

    // 1. Primeiro Passo
    const a1 = await db.addAchievement(userId, "primeiro_passo");
    if (a1 === true) {
      earned.push("primeiro_passo");
    }

    // 2. Guerreiro da Madrugada (antes das 7h)
    const earlyWorkout = progress.some((p) => {
      const date = new Date(p.date);
      return !Number.isNaN(date.getTime()) && date.getHours() < 7;
    });

    if (earlyWorkout) {
      const a2 = await db.addAchievement(userId, "guerreiro_da_madrugada");
      if (a2 === true) {
        earned.push("guerreiro_da_madrugada");
      }
    }

    // 3. Legionário Assíduo (5 dias seguidos)
    const uniqueDates = Array.from(
      new Set(progress.map((p) => normalizeDay(p.date)))
    ).sort();

    let streak = 1;
    let maxStreak = uniqueDates.length > 0 ? 1 : 0;

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = diffInDays(uniqueDates[i - 1], uniqueDates[i]);

      if (diff === 1) {
        streak++;
        if (streak > maxStreak) {
          maxStreak = streak;
        }
      } else {
        streak = 1;
      }
    }

    if (maxStreak >= 5) {
      const a3 = await db.addAchievement(userId, "legionario_assiduo");
      if (a3 === true) {
        earned.push("legionario_assiduo");
      }
    }

    // 4. Mestre da Técnica (50 registros totais)
    if (progress.length >= 50) {
      const a4 = await db.addAchievement(userId, "mestre_da_tecnica");
      if (a4 === true) {
        earned.push("mestre_da_tecnica");
      }
    }

    return earned;
  },

  checkEvaluationAchievements: async (userId: string): Promise<string[]> => {
    const evals = (await db.getAvaliacoes(userId)) as AvaliacaoItem[];

    if (evals.length === 0) return [];

    const earned: string[] = [];

    // 1. Evolução Olimpiana
    const a5 = await db.addAchievement(userId, "evolucao_olimpiana");
    if (a5 === true) {
      earned.push("evolucao_olimpiana");
    }

    // 2. Corpo de Espartano (redução de gordura)
    if (evals.length >= 2) {
      const last = evals[evals.length - 1];
      const prev = evals[evals.length - 2];

      const lastFat = toNumber(last?.gordura_percentual);
      const prevFat = toNumber(prev?.gordura_percentual);

      if (lastFat !== null && prevFat !== null && lastFat < prevFat) {
        const a6 = await db.addAchievement(userId, "corpo_de_espartano");
        if (a6 === true) {
          earned.push("corpo_de_espartano");
        }
      }
    }

    return earned;
  },
};