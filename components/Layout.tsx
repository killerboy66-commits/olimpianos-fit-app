
import React from 'react';
import { LayoutDashboard, Dumbbell, MessageSquare, PlusCircle, Settings } from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: View.DASHBOARD },
    { icon: PlusCircle, label: 'Novo Treino', view: View.GENERATE },
    { icon: Dumbbell, label: 'Meus Planos', view: View.PLANS },
    { icon: MessageSquare, label: 'Treinador AI', view: View.CHAT },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">
            FitForge AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.view 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white w-full transition-colors">
            <Settings size={20} />
            <span className="font-medium">Configurações</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {children}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex justify-around items-center bg-slate-900 border-t border-slate-800 py-3 px-2 sticky bottom-0">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeView === item.view ? 'text-indigo-500' : 'text-slate-500'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] mt-1 uppercase font-bold tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
