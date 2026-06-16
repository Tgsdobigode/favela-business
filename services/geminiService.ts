
import { ServiceProvider } from "../types";

const apiPost = async (mode: string, payload: any) => {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, payload })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }
  return res.json();
};

export const optimizeServiceDescription = async (service: Partial<ServiceProvider>): Promise<string> => {
  try {
    const data = await apiPost('optimize', { service });
    return data.text || 'Erro ao otimizar descrição.';
  } catch (error) {
    console.error('Optimize Error:', error);
    return 'Houve um problema ao conectar com o consultor de IA.';
  }
};

export const getBusinessTips = async (serviceType: string) => {
  try {
    const data = await apiPost('tips', { serviceType });
    return data.items || [];
  } catch (error) {
    console.error('Tips Error:', error);
    return [];
  }
};

export const searchLocalOpportunities = async (lat: number, lng: number) => {
  try {
    const data = await apiPost('search', { lat, lng });
    return { text: data.text, sources: data.sources || [] };
  } catch (error) {
    console.error('Search Error:', error);
    return { text: 'Não foi possível buscar oportunidades no momento.', sources: [] };
  }
};
