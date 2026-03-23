
import React, { useState, useEffect } from 'react';
import { Route, Usuario } from './types';
import { db } from './services/storage';

// Componentes de Visualização
import LoginView from "./views/LoginView";
import AlunoDashboard from "./views/AlunoDashboard";
import TreinoDetalhe from "./views/TreinoDetalhe";
import ProgressoView from "./views/ProgressoView";
import ProfessorPainel from "./views/ProfessorPainel";
import NutricionistaView from "./views/NutricionistaView";
import SuplementosView from "./views/SuplementosView";
import PsicologiaView from "./views/PsicologiaView";
import ExerciciosView from "./views/ExerciciosView";
import DesafioView from "./views/DesafioView";
import AIChat from "./components/AIChat";
import Navbar from "./components/Navbar";
import { ChevronUp } from 'lucide-react';
import { useNotification } from './components/Notification';

const App: React.FC = () => {
  const { notify } = useNotification();
  const [currentRoute, setCurrentRoute] = useState<Route>(Route.LOGIN);
  const [user, setUser] = useState<Usuario | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      console.log('App mounted, checking logged user...');
      try {
        const isConnected = await db.testConnection();
        if (!isConnected) {
          notify('Erro de conexão com o banco de dados. Verifique as configurações.', 'error');
        }

        const logged = await db.getLoggedUser();
        if (logged) {
          console.log('User found:', logged.email);
          setUser(logged);
          setCurrentRoute(logged.role === 'professor' ? Route.PROFESSOR : Route.ALUNO);
        } else {
          console.log('No user logged in.');
        }
      } catch (error) {
        console.error('Error during initial load:', error);
      }
    };
    initApp();
  }, []);

  const handleLogin = async (email: string) => {
    const users = await db.getUsers();
    const found = users.find(u => u.email === email);
    if (found) {
      await db.setLoggedUser(found);
      await db.setLastUser(found.email);
      setUser(found);
      setCurrentRoute(found.role === 'professor' ? Route.PROFESSOR : Route.ALUNO);
      notify(`Bem-vindo de volta, ${found.nome}!`, 'success');
    } else {
      notify('E-mail não cadastrado. Tente: aluno@teste.com ou renato@vip.com', 'error');
    }
  };

  const handleLogout = async () => {
    await db.setLoggedUser(null);
    setUser(null);
    setCurrentRoute(Route.LOGIN);
  };

  const navigateToTreino = (id: string) => {
    setSelectedWorkoutId(id);
    setCurrentRoute(Route.TREINO);
  };

  const renderContent = () => {
    if (!user && currentRoute !== Route.LOGIN) {
      setCurrentRoute(Route.LOGIN);
      return <LoginView onLogin={handleLogin} />;
    }

    // Segurança de Rota: Aluno não acessa Biblioteca/Exercícios
    if (user?.role === 'aluno' && currentRoute === Route.EXERCICIOS) {
      setCurrentRoute(Route.ALUNO);
      return <AlunoDashboard user={user!} onStartWorkout={navigateToTreino} onNavigate={setCurrentRoute} onLogout={handleLogout} />;
    }

    switch (currentRoute) {
      case Route.LOGIN:
        return <LoginView onLogin={handleLogin} />;
      case Route.ALUNO:
        return <AlunoDashboard user={user!} onStartWorkout={navigateToTreino} onNavigate={setCurrentRoute} onLogout={handleLogout} />;
      case Route.TREINO:
        return <TreinoDetalhe user={user!} initialWorkoutId={selectedWorkoutId!} onBack={() => setCurrentRoute(Route.ALUNO)} />;
      case Route.PROGRESSO:
        return <ProgressoView user={user!} onBack={() => setCurrentRoute(Route.ALUNO)} />;
      case Route.NUTRICIONISTA:
        return <NutricionistaView user={user!} onBack={() => setCurrentRoute(Route.ALUNO)} />;
      case Route.SUPLEMENTOS:
        return <SuplementosView />;
      case Route.PSICOLOGIA:
        return <PsicologiaView user={user!} onNavigate={setCurrentRoute} />;
      case Route.EXERCICIOS:
        return <ExerciciosView />;
      case Route.DESAFIO:
        return <DesafioView />;
      case Route.AICHAT:
        return <AIChat />;
      case Route.PROFESSOR:
        return <ProfessorPainel user={user!} onLogout={handleLogout} />;
      default:
        return <LoginView onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {user && <Navbar user={user} onLogout={handleLogout} onNavigate={setCurrentRoute} currentRoute={currentRoute} />}
      
      {currentRoute === Route.LOGIN ? (
        <main className="flex-1 w-full">
          {renderContent()}
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
          {renderContent()}
        </main>
      )}

      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gold text-black rounded-full shadow-2xl shadow-gold/40 hover:scale-110 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 animate-pulse-gold"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default App;
