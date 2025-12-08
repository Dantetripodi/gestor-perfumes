export enum Currency {
  USD = 'USD',
  ARS = 'ARS',
}

export type ProductLine = 'DUP' | 'ARABIC' | 'DUP_MINI' | 'ARABIC_OTHER';


export enum SaleChannel {
  ONLINE = 'Online',
  STORE = 'Local',
  WHATSAPP = 'WhatsApp',
  OTHER = 'Otro',
}

export interface ExchangeRate {
  buy: number;
  sell: number;
  lastUpdated: string;
  source: 'API' | 'MANUAL';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  sku: string;
  currentStock: number;
  avgCostUSD: number;
  costCurrency: Currency; // USD | ARS
  costValue: number;
  targetMargin: number;
  imageUrl?: string;
  line: ProductLine;
  category?: string;   // opcional
  size_ml?: number;    // opcional
  variant?: string;    // opcional (edp/edt/oil)
}

export interface PurchaseEntry {
  id: string;
  productId: string;
  date: string;
  quantity: number;
  costPerUnitUSD: number;
  costCurrency: Currency;
  costValue: number;
  exchangeRateUsed: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalTotalARS: number;
  totalTotalUSD: number;
  exchangeRateUsed: number;
  channel: SaleChannel;
  customerName?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceARS: number;
  unitCostAtSaleUSD: number;
}

export interface BusinessMetrics {
  totalRevenueARS: number;
  netProfitARS: number;
  totalStockValueUSD: number;
  roi: number;
}