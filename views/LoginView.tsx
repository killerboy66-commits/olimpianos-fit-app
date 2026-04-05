import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { db } from '../services/storage';
import { Usuario } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastUser, setLastUser] = useState<Usuario | null>(null);
  const [view, setView] = useState<'selection' | 'login-atleta' | 'login-mestre'>('selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLastUser = async () => {
      try {
        const lastEmail = await db.getLastUser();
        if (!lastEmail) return;

        const normalizedEmail = lastEmail.trim().toLowerCase();

        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar último usuário:', error);
          return;
        }

        if (data) {
          setLastUser({
            ...data,
            role: data.role || 'aluno',
            status: data.status || 'ativo',
            objetivo: data.objetivo || '',
            foto: data.foto || '',
          } as Usuario);
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar último usuário:', err);
      }
    };

    loadLastUser();
  }, []);

  const handleQuickLogin = () => {
    if (!lastUser) return;

    setError('');
    setPassword('');
    setEmail(lastUser.email);

    if (lastUser.role === 'professor') {
      setView('login-mestre');
    } else {
      setView('login-atleta');
    }
  };

  const handlePortalSelection = (type: 'atleta' | 'mestre') => {
    setError('');
    setPassword('');
    setEmail('');

    if (type === 'atleta') {
      setView('login-atleta');
    } else {
      setView('login-mestre');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password) {
        setError('Preencha e-mail e senha');
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError) {
        setError('Email ou senha inválidos');
        return;
      }

      const { data: foundUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (userError) {
        await supabase.auth.signOut();
        setError('Erro ao validar usuário no sistema');
        return;
      }

      if (!foundUser) {
        await supabase.auth.signOut();
        setError('Usuário não encontrado no sistema');
        return;
      }

      if (foundUser.status === 'bloqueado') {
        await supabase.auth.signOut();
        setError('Seu acesso está bloqueado. Fale com o suporte.');
        return;
      }

      if (view === 'login-mestre' && foundUser.role !== 'professor') {
        await supabase.auth.signOut();
        setError('Este acesso é exclusivo para professores.');
        return;
      }

      if (view === 'login-atleta' && foundUser.role === 'professor') {
        await supabase.auth.signOut();
        setError('Use o Centro de Comando para entrar como professor.');
        return;
      }

      await db.setLastUser(normalizedEmail);
      onLogin(normalizedEmail);
    } catch (err) {
      console.error(err);
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-40 pb-16 sm:pt-64 sm:pb-20"
      style={{
        backgroundImage: "url('/adss.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#050505',
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        <div className="mb-10 mt-10 flex flex-col items-center justify-center text-center">
          <Logo size={140} />
          <h1 className="text-3xl font-black text-gold mt-2 uppercase italic">
            Olimpianos Fit
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md grid gap-4"
            >
              {lastUser && (
                <button
                  onClick={handleQuickLogin}
                  className="w-full bg-white/5 border border-gold/30 p-3 rounded-xl flex items-center justify-between hover:bg-gold/10 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg border border-gold overflow-hidden">
                      <img
                        src={lastUser.role === 'professor' ? '/logo.png' : '/aluno.png'}
                        className="w-full h-full object-cover"
                        alt="Avatar"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gold uppercase">Continuar como</p>
                      <h4 className="text-white font-bold">{lastUser.nome}</h4>
                    </div>
                  </div>
                  <ArrowRight className="text-gold" />
                </button>
              )}

              <button
                onClick={() => handlePortalSelection('atleta')}
                className="bg-black/80 border border-gold p-4 rounded-xl text-white hover:bg-gold/10"
              >
                Portal do Atleta
              </button>

              <button
                onClick={() => handlePortalSelection('mestre')}
                className="bg-black/80 border border-gold p-4 rounded-xl text-white hover:bg-gold/10"
              >
                Centro de Comando
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md"
            >
              <div className="bg-black/80 p-6 rounded-2xl border border-white/10">
                <button
                  onClick={() => {
                    setView('selection');
                    setError('');
                    setPassword('');
                  }}
                  className="mb-4 text-gray-400 hover:text-white"
                >
                  Voltar
                </button>

                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="w-full p-3 mb-3 bg-white/5 border border-white/10 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Sua senha"
                  className="w-full p-3 mb-3 bg-white/5 border border-white/10 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                  <p className="text-red-500 text-sm mb-2">{error}</p>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gold text-black py-3 font-bold disabled:opacity-60"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginView;