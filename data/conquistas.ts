
import { Conquista } from '../types';

export const CONQUISTAS_DATA: Conquista[] = [
  {
    id: 'primeiro_passo',
    titulo: 'Iniciação no Santuário',
    descricao: 'Empunhou sua primeira arma e realizou seu treino inaugural no Santuário.',
    icone: 'Sword',
    cor: '#FFD700', // Gold
    categoria: 'consistencia',
    raridade: 'comum'
  },
  {
    id: 'legionario_assiduo',
    titulo: 'Disciplina de Esparta',
    descricao: 'Mostrou a resiliência de um espartano ao treinar 5 dias seguidos na mesma semana.',
    icone: 'Shield',
    cor: '#C0C0C0', // Silver
    categoria: 'consistencia',
    raridade: 'raro'
  },
  {
    id: 'forca_de_hercules',
    titulo: 'Poder de Zeus',
    descricao: 'Invocou a força dos céus e bateu um recorde pessoal de carga.',
    icone: 'Zap',
    cor: '#00BFFF', // DeepSkyBlue
    categoria: 'forca',
    raridade: 'raro'
  },
  {
    id: 'mestre_da_tecnica',
    titulo: 'Sabedoria de Atena',
    descricao: 'Completou 50 séries com a precisão e sabedoria da deusa da estratégia.',
    icone: 'Bird',
    cor: '#9370DB', // MediumPurple
    categoria: 'especial',
    raridade: 'epico'
  },
  {
    id: 'evolucao_olimpiana',
    titulo: 'Ascensão',
    descricao: 'Iniciou sua escalada rumo ao topo com sua primeira avaliação física.',
    icone: 'Mountain',
    cor: '#32CD32', // LimeGreen
    categoria: 'evolucao',
    raridade: 'comum'
  },
  {
    id: 'corpo_de_espartano',
    titulo: 'Estátua de Mármore',
    descricao: 'Esculpiu seu físico reduzindo o percentual de gordura, digno de uma obra de arte grega.',
    icone: 'Gem',
    cor: '#FF69B4', // HotPink
    categoria: 'evolucao',
    raridade: 'lendario'
  },
  {
    id: 'guerreiro_da_madrugada',
    titulo: 'Carruagem de Apolo',
    descricao: 'Despertou com o deus do sol e treinou antes das 7h da manhã.',
    icone: 'Sun',
    cor: '#FFA500', // Orange
    categoria: 'especial',
    raridade: 'raro'
  },
  {
    id: 'foco_inabalavel',
    titulo: 'Chama de Prometeu',
    descricao: 'Manteve o fogo do treino aceso por um mês inteiro sem faltas.',
    icone: 'Flame',
    cor: '#FF4500', // OrangeRed
    categoria: 'consistencia',
    raridade: 'lendario'
  }
];
