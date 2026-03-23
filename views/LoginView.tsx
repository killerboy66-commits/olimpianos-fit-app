
import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, User, ArrowRight, RotateCcw, ChevronRight } from 'lucide-react';
import { db } from '../services/storage';
import { Usuario } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-40 pb-16 sm:pt-64 sm:pb-20 bg-[#050505]">
      
      {/* 🔥 BACKGROUND ZEUS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 2.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
  className="absolute inset-0 bg-cover bg-center opacity-90"
  style={{
    backgroundImage: "url('/adds.png')"
  }}
/>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">

        {/* 🔥 LOGO */}
        <div className="mb-16 text-center">
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

              {/* 🔥 CONTINUAR COMO */}
              {lastUser && (
                <button 
                  onClick={handleQuickLogin}
                  className="w-full bg-white/5 border border-gold/30 p-3 rounded-xl flex items-center justify-between hover:bg-gold/10 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg border border-gold overflow-hidden">
                      <img 
                        src={lastUser.role === 'professor' ? "/adds.png" : "/aluno.png"} 
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

              {/* 🔥 PORTAL ATLETA */}
              <button 
                onClick={() => handlePortalSelection('atleta')}
                className="bg-black border border-gold p-4 rounded-xl text-white hover:bg-gold/10"
              >
                Portal do Atleta
              </button>

              {/* 🔥 PORTAL MESTRE */}
              <button 
                onClick={() => handlePortalSelection('mestre')}
                className="bg-black border border-gold p-4 rounded-xl text-white hover:bg-gold/10"
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