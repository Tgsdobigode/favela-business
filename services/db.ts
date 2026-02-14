
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ServiceProvider, User } from "../types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SESSION_KEY = 'fb_session';
const LOCAL_STORAGE_KEY = 'fb_providers_local';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "") {
    try {
      _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("✅ Conectado ao Supabase com sucesso!");
      return _supabase;
    } catch (e) {
      console.warn("⚠️ Falha ao inicializar Supabase, usando modo local.");
      return null;
    }
  }
  console.warn("ℹ️ Supabase não configurado. Rodando em modo Local Storage.");
  return null;
}

const localDB = {
  getProviders: (): ServiceProvider[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveProvider: (provider: ServiceProvider) => {
    const providers = localDB.getProviders();
    const index = providers.findIndex(p => p.id === provider.id);
    if (index > -1) providers[index] = provider;
    else providers.unshift(provider);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(providers));
  }
};

export const db = {
  async uploadImage(file: File): Promise<string | null> {
    const client = getSupabase();
    if (!client) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await client.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        return null;
      }

      const { data } = client.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Storage Error:", error);
      return null;
    }
  },

  async getProviders(): Promise<ServiceProvider[]> {
    const client = getSupabase();
    if (!client) return localDB.getProviders();

    try {
      const { data, error } = await client
        .from('providers')
        .select('*')
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fix: Ensure the mapped object properties match the ServiceProvider interface (serviceType instead of service_type)
      return (data || []).map(item => ({
        id: item.id,
        ownerId: item.owner_id,
        name: item.name,
        serviceType: item.service_type,
        description: item.description,
        optimizedDescription: item.optimized_description,
        contact: item.contact,
        category: item.category,
        location: item.location,
        createdAt: Number(item.created_at),
        isPremium: !!item.is_premium,
        imageUrl: item.image_url
      }));
    } catch (e) {
      console.error("Fetch Providers Error:", e);
      return localDB.getProviders();
    }
  },

  async saveProvider(provider: ServiceProvider): Promise<void> {
    const client = getSupabase();
    if (!client) {
      localDB.saveProvider(provider);
      return;
    }

    const { error } = await client
      .from('providers')
      .upsert({
        id: provider.id,
        owner_id: provider.ownerId,
        name: provider.name,
        service_type: provider.serviceType,
        description: provider.description,
        optimized_description: provider.optimizedDescription,
        contact: provider.contact,
        category: provider.category,
        location: provider.location,
        created_at: provider.createdAt,
        is_premium: provider.isPremium,
        image_url: provider.imageUrl
      });

    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    const localUser = JSON.parse(session);
    const client = getSupabase();
    if (!client) return localUser;

    try {
      const { data, error } = await client.from('profiles').select('*').eq('id', localUser.id).single();
      if (error || !data) return localUser;
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        isPremium: !!data.is_premium,
        termsAccepted: !!data.terms_accepted
      };
    } catch (e) {
      return localUser;
    }
  },

  async login(email: string, name: string): Promise<User> {
    const id = btoa(email).substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
    const user: User = { 
      id, 
      email, 
      name, 
      isPremium: false, 
      termsAccepted: true 
    };
    
    const client = getSupabase();
    if (client) {
      try {
        await client.from('profiles').upsert({ 
          id, 
          email, 
          name, 
          is_premium: user.isPremium, 
          terms_accepted: user.termsAccepted 
        }, { onConflict: 'id' });
      } catch (e) {
        console.error("Login DB Error:", e);
      }
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  }
};

