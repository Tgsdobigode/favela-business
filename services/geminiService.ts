
import { GoogleGenAI, Type } from "@google/genai";
import { ServiceProvider } from "../types";

// Always initialize with process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const optimizeServiceDescription = async (service: Partial<ServiceProvider>): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um especialista em marketing para empreendedores de comunidades. 
      Otimize a seguinte descrição de serviço para torná-la profissional, atraente e vendedora, 
      mantendo a essência e autenticidade do prestador. 
      Nome: ${service.name}
      Serviço: ${service.serviceType}
      Descrição original: ${service.description}`,
      config: {
        systemInstruction: "Seja persuasivo, mas direto. Use emojis de forma profissional. Responda apenas com a nova descrição.",
        temperature: 0.8,
      }
    });
    // Access the .text property directly
    return response.text || "Erro ao otimizar descrição.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Houve um problema ao conectar com o consultor de IA.";
  }
};

export const getBusinessTips = async (serviceType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Forneça 3 dicas práticas de crescimento para um pequeno negócio de "${serviceType}" operando em uma comunidade (favela).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              advice: { type: Type.STRING },
              icon: { type: Type.STRING, description: "Nome de uma classe FontAwesome icon, ex: 'fa-rocket'" }
            },
            required: ["title", "advice", "icon"]
          }
        }
      }
    });
    // response.text returns the extracted string
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Tips Error:", error);
    return [];
  }
};

export const searchLocalOpportunities = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quais são as principais notícias, eventos ou oportunidades de negócios e editais para empreendedores na região das coordenadas ${lat}, ${lng} no Brasil hoje?`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    const text = response.text;
    // Extract website URLs from groundingChunks as required by guidelines
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })) || [];

    return { text, sources };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Não foi possível buscar oportunidades no momento.", sources: [] };
  }
};
