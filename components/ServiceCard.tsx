
import React, { useState } from 'react';
import { ServiceProvider, User } from '../types';

interface ServiceCardProps {
  provider: ServiceProvider;
  onOptimize: (id: string) => void;
  isOptimizing: boolean;
  currentUser: User | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ provider, currentUser }) => {
  const [showContactLimit, setShowContactLimit] = useState(false);

  const handleContactClick = (e: React.MouseEvent) => {
    // Simulação de limite para usuários gratuitos
    if (currentUser && !currentUser.isPremium) {
      // Aqui você poderia ter um contador real no banco
      // Por enquanto, mostramos apenas a importância do premium
      setShowContactLimit(true);
    }
  };

  return (
    <div className={`group bg-[#1e293b] border ${provider.isPremium ? 'border-amber-500/50 shadow-amber-900/20' : 'border-slate-700/50 shadow-slate-950/20'} rounded-2xl overflow-hidden transition-all hover:shadow-2xl`}>
      {provider.isPremium && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-1 flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Talento Destaque Premium</span>
          <i className="fa-solid fa-crown text-[10px] text-slate-900"></i>
        </div>
      )}
      
      {/* Imagem do Serviço (Se existir) */}
      {provider.imageUrl && (
        <div className="w-full h-48 overflow-hidden relative">
          <img 
            src={provider.imageUrl} 
            alt={provider.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            {!provider.imageUrl && (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${provider.isPremium ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-cyan-400 border border-slate-700'}`}>
                {provider.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-black text-white text-lg tracking-tight group-hover:text-cyan-400 transition-colors">{provider.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-900 rounded text-[9px] text-slate-400 font-bold uppercase tracking-widest border border-slate-800">{provider.category}</span>
                <span className="text-cyan-500 text-[10px] font-black uppercase italic tracking-tighter">{provider.serviceType}</span>
              </div>
            </div>
          </div>
          {provider.location && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
              <i className="fa-solid fa-location-dot text-cyan-500/50"></i>
              Região Ativa
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
            {provider.optimizedDescription || provider.description}
          </p>

          <div className="relative">
            <a 
              href={showContactLimit ? '#' : `https://wa.me/${provider.contact.replace(/\D/g, '')}?text=Oi ${provider.name}, vi seu perfil no Favela Business!`}
              target={showContactLimit ? '_self' : '_blank'}
              onClick={handleContactClick}
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${provider.isPremium ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/20'}`}
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              {showContactLimit ? 'Limites de acesso Grátis' : 'Solicitar Orçamento'}
            </a>
            
            {showContactLimit && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-amber-500/50 p-4 rounded-xl z-10 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] text-amber-500 font-bold uppercase mb-2">Atenção!</p>
                <p className="text-xs text-slate-400 mb-3">Como usuário Grátis, você tem limite de visualizações de contatos por dia.</p>
                <button 
                  onClick={() => window.location.hash = 'premium'}
                  className="text-[9px] font-black text-cyan-400 uppercase underline"
                >
                  Liberar Acessos Ilimitados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-900/30 flex items-center justify-between border-t border-slate-700/30">
        <div className="flex items-center gap-6 text-slate-500">
          <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
            <i className="fa-regular fa-star text-sm"></i>
            <span className="text-[10px] font-black uppercase">Indicar</span>
          </button>
        </div>
        <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
          Favela Business • 2025
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
