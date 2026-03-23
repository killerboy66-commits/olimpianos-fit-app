
import React from 'react';
import { TrendingUp, Calendar, Clock, Award, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Seg', calorias: 400, forca: 240 },
  { name: 'Ter', calorias: 300, forca: 139 },
  { name: 'Qua', calorias: 200, forca: 980 },
  { name: 'Qui', calorias: 278, forca: 390 },
  { name: 'Sex', calorias: 189, forca: 480 },
  { name: 'Sab', calorias: 239, forca: 380 },
  { name: 'Dom', calorias: 349, forca: 430 },
];

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Treinos Concluídos', value: '12', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Minutos Ativos', value: '540', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Seq. Atual', value: '5 dias', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Nível Forge', value: '14', icon: Award, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo, Atleta! 👋</h2>
          <p className="text-slate-400 mt-1">Aqui está o resumo da sua evolução nesta semana.</p>
        </div>
        <div className="px-4 py-2 bg-slate-800 rounded-xl flex items-center space-x-2 border border-slate-700">
          <TrendingUp className="text-emerald-400" size={18} />
          <span className="text-sm font-semibold">+12% vs mês passado</span>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm hover:border-slate-700 transition-colors">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="font-bold mb-6 flex items-center space-x-2">
            <Activity size={18} className="text-indigo-500" />
            <span>Volume de Carga (kg)</span>
          </h3>
          <div className="h-[250px] w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorForca" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="forca" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorForca)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="font-bold mb-6 flex items-center space-x-2">
            <Clock size={18} className="text-emerald-500" />
            <span>Calorias Estimadas</span>
          </h3>
          <div className="h-[250px] w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="calorias" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
