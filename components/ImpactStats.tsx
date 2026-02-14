
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 1200 },
];

const COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'];

const ImpactStats: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Impacto na Comunidade</h2>
          <p className="text-xs text-slate-400">Novos negócios registrados este ano</p>
        </div>
        <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
          <i className="fa-solid fa-chart-line text-xl"></i>
        </div>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: '#1e293b' }}
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total de Talentos</p>
          <p className="text-xl font-black text-white">3.4k+</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Renda Gerada</p>
          <p className="text-xl font-black text-emerald-400">R$ 1.2M</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactStats;
