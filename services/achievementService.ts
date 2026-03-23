
import { db } from './storage';

export const achievementService = {
  checkWorkoutAchievements: async (userId: string) => {
    const allProgress = await db.getProgress();
    const progress = allProgress.filter(p => p.user_id === userId);
    if (progress.length === 0) return [];

    const earned: string[] = [];

    // 1. Primeiro Passo
    if (await db.addAchievement(userId, 'primeiro_passo')) earned.push('primeiro_passo');

    // 2. Guerreiro da Madrugada (antes das 7h)
    const earlyWorkout = progress.some(p => {
      const date = new Date(p.date);
      return date.getHours() < 7;
    });
    if (earlyWorkout && await db.addAchievement(userId, 'guerreiro_da_madrugada')) {
      earned.push('guerreiro_da_madrugada');
    }

    // 3. Legionário Assíduo (5 dias seguidos)
    const dates = Array.from(new Set(progress.map(p => new Date(p.date).toLocaleDateString()))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let streak = 1;
    let maxStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const d1 = new Date(dates[i-1]);
      const d2 = new Date(dates[i]);
      const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    if (maxStreak >= 5 && await db.addAchievement(userId, 'legionario_assiduo')) {
      earned.push('legionario_assiduo');
    }

    // 4. Mestre da Técnica (50 séries totais)
    if (progress.length >= 50 && await db.addAchievement(userId, 'mestre_da_tecnica')) {
      earned.push('mestre_da_tecnica');
    }

    return earned;
  },

  checkEvaluationAchievements: async (userId: string) => {
    const evals = await db.getAvaliacoes(userId);
    if (evals.length === 0) return [];

    const earned: string[] = [];

    // 1. Evolução Olimpiana
    if (await db.addAchievement(userId, 'evolucao_olimpiana')) earned.push('evolucao_olimpiana');

    // 2. Corpo de Espartano (redução de gordura)
    if (evals.length >= 2) {
      const last = evals[evals.length - 1];
      const prev = evals[evals.length - 2];
      if (last.gordura_percentual && prev.gordura_percentual && last.gordura_percentual < prev.gordura_percentual) {
        if (await db.addAchievement(userId, 'corpo_de_espartano')) earned.push('corpo_de_espartano');
      }
    }

    return earned;
  }
};
