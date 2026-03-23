
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
      setEmail('aluno@teste.com'); // Pre-fill for demo
      setView('login-atleta');
    } else {
      setEmail('renato@vip.com'); // Pre-fill for demo
      setView('login-mestre');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-40 pb-16 sm:pt-64 sm:pb-20 bg-[#050505]">
      {/* Background Immersive */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Imagem do Zeus (adss.png) */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.2, y: 0 }}
          animate={{ opacity: 1, scale: 1.1, y: -30 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img 
            src="/adss.png" 
            className="w-full h-full object-cover" 
            alt="" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 opacity-30"></div>
        
        {/* Efeito de Brilho Centralizado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-gold/5 blur-[150px] rounded-full animate-pulse"></div>
        </div>
        
        {/* Animated Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/10 blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05] 
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full"
        ></motion.div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        {/* Logo & Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 sm:mb-20 text-center"
        >
          <div className="mb-0 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full group-hover:bg-gold/40 transition-all duration-1000 scale-125"></div>
              <Logo size={120} className="relative drop-shadow-[0_0_40px_rgba(198,161,91,0.4)] animate-pulse-gold sm:size-[160px]" />
            </div>
          </div>
          
          <div className="space-y-0 -mt-4 sm:-mt-8">
            <h1 
              className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.1em] uppercase text-gold text-glow-gold font-display italic"
              style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 20px rgba(198,161,91,0.5)' }}
            >
              Olimpianos Fit
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <div className="h-px w-4 sm:w-10 bg-gradient-to-r from-transparent to-gold/40"></div>
              <p 
                className="text-[6px] sm:text-[8px] md:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gray-400 font-tech italic"
                style={{ textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000' }}
              >
                Treinamento de Elite
              </p>
              <div className="h-px w-4 sm:w-10 bg-gradient-to-l from-transparent to-gold/40"></div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-sm md:max-w-md lg:max-w-xl grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3"
            >
              {/* Quick Access (if exists) */}
              {lastUser && (
                <div className="md:col-span-2 mb-2">
                  <button 
                    onClick={handleQuickLogin}
                    className="w-full bg-white/5 border border-gold/30 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between group hover:bg-gold/10 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-gold/50 p-0.5 overflow-hidden bg-black">
                        <img 
                          src={lastUser.role === 'professor' ? "/adss.png" : "/aluno.png"} 
                          className="w-full h-full rounded-lg object-cover" 
                          alt="Avatar" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] sm:text-[9px] font-black text-gold uppercase tracking-widest leading-none mb-0.5">Continuar como</p>
                        <h4 className="text-sm sm:text-base font-black text-white uppercase italic leading-none">{lastUser.nome}</h4>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Portal do Atleta */}
              <button 
                onClick={() => handlePortalSelection('atleta')}
                className="group relative bg-[#0A0A0A] border-2 border-gold/80 p-2.5 sm:p-3.5 rounded-[0.8rem] sm:rounded-[1rem] overflow-hidden transition-all hover:border-gold shadow-[0_0_20px_rgba(198,161,91,0.2)] hover:shadow-[0_0_35px_rgba(198,161,91,0.4)]"
              >
                <div className="absolute top-0 right-0 p-1 sm:p-1.5 opacity-5 group-hover:opacity-10 transition-opacity">
                  <User className="size-[25px] sm:size-[35px]" />
                </div>
                <div className="relative z-10 text-left">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gold/10 rounded-md flex items-center justify-center text-gold mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform">
                    <User className="size-2.5 sm:size-3" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base font-black text-white uppercase italic leading-none mb-0.5">Portal do Atleta</h3>
                  <p className="text-[6px] sm:text-[7px] text-gray-500 font-medium leading-tight uppercase tracking-wider">Treinos e evolução.</p>
                  <div className="mt-1 sm:mt-1.5 flex items-center text-gold font-black text-[5px] sm:text-[6px] uppercase tracking-widest">
                    Entrar <ChevronRight className="ml-0.5 group-hover:translate-x-1 transition-transform size-1 sm:size-1.5" />
                  </div>
                </div>
              </button>

              {/* Centro de Comando (Mestre) */}
              <button 
                onClick={() => handlePortalSelection('mestre')}
                className="group relative bg-[#0A0A0A] border-2 border-gold/80 p-2.5 sm:p-3.5 rounded-[0.8rem] sm:rounded-[1rem] overflow-hidden transition-all hover:border-gold shadow-[0_0_20px_rgba(198,161,91,0.2)] hover:shadow-[0_0_35px_rgba(198,161,91,0.4)]"
              >
                <div className="absolute top-0 right-0 p-1 sm:p-1.5 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck className="size-[25px] sm:size-[35px]" />
                </div>
                <div className="relative z-10 text-left">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gold/10 rounded-md flex items-center justify-center text-gold mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="size-2.5 sm:size-3" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base font-black text-white uppercase italic leading-none mb-0.5">Centro de Comando</h3>
                  <p className="text-[6px] sm:text-[7px] text-gray-500 font-medium leading-tight uppercase tracking-wider">Gestão e performance.</p>
                  <div className="mt-1 sm:mt-1.5 flex items-center text-gold font-black text-[5px] sm:text-[6px] uppercase tracking-widest">
                    Acesso <ChevronRight className="ml-0.5 group-hover:translate-x-1 transition-transform size-1 sm:size-1.5" />
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm"
            >
              <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl relative">
                <button 
                  onClick={() => setView('selection')}
                  className="absolute top-4 left-4 sm:top-6 sm:left-6 text-gray-500 hover:text-white transition-colors"
                >
                  <RotateCcw className="size-4 sm:size-[18px]" />
                </button>

                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">
                    {view === 'login-atleta' ? 'Acesso do Atleta' : 'Acesso do Mestre'}
                  </h2>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Identifique-se para prosseguir</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="relative group/input">
                    <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within/input:text-gold transition-colors size-4 sm:size-[18px]" />
                    <input 
                      type="email" 
                      placeholder="SEU E-MAIL VIP"
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-12 sm:pl-14 pr-4 sm:pr-6 focus:border-gold/50 focus:bg-white/10 outline-none transition-all text-white placeholder:text-white/20 tracking-widest text-[10px] sm:text-xs font-black"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onLogin(email)}
                    />
                  </div>

                  <button 
                    onClick={() => onLogin(email)}
                    className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] uppercase flex items-center justify-center gap-2 ${
                      view === 'login-atleta' 
                        ? 'bg-gold text-black hover:bg-gold-light shadow-gold/10' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/10'
                    }`}
                  >
                    Entrar no Olimpo
                    <ArrowRight className="size-3.5 sm:size-4" />
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                    Problemas com acesso? Fale com o suporte.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 sm:mt-32 text-center"
        >
          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">
            &copy; 2026 Olimpianos Fit &bull; Renato Wolff &bull; Powered by Elite Tech
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="mt-8 flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all active:scale-95"
          >
            <RotateCcw size={12} />
            <span>Resetar Sistema</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginView;
;