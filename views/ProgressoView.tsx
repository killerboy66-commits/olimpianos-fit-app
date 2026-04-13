import React, { useState, useEffect, useMemo } from 'react';
import { Usuario, AvaliacaoFisica, RegistroProgresso, Exercicio } from '../types';
import { db } from '../services/storage';
import { useNotification } from '../components/Notification';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Scale,
  Ruler,
  Plus,
  X,
  Save,
  Percent,
  Layers,
  Zap,
  Sword,
  Shield,
  Trophy,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface ProgressoViewProps {
  user: Usuario;
  onBack: () => void;
}

const ProgressoView: React.FC<ProgressoViewProps> = ({ user, onBack }) => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'performance' | 'fisico'>('performance');
  const [showAddModal, setShowAddModal] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFisica[]>([]);
  const [history, setHistory] = useState<RegistroProgresso[]>([]);
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);

  const [newEval, setNewEval] = useState({
    peso: '',
    gordura: '',
    pescoco: '',
    ombros: '',
    torax: '',
    cintura: '',
    abdomem: '',
    quadril: '',
    braco_d: '',
    braco_e: '',
    antebraco_d: '',
    antebraco_e: '',
    coxa_d: '',
    coxa_e: '',
    panturrilha_d: '',
    panturrilha_e: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [h, e, a] = await Promise.all([
          db.getProgress(),
          db.getExercises(),
          db.getAvaliacoes(user.id),
        ]);

        const safeHistory = Array.isArray(h) ? h : [];
        const safeExercises = Array.isArray(e) ? e : [];
        const safeAvaliacoes = Array.isArray(a) ? a : [];

        setHistory(
          safeHistory
            .filter((p) => p.user_id === user.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
        setExercises(safeExercises);
        setAvaliacoes(
          safeAvaliacoes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const handleSaveEval = async () => {
    if (!newEval.peso) {
      notify('Por favor, insira pelo menos o peso.', 'error');
      return;
    }

    const parseNum = (val: string) => {
      if (!val) return undefined;
      const num = Number(val.replace(',', '.'));
      return isNaN(num) ? undefined : num;
    };

    const entry: AvaliacaoFisica = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      date: new Date().toISOString(),
      peso: parseNum(newEval.peso) || 0,
      gordura_percentual: parseNum(newEval.gordura),
      medidas: {
        pescoco: parseNum(newEval.pescoco),
        ombros: parseNum(newEval.ombros),
        torax: parseNum(newEval.torax),
        cintura: parseNum(newEval.cintura),
        abdomem: parseNum(newEval.abdomem),
        quadril: parseNum(newEval.quadril),
        braco_d: parseNum(newEval.braco_d),
        braco_e: parseNum(newEval.braco_e),
        antebraco_d: parseNum(newEval.antebraco_d),
        antebraco_e: parseNum(newEval.antebraco_e),
        coxa_d: parseNum(newEval.coxa_d),
        coxa_e: parseNum(newEval.coxa_e),
        panturrilha_d: parseNum(newEval.panturrilha_d),
        panturrilha_e: parseNum(newEval.panturrilha_e),
      },
    };

    try {
      await db.addAvaliacao(entry);
      const updatedAvaliacoes = await db.getAvaliacoes(user.id);
      const safeAvaliacoes = Array.isArray(updatedAvaliacoes) ? updatedAvaliacoes : [];
      setAvaliacoes(
        safeAvaliacoes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );

      notify(
        'Avaliação física salva com sucesso! O professor já pode visualizar no Centro de Comando.',
        'success'
      );
      setShowAddModal(false);

      setNewEval({
        peso: '',
        gordura: '',
        pescoco: '',
        ombros: '',
        torax: '',
        cintura: '',
        abdomem: '',
        quadril: '',
        braco_d: '',
        braco_e: '',
        antebraco_d: '',
        antebraco_e: '',
        coxa_d: '',
        coxa_e: '',
        panturrilha_d: '',
        panturrilha_e: '',
      });
    } catch (error) {
      console.error('Error saving evaluation:', error);
      notify('Erro ao salvar avaliação física.', 'error');
    }
  };

  const renderMedidaGridItem = (label: string, value?: number, suffix: string = 'cm') => {
    if (value === undefined || value === 0) return null;

    return (
      <div className="bg-[#1A1A1A] p-3 rounded-2xl border border-[#222]">
        <p className="text-[7px] text-gray-500 font-black uppercase mb-0.5">{label}</p>
        <p className="text-xs font-black text-white">
          {value}
          {suffix}
        </p>
      </div>
    );
  };

  const chartPerformanceData = useMemo(() => {
    const grouped = history.reduce<Record<string, { date: string; peso: number }>>((acc, curr) => {
      const dateObj = new Date(curr.date);
      const dateKey = [
        dateObj.getFullYear(),
        String(dateObj.getMonth() + 1).padStart(2, '0'),
        String(dateObj.getDate()).padStart(2, '0'),
      ].join('-');

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          peso: 0,
        };
      }

      acc[dateKey].peso += Number(curr.carga_kg || 0);
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((item) => ({
        name: new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        peso: item.peso,
      }));
  }, [history]);

  const chartFisicoData = useMemo(() => {
    return avaliacoes.map((a) => ({
      name: new Date(a.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      peso: a.peso,
      gordura: a.gordura_percentual || 0,
    }));
  }, [avaliacoes]);

  const latestEval = avaliacoes[avaliacoes.length - 1];

  const getRank = (workoutCount: number) => {
    if (workoutCount >= 50) {
      return { title: 'Deus do Olimpo', color: 'text-gold', icon: <Zap size={10} /> };
    }
    if (workoutCount >= 20) {
      return { title: 'Herói Lendário', color: 'text-emerald-400', icon: <Trophy size={10} /> };
    }
    if (workoutCount >= 5) {
      return { title: 'Guerreiro de Elite', color: 'text-blue-400', icon: <Shield size={10} /> };
    }
    return { title: 'Recruta Espartano', color: 'text-gray-400', icon: <Sword size={10} /> };
  };

  const rank = getRank(history.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gold hover:bg-gold/10 rounded-full transition-all"
          >
            <ArrowLeft size={24} />
          </button>

          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              Evolução do Atleta
            </h2>
            <div className={`flex items-center space-x-1 ${rank.color}`}>
              {rank.icon}
              <span className="text-[8px] font-black uppercase tracking-widest">{rank.title}</span>
            </div>
          </div>
        </div>

        {activeTab === 'fisico' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gold text-black px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-gold/20"
          >
            <Plus size={16} />
            <span>Nova Avaliação</span>
          </button>
        )}
      </header>

      <div className="flex p-1.5 bg-[#111] rounded-[1.5rem] border border-[#222]">
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'performance' ? 'bg-gold text-black shadow-xl' : 'text-gray-500'
          }`}
        >
          Performance Técnica
        </button>
        <button
          onClick={() => setActiveTab('fisico')}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'fisico' ? 'bg-gold text-black shadow-xl' : 'text-gray-500'
          }`}
        >
          Composição Física
        </button>
      </div>

      {activeTab === 'performance' ? (
        <>
          <div className="card-premium p-8 rounded-[3rem] border-2 border-gold/10">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center">
              <TrendingUp size={18} className="text-gold mr-3" />
              Progressão de Carga Recente (KG)
            </h3>

            <div className="h-56 w-full min-h-[224px]">
              {chartPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chartPerformanceData}>
                    <defs>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C6A15B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                    <XAxis
                      dataKey="name"
                      stroke="#666"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="peso"
                      stroke="#C6A15B"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorPerf)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600 italic border-2 border-dashed border-[#222] rounded-3xl">
                  Aguardando os primeiros registros de treino...
                </div>
              )}
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center ml-2">
              <Calendar className="text-gold mr-2" size={14} />
              Histórico de Séries
            </h3>

            {[...history].reverse().map((reg) => {
              const ex = exercises.find((e) => e.id === reg.exercise_id);

              return (
                <div
                  key={reg.id}
                  className="card-premium p-6 rounded-[2.5rem] flex items-center justify-between border border-[#222] hover:border-gold/30"
                >
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
                      <TrendingUp size={22} className="text-gold" />
                    </div>

                    <div>
                      <p className="font-black text-white text-lg tracking-tight">
                        {ex?.nome || 'Exercício'}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                        {new Date(reg.date).toLocaleDateString()} •{' '}
                        {new Date(reg.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-gold italic">{reg.carga_kg}kg</p>
                    <p className="text-[9px] text-gray-600 font-black uppercase">
                      {reg.reps_realizadas} Repetições
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] p-6 rounded-[2.5rem] border border-[#222] border-l-4 border-l-gold shadow-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Scale size={14} className="text-gold" />
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  Peso Atual
                </p>
              </div>
              <p className="text-3xl font-black text-white italic">
                {latestEval?.peso || '--'}{' '}
                <span className="text-xs text-gray-500 not-italic font-bold">KG</span>
              </p>
            </div>

            <div className="bg-[#111] p-6 rounded-[2.5rem] border border-[#222] border-l-4 border-l-emerald-500 shadow-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Percent size={14} className="text-emerald-500" />
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  Gordura Est.
                </p>
              </div>
              <p className="text-3xl font-black text-white italic">
                {latestEval?.gordura_percentual || '--'}{' '}
                <span className="text-xs text-gray-500 not-italic font-bold">%</span>
              </p>
            </div>
          </div>

          <div className="card-premium p-8 rounded-[3rem]">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center">
              <Layers size={18} className="text-gold mr-3" />
              Flutuação de Peso Corporal
            </h3>

            <div className="h-56 w-full min-h-[224px]">
              {chartFisicoData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={chartFisicoData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                    <XAxis
                      dataKey="name"
                      stroke="#666"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '16px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#C6A15B"
                      strokeWidth={5}
                      dot={{ r: 6, fill: '#C6A15B', strokeWidth: 3, stroke: '#0A0A0A' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600 italic text-center px-10 border-2 border-dashed border-[#222] rounded-3xl">
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Registre pelo menos duas avaliações para gerar o gráfico de tendência física.
                  </p>
                </div>
              )}
            </div>
          </div>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center ml-2">
              <Ruler className="text-gold mr-2" size={16} />
              Relatório Antropométrico
            </h3>

            {avaliacoes.length > 0 ? (
              <div className="space-y-6">
                {[...avaliacoes].reverse().map((evalItem) => (
                  <div
                    key={evalItem.id}
                    className="card-premium p-8 rounded-[3rem] border-2 border-[#222] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-12 -mt-12"></div>

                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#222]">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gold/10 p-2 rounded-xl text-gold">
                          <Calendar size={18} />
                        </div>
                        <span className="text-sm font-black text-white uppercase italic tracking-tight">
                          {new Date(evalItem.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter">
                        {evalItem.peso} KG
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {renderMedidaGridItem('Pescoço', evalItem.medidas.pescoco)}
                      {renderMedidaGridItem('Ombros', evalItem.medidas.ombros)}
                      {renderMedidaGridItem('Tórax', evalItem.medidas.torax)}
                      {renderMedidaGridItem('Cintura', evalItem.medidas.cintura)}
                      {renderMedidaGridItem('Abdomem', evalItem.medidas.abdomem)}
                      {renderMedidaGridItem('Quadril', evalItem.medidas.quadril)}
                      {renderMedidaGridItem('Braço D', evalItem.medidas.braco_d)}
                      {renderMedidaGridItem('Braço E', evalItem.medidas.braco_e)}
                      {renderMedidaGridItem('Antebraço D', evalItem.medidas.antebraco_d)}
                      {renderMedidaGridItem('Antebraço E', evalItem.medidas.antebraco_e)}
                      {renderMedidaGridItem('Coxa D', evalItem.medidas.coxa_d)}
                      {renderMedidaGridItem('Coxa E', evalItem.medidas.coxa_e)}
                      {renderMedidaGridItem('Pant. D', evalItem.medidas.panturrilha_d)}
                      {renderMedidaGridItem('Pant. E', evalItem.medidas.panturrilha_e)}
                      {renderMedidaGridItem('Gordura', evalItem.gordura_percentual, '%')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-[#222] rounded-[3rem] bg-[#111]/30">
                <Scale size={64} className="mx-auto text-gray-800 mb-6" />
                <p className="text-gray-500 font-black uppercase text-xs tracking-[0.3em] italic">
                  Aguardando Primeira Medição Oficial
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] p-8 rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  Nova Medição
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Coleta de dados corporais completa
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-12 h-12 bg-[#1A1A1A] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-[#222]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 overflow-y-auto no-scrollbar pr-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1A1A1A] p-5 rounded-[2rem] border border-[#222] focus-within:border-gold transition-colors">
                  <label className="text-[9px] font-black text-gold uppercase mb-2 flex items-center">
                    <Scale size={12} className="mr-2" /> Peso Total (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="00.0"
                    className="bg-transparent text-white font-black text-2xl outline-none w-full placeholder:text-gray-800"
                    value={newEval.peso}
                    onChange={(e) => setNewEval({ ...newEval, peso: e.target.value })}
                  />
                </div>

                <div className="bg-[#1A1A1A] p-5 rounded-[2rem] border border-[#222] focus-within:border-gold transition-colors">
                  <label className="text-[9px] font-black text-gold uppercase mb-2 flex items-center">
                    <Percent size={12} className="mr-2" /> Gordura (%)
                  </label>
                  <input
                    type="number"
                    placeholder="00"
                    className="bg-transparent text-white font-black text-2xl outline-none w-full placeholder:text-gray-800"
                    value={newEval.gordura}
                    onChange={(e) => setNewEval({ ...newEval, gordura: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-gold pl-3">
                  Tronco & Eixo Central
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'pescoco', label: 'Pescoço' },
                    { id: 'ombros', label: 'Ombros' },
                    { id: 'torax', label: 'Tórax' },
                    { id: 'cintura', label: 'Cintura' },
                    { id: 'abdomem', label: 'Abdomem' },
                    { id: 'quadril', label: 'Quadril' },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className="bg-black/40 p-4 rounded-2xl border border-[#222] focus-within:border-gold/50 transition-colors"
                    >
                      <label className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">
                        {f.label}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          step="0.1"
                          className="bg-transparent text-white font-bold text-lg outline-none w-full"
                          value={(newEval as any)[f.id]}
                          onChange={(e) =>
                            setNewEval({ ...newEval, [f.id]: e.target.value } as typeof newEval)
                          }
                        />
                        <span className="text-[9px] text-gray-700 font-black">CM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-3">
                  Membros Superiores
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'braco_d', label: 'Braço (D)' },
                    { id: 'braco_e', label: 'Braço (E)' },
                    { id: 'antebraco_d', label: 'Antebraço (D)' },
                    { id: 'antebraco_e', label: 'Antebraço (E)' },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className="bg-black/40 p-4 rounded-2xl border border-[#222] focus-within:border-emerald-500/50 transition-colors"
                    >
                      <label className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">
                        {f.label}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          step="0.1"
                          className="bg-transparent text-white font-bold text-lg outline-none w-full"
                          value={(newEval as any)[f.id]}
                          onChange={(e) =>
                            setNewEval({ ...newEval, [f.id]: e.target.value } as typeof newEval)
                          }
                        />
                        <span className="text-[9px] text-gray-700 font-black">CM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3">
                  Membros Inferiores
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'coxa_d', label: 'Coxa (D)' },
                    { id: 'coxa_e', label: 'Coxa (E)' },
                    { id: 'panturrilha_d', label: 'Panturrilha (D)' },
                    { id: 'panturrilha_e', label: 'Panturrilha (E)' },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className="bg-black/40 p-4 rounded-2xl border border-[#222] focus-within:border-blue-500/50 transition-colors"
                    >
                      <label className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">
                        {f.label}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          step="0.1"
                          className="bg-transparent text-white font-bold text-lg outline-none w-full"
                          value={(newEval as any)[f.id]}
                          onChange={(e) =>
                            setNewEval({ ...newEval, [f.id]: e.target.value } as typeof newEval)
                          }
                        />
                        <span className="text-[9px] text-gray-700 font-black">CM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-8 shrink-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-5 text-gray-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEval}
                className="flex-1 bg-gold text-black py-5 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-gold/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Salvar Protocolo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressoView;