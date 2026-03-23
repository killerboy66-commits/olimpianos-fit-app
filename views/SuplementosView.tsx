
import React from 'react';
import { ShoppingBag, Zap, Award, ExternalLink, Copy, Check, Package, Sparkles } from 'lucide-react';

const SuplementosView: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const couponCode = "OLIMPIANOS15";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const storeUrl = "https://www.lojasuplementos.com.br"; // Link da loja parceira

  const recommendedProducts = [
    {
      name: "Whey Protein Isolate",
      brand: "Premium Performance",
      benefit: "Recuperação Muscular",
      image: "https://images.unsplash.com/photo-1593095183571-245f78802a75?q=80&w=200&auto=format&fit=crop",
      price: "R$ 189,90"
    },
    {
      name: "Creatina Monohidratada",
      brand: "Elite Force",
      benefit: "Força e Explosão",
      image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=200&auto=format&fit=crop",
      price: "R$ 99,00"
    },
    {
      name: "Pré-Treino Insane",
      brand: "Dark Energy",
      benefit: "Foco e Energia",
      image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=200&auto=format&fit=crop",
      price: "R$ 145,00"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-black italic uppercase text-white">Loja de Suplementos</h2>
        <p className="text-gray-500 font-medium">Equipamento nutricional de <span className="text-gold">Alta Performance</span>.</p>
      </header>

      {/* Banner Principal da Loja Parceira */}
      <section>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1A1A1A] to-[#050505] border-2 border-gold/10 p-8 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center space-x-2 bg-gold/10 px-4 py-1.5 rounded-full">
                <Award size={14} className="text-gold" />
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Parceiro Oficial VIP</span>
              </div>
              <h3 className="text-3xl font-black italic">OLIMPIANOS SUPPS X LOJA PARCEIRA</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Adquira os melhores suplementos do mercado com condições exclusivas para membros do time Olimpianos Fit. Qualidade testada e aprovada pelos nossos treinadores.
              </p>
              
              <div className="pt-4 flex items-center space-x-4">
                <div className="flex-1 bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Seu Cupom Exclusive</p>
                    <p className="text-xl font-black text-white tracking-tighter">{couponCode}</p>
                  </div>
                  <button 
                    onClick={handleCopyCode}
                    className="p-3 bg-gold/10 text-gold rounded-xl hover:bg-gold hover:text-black transition-all"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <a 
                href={storeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-gold to-yellow-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col items-center justify-center space-y-4 bg-black border border-[#222] px-12 py-10 rounded-[2rem] hover:border-gold transition-colors">
                  <ShoppingBag size={48} className="text-gold" />
                  <span className="font-black text-xs uppercase tracking-[0.2em] text-white">Ir para a Loja</span>
                  <ExternalLink size={16} className="text-gray-600" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Recomendações */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
            <Sparkles size={14} className="text-gold mr-2" />
            Curadoria do Treinador
          </h3>
          <span className="text-[9px] text-gold font-bold uppercase tracking-widest">Ver todos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProducts.map((product, idx) => (
            <div key={idx} className="card-premium p-5 rounded-[2rem] flex flex-col group">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-[#1A1A1A]">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-[#333] px-3 py-1.5 rounded-xl">
                  <p className="text-[9px] font-black text-gold uppercase tracking-tighter">{product.benefit}</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase">{product.brand}</p>
                <h4 className="font-black text-lg text-white leading-tight">{product.name}</h4>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-xl font-black text-white">{product.price}</p>
                <a 
                  href={storeUrl}
                  target="_blank"
                  className="p-3 bg-white/5 hover:bg-gold hover:text-black rounded-xl transition-all"
                >
                  <ShoppingBag size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="bg-gold/5 border border-gold/10 rounded-3xl p-6 text-center">
        <p className="text-sm text-gray-400 font-medium">
          Dúvidas sobre qual suplemento escolher? <br/>
          Consulte o seu <button className="text-gold font-bold hover:underline">Nutricionista</button> na aba ao lado.
        </p>
      </section>

      <footer className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Olimpianos Fit Official Store Partner</p>
      </footer>
    </div>
  );
};

export default SuplementosView;