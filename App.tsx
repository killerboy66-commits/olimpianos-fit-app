import InstallApp from "./InstallApp";
import React, { useState, useEffect } from 'react';
import { Route, Usuario } from './types';
import { db } from './services/storage';
import { supabase } from './services/supabase';

// Views
import LoginView from './views/LoginView';
import AlunoDashboard from './views/AlunoDashboard';
import TreinoDetalhe from './views/TreinoDetalhe';
import ProgressoView from './views/ProgressoView';
import ProfessorPainel from './views/ProfessorPainel';
import NutricionistaView from './views/NutricionistaView';
import SuplementosView from './views/SuplementosView';
import PsicologiaView from './views/PsicologiaView';
import ExerciciosView from './views/ExerciciosView';
import DesafioView from './views/DesafioView';
import AIChat from './components/AIChat';
import Navbar from './components/Navbar';
import { ChevronUp } from 'lucide-react';
import { useNotification } from './components/Notification';

const App: React.FC = () => {
  const { notify } = useNotification();
  const [currentRoute, setCurrentRoute] = useState<Route>(Route.LOGIN);
  const [user, setUser] = useState<Usuario | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [selectedProfessorAluno, setSelectedProfessorAluno] = useState<Usuario | null>(null);
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
      try {
        const isConnected = await db.testConnection();
        if (!isConnected) {
          notify('Erro de conexão com o banco de dados.', 'error');
        }

        // 🔥 PRIORIDADE: usuário autenticado no Supabase Auth
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Erro ao obter usuário autenticado:', error);
        }

        if (data.user?.email) {
          const users = await db.getUsers();
          const found = users.find((u) => u.email === data.user?.email);

          if (found) {
            try {
              await db.setLoggedUser(found);
              await db.setLastUser(found.email);
            } catch (e) {
              console.warn('Erro ao sincronizar sessão local:', e);
            }

            setUser(found);
            setCurrentRoute(found.role === 'professor' ? Route.PROFESSOR : Route.ALUNO);
            return;
          } else {
            notify('Usuário autenticado, mas não encontrado na tabela do sistema.', 'error');
          }
        }

        // fallback antigo
        const logged = await db.getLoggedUser();
        if (logged) {
          setUser(logged);
          setCurrentRoute(logged.role === 'professor' ? Route.PROFESSOR : Route.ALUNO);
        }
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
      }
    };

    initApp();
  }, [notify]);

  const handleLogin = async (email: string) => {
    try {
      const users = await db.getUsers();
      const found = users.find((u) => u.email === email);

      if (!found) {
        notify('E-mail não cadastrado.', 'error');
        return;
      }

      localStorage.setItem('userEmail', found.email);

      try {
        await db.setLoggedUser(found);
        await db.setLastUser(found.email);
      } catch (e) {
        console.warn('Erro ao salvar sessão, mas login continua:', e);
      }

      console.log('LOGIN OK:', found);

      setUser(found);
      setCurrentRoute(found.role === 'professor' ? Route.PROFESSOR : Route.ALUNO);

      notify(`Bem-vindo, ${found.nome}!`, 'success');
    } catch (error) {
      console.error('Erro no login:', error);
      notify('Erro ao fazer login.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair do Supabase Auth:', error);
    }

    await db.setLoggedUser(null);
    setUser(null);
    setSelectedProfessorAluno(null);
    setCurrentRoute(Route.LOGIN);
  };

  const navigateToTreino = (id: string) => {
    setSelectedWorkoutId(id);
    setCurrentRoute(Route.TREINO);
  };

  const handleProfessorSelectAluno = (aluno: Usuario) => {
    setSelectedProfessorAluno(aluno);
    setCurrentRoute(Route.PROGRESSO);
  };

  const handleBackFromProgress = () => {
    if (user?.role === 'professor') {
      setCurrentRoute(Route.PROFESSOR);
      return;
    }

    setCurrentRoute(Route.ALUNO);
  };

  const renderContent = () => {
    if (!user && currentRoute !== Route.LOGIN) {
      return <LoginView onLogin={handleLogin} />;
    }

    if (user?.role === 'aluno' && currentRoute === Route.EXERCICIOS) {
      setCurrentRoute(Route.ALUNO);
      return (
        <AlunoDashboard
          user={user}
          onStartWorkout={navigateToTreino}
          onNavigate={setCurrentRoute}
          onLogout={handleLogout}
        />
      );
    }

    switch (currentRoute) {
      case Route.LOGIN:
        return <LoginView onLogin={handleLogin} />;

      case Route.ALUNO:
        return (
          <AlunoDashboard
            user={user!}
            onStartWorkout={navigateToTreino}
            onNavigate={setCurrentRoute}
            onLogout={handleLogout}
          />
        );

      case Route.TREINO:
        return (
          <TreinoDetalhe
            user={user!}
            initialWorkoutId={selectedWorkoutId!}
            onBack={() => setCurrentRoute(Route.ALUNO)}
          />
        );

      case Route.PROGRESSO:
        return (
          <ProgressoView
            user={user?.role === 'professor' && selectedProfessorAluno ? selectedProfessorAluno : user!}
            onBack={handleBackFromProgress}
          />
        );

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
        return (
          <ProfessorPainel
            user={user!}
            onLogout={handleLogout}
            onNavigate={setCurrentRoute}
            onSelectAluno={handleProfessorSelectAluno}
          />
        );

      default:
        return <LoginView onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <InstallApp />

      {user && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNavigate={setCurrentRoute}
          currentRoute={currentRoute}
        />
      )}

      {currentRoute === Route.LOGIN ? (
        <main className="flex-1 w-full">{renderContent()}</main>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
          {renderContent()}
        </main>
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gold text-black rounded-full shadow-2xl shadow-gold/40 hover:scale-110 transition-all"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default App;