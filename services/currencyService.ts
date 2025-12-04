import { ExchangeRate } from '../types';

const API_URL = 'https://dolarapi.com/v1/dolares/blue';

export const fetchExchangeRate = async (): Promise<ExchangeRate> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    
    // Mapping DolarApi response to our structure
    // data usually has { compra: number, venta: number, fechaActualizacion: string, ... }
    return {
      buy: data.compra,
      sell: data.venta,
      lastUpdated: new Date().toISOString(),
      source: 'API'
    };
  } catch (error) {
    console.warn('Currency API failed, using fallback/cached data', error);
    // Fallback if API fails to ensure app usability
    return {
      buy: 1180,
      sell: 1200,
      lastUpdated: new Date().toISOString(),
      source: 'MANUAL' // Marked as manual/fallback implicitly
    };
  }
};
