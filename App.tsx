
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ServiceProvider, User } from './types';
import ServiceCard from './components/ServiceCard';
import ImpactStats from './components/ImpactStats';
import { optimizeServiceDescription } from './services/geminiService';
import { db } from './services/db';

const CATEGORIES = ["Todos", "Serviços Gerais", "Beleza & Estética", "Gastronomia", "Educação", "Tecnologia", "Artesanato"];

const App: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'profile' | 'premium'>('feed');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', serviceType: '', description: '', contact: '', category: CATEGORIES[1], termsAccepted: false
  });
  
  const [authFormData, setAuthFormData] = useState({ name: '', email: '' });
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    const init = async () => {
      const [storedProviders, user] = await Promise.all([
        db.getProviders(),
        db.getCurrentUser()
      ]);
      setProviders(storedProviders);
      setCurrentUser(user);
      setIsLoading(false);
    };
    init();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const filteredProviders = useMemo(() => {
    return providers
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0));
  }, [providers, searchTerm, selectedCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await db.login(authFormData.email, authFormData.name);
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert("Você precisa aceitar os termos de uso (LGPD) para continuar.");
      return;
    }
    if (!currentUser) { setShowAuthModal(true); return; }
    
    setIsLoading(true);

    let imageUrl = undefined;
    if (imageFile) {
      const uploadedUrl = await db.uploadImage(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const newProvider: ServiceProvider = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      ownerId: currentUser.id,
      createdAt: Date.now(),
      location: location || undefined,
      isPremium: currentUser.isPremium,
      imageUrl: imageUrl
    };

    await db.saveProvider(newProvider);
    setProviders(prev => [newProvider, ...prev]);
    
    optimizeServiceDescription(newProvider).then(async (optimized) => {
      const updated = { ...newProvider, optimizedDescription: optimized };
      await db.saveProvider(updated);
      setProviders(current => current.map(p => p.id === newProvider.id ? updated : p));
    });

    setActiveTab('feed');
    setIsLoading(false);
    setImagePreview(null);
    setImageFile(null);
    setFormData({ ...formData, name: '', serviceType: '', description: '', contact: '' });
  };

  if (isLoading && providers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center animate-pulse">
          <h2 className="text-cyan-500 font-black text-2xl uppercase italic tracking-tighter">Favela Business</h2>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-200 selection:bg-cyan-500 selection:text-white pb-20 lg:pb-0 flex flex-col">
      <header className="sticky top-0 z-40 bg-[#1e293b]/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2 cursor-pointer whitespace-nowrap" onClick={() => setActiveTab('feed')}>
              <span className="bg-cyan-500 text-slate-900 px-2 py-0.5 rounded italic">F</span>
              <span className="hidden xs:inline uppercase tracking-tighter">Favela <span className="text-cyan-400">Business</span></span>
            </h1>
            <div className="relative flex-1 max-w-lg group">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Buscar talentos locais..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('premium')} className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-900 hover:scale-105 transition-transform shadow-lg">
              <i className="fa-solid fa-crown"></i> Premium
            </button>
            {currentUser ? (
              <button onClick={() => setActiveTab('profile')} className="relative group shrink-0">
                <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-cyan-400 shadow-lg overflow-hidden">
                  {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" /> : currentUser.name[0]}
                </div>
                {currentUser.isPremium && <div className="absolute -top-1 -right-1 bg-amber-500 w-3.5 h-3.5 rounded-full border-2 border-[#1e293b] flex items-center justify-center"><i className="fa-solid fa-check text-[5px] text-white"></i></div>}
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="bg-white text-slate-900 px-4 py-1.5 rounded-full font-black text-[10px] uppercase hover:bg-cyan-400 transition-all shadow-xl shrink-0">Entrar</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
            <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50"></div>
            <div className="px-6 pb-6 text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-2xl mx-auto -mt-10 border-4 border-[#1e293b] flex items-center justify-center text-4xl font-black text-cyan-500 shadow-xl overflow-hidden">
                 {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" /> : (currentUser ? currentUser.name[0] : '?')}
              </div>
              <h3 className="mt-4 font-bold text-white text-lg">{currentUser?.name || 'Visitante'}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                {currentUser?.isPremium ? '🚀 Membro Premium' : 'Acesso Gratuito'}
              </p>
            </div>
          </div>
          <ImpactStats />
        </aside>

        <section className="lg:col-span-6 space-y-6">
          {activeTab === 'feed' && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm ${
                      selectedCategory === cat 
                      ? 'bg-cyan-500 border-cyan-500 text-slate-900' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {filteredProviders.map(p => (
                  <ServiceCard key={p.id} provider={p} onOptimize={() => {}} isOptimizing={false} currentUser={currentUser} />
                ))}
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Minha Vitrine Favela Business</h2>
              <p className="text-slate-500 text-xs mb-8">Cadastre seu negócio e apareça para a comunidade.</p>
              
              <form onSubmit={handleRegisterBusiness} className="space-y-5">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition-all overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <i className="fa-solid fa-camera text-slate-600 text-2xl mb-2"></i>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Foto do Serviço</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none transition-all" placeholder="Nome do Negócio" />
                  <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none transition-all" placeholder="WhatsApp (DDD)" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none">
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                  <input required value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none transition-all" placeholder="O que você faz?" />
                </div>

                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm h-32 focus:border-cyan-500 outline-none resize-none transition-all" placeholder="Descreva seus diferenciais..." />

                <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl">
                  <input type="checkbox" id="terms" checked={formData.termsAccepted} onChange={e => setFormData({...formData, termsAccepted: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="terms" className="text-[11px]">Aceito os termos da Favela Business.</label>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 text-slate-900 py-4 rounded-xl font-black uppercase text-xs tracking-[0.1em]">
                  {isLoading ? 'Salvando...' : 'Postar Anúncio'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'premium' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-amber-500/30 p-10 text-center shadow-2xl">
               <i className="fa-solid fa-crown text-4xl text-amber-500 mb-6"></i>
               <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Favela Business Premium</h2>
               <p className="text-slate-400 text-sm mb-8">Destaque-se na sua região e conquiste mais clientes.</p>
               <button className="w-full py-5 bg-amber-500 text-slate-900 font-black rounded-xl uppercase tracking-widest text-[10px]">
                 Assinar por R$ 19,90/mês
               </button>
            </div>
          )}
        </section>

        <aside className="lg:col-span-3">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h4 className="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-widest">
              Dica Favela Business
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "Fotos de alta qualidade aumentam suas chances de contratação em até 3x!"
            </p>
          </div>
        </aside>
      </main>

      {/* Dica de exportação para o usuário */}
      <footer className="bg-slate-950/50 py-3 px-4 text-center border-t border-slate-800 hidden lg:block">
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center justify-center gap-2">
          <i className="fa-solid fa-code"></i> Para subir ao GitHub: Baixe o ZIP do projeto e siga as instruções no README.md
        </p>
      </footer>

      <nav className="fixed lg:hidden bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-md border-t border-slate-700 p-3 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-cyan-400' : 'text-slate-500'}`}>
          <i className="fa-solid fa-house-chimney text-lg"></i>
          <span className="text-[8px] font-black uppercase">Início</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-500'}`}>
          <i className="fa-solid fa-briefcase text-lg"></i>
          <span className="text-[8px] font-black uppercase">Meu Negócio</span>
        </button>
      </nav>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-3xl p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter italic text-center">Favela Business</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input required value={authFormData.name} onChange={e => setAuthFormData({...authFormData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white p-4 rounded-xl text-sm outline-none" placeholder="Seu Nome" />
              <input required type="email" value={authFormData.email} onChange={e => setAuthFormData({...authFormData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white p-4 rounded-xl text-sm outline-none" placeholder="E-mail" />
              <button type="submit" className="w-full bg-white text-slate-900 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest mt-4">Entrar</button>
              <button type="button" onClick={() => setShowAuthModal(false)} className="w-full text-slate-500 text-[10px] uppercase font-bold mt-2">Voltar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
