import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { mode, payload } = req.body || {};

  try {
    if (mode === 'optimize') {
      const { service } = payload || {};
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um especialista em marketing para empreendedores de comunidades. \nOtimize a seguinte descrição de serviço para torná-la profissional, atraente e vendedora, mantendo a essência e autenticidade do prestador. \nNome: ${service?.name}\nServiço: ${service?.serviceType}\nDescrição original: ${service?.description}`,
        config: {
          systemInstruction: "Seja persuasivo, mas direto. Use emojis de forma profissional. Responda apenas com a nova descrição.",
          temperature: 0.8,
        }
      });

      return res.status(200).json({ text: response.text || 'Erro ao otimizar descrição.' });
    }

    if (mode === 'tips') {
      const { serviceType } = payload || {};
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Forneça 3 dicas práticas de crescimento para um pequeno negócio de "${serviceType}" operando em uma comunidade (favela).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                advice: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ['title', 'advice', 'icon']
            }
          }
        }
      });

      return res.status(200).json({ items: JSON.parse(response.text || '[]') });
    }

    if (mode === 'search') {
      const { lat, lng } = payload || {};
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Quais são as principais notícias, eventos ou oportunidades de negócios e editais para empreendedores na região das coordenadas ${lat}, ${lng} no Brasil hoje?`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk) => ({
        title: chunk.web?.title,
        uri: chunk.web?.uri
      })) || [];

      return res.status(200).json({ text: response.text, sources });
    }

    return res.status(400).json({ error: 'Unknown mode' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
