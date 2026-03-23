
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Aura de Fundo */}
      <div className="absolute inset-0 bg-gold/10 blur-xl rounded-full"></div>

      {!hasError ? (
        <img 
          src="/logo.png" 
          alt="Olimpianos Fit Logo"
          className="relative z-10 w-full h-full object-cover"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="relative z-10 w-full h-full flex items-center justify-center bg-[#050505] border-2 border-gold/30 rounded-full">
          <div className="text-gold font-display text-center leading-none" style={{ fontSize: size * 0.4 }}>
            O
          </div>
          <div className="absolute inset-0 border border-gold/10 rounded-full animate-pulse-gold"></div>
        </div>
      )}
    </div>
  );
};

export default Logo;
