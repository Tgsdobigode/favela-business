
import React from 'react';

interface OpportunitySource {
  title?: string;
  uri?: string;
}

interface LocalOpportunitiesProps {
  data: {
    text: string;
    sources: OpportunitySource[];
  } | null;
  isLoading: boolean;
}

const LocalOpportunities: React.FC<LocalOpportunitiesProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 w-full bg-slate-800 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <i className="fa-solid fa-earth-americas"></i>
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-tighter">Oportunidades na Região</h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Radar Favela Business</p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
          {data.text}
        </p>
      </div>

      {data.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest">Fontes Oficiais:</p>
          <div className="flex flex-col gap-2">
            {data.sources.map((source, idx) => (
              source.uri && (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors border border-slate-800 group"
                >
                  <span className="text-[10px] text-slate-400 truncate pr-4 group-hover:text-cyan-400">
                    {source.title || 'Ver fonte externa'}
                  </span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[8px] text-slate-600"></i>
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalOpportunities;
