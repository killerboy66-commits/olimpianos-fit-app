import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { db } from '../services/storage';
import { Usuario } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [lastUser, setLastUser] = useState<Usuario | null>(null);
  const [view, setView] = useState<'selection' | 'login-atleta' | 'login-mestre'>('selection');

  useEffect(() => {
    const loadLastUser = async () => {
      const lastEmail = await db.getLastUser();
      if (lastEmail) {
        const users = await db.getUsers();
        const found = users.find(u => u.email === lastEmail);
        if (found) setLastUser(found);
      }
    };
    loadLastUser();
  }, []);

  const handleQuickLogin = () => {
    if (lastUser) {
      onLogin(lastUser.email);
    }
  };

  const handlePortalSelection = (type: 'atleta' | 'mestre') => {
    if (type === 'atleta') {
      setEmail('aluno@teste.com');
      setView('login-atleta');
    } else {
      setEmail('renato@vip.com');
      setView('login-mestre');
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-40 pb-16 sm:pt-64 sm:pb-20"
      style={{
        backgroundImage: "url('/adss.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#050505",
      }}
    >
      {/* overlay escuro */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">

        {/* LOGO */}
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

              {/* CONTINUAR COMO */}
              {lastUser && (
                <button 
                  onClick={handleQuickLogin}
                  className="w-full bg-white/5 border border-gold/30 p-3 rounded-xl flex items-center justify-between hover:bg-gold/10 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg border border-gold overflow-hidden">
                      <img 
                        src={lastUser.role === 'professor' ? "/logo.png" : "/aluno.png"} 
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

              {/* PORTAL ATLETA */}
              <button 
                onClick={() => handlePortalSelection('atleta')}
                className="bg-black/80 border border-gold p-4 rounded-xl text-white hover:bg-gold/10"
              >
                Portal do Atleta
              </button>

              {/* PORTAL MESTRE */}
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
                  onClick={() => setView('selection')}
                  className="mb-4 text-gray-400 hover:text-white"
                >
                  Voltar
                </button>

                <input 
                  type="email" 
                  placeholder="Seu e-mail"
                  className="w-full p-3 mb-4 bg-white/5 border border-white/10 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button 
                  onClick={() => onLogin(email)}
                  className="w-full bg-gold text-black py-3 font-bold"
                >
                  Entrar
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