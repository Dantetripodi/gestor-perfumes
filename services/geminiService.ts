import { GoogleGenAI } from "@google/genai";
import { Sale, Product, ExchangeRate } from "../types";

const getSystemInstruction = () => `
You are an expert Business Analyst for a Perfume Resale business in Argentina.
The economy involves high inflation and dual currency (USD/ARS).
Your goal is to analyze sales data and inventory to provide actionable advice.
Focus on:
1. Identifying best selling brands.
2. Alerting on low margin products if exchange rate volatility is high.
3. Suggesting restock strategies.
Keep responses concise, professional, and formatted in Markdown.
`;

export const generateBusinessInsight = async (
  sales: Sale[],
  products: Product[],
  rate: ExchangeRate
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Summarize data to avoid token limits
  const salesSummary = sales.slice(-50).map(s => ({
    date: s.date.split('T')[0],
    totalARS: s.totalTotalARS,
    rate: s.exchangeRateUsed,
    items: s.items.map(i => i.productName).join(', ')
  }));

  const productSummary = products.map(p => ({
    name: p.name,
    stock: p.currentStock,
    costUSD: p.avgCostUSD
  }));

  const prompt = `
    Current USD Exchange Rate (Sell): $${rate.sell} ARS.
    
    Product Inventory Summary:
    ${JSON.stringify(productSummary)}

    Recent Sales Summary (Last 50):
    ${JSON.stringify(salesSummary)}

    Please analyze the performance and give 3 key recommendations for the business owner.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
      }
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this moment. Please try again later.";
  }
};
