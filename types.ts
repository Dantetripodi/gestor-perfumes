export enum Currency {
  USD = 'USD',
  ARS = 'ARS',
}

export enum SaleChannel {
  ONLINE = 'Online',
  STORE = 'Store',
  WHATSAPP = 'WhatsApp',
  OTHER = 'Other'
}

export interface ExchangeRate {
  buy: number;
  sell: number;
  lastUpdated: string; // ISO Date
  source: 'API' | 'MANUAL';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  sku: string;
  currentStock: number;
  avgCostUSD: number; // Weighted average cost in USD
  targetMargin: number; // Percentage (e.g., 30 for 30%)
  imageUrl?: string;
}

export interface PurchaseEntry {
  id: string;
  productId: string;
  date: string; // ISO Date
  quantity: number;
  costPerUnitUSD: number;
  exchangeRateUsed: number; // ARS/USD at moment of purchase
}

export interface Sale {
  id: string;
  date: string; // ISO Date
  items: SaleItem[];
  totalTotalARS: number;
  totalTotalUSD: number; // Calculated at moment of sale
  exchangeRateUsed: number;
  channel: SaleChannel;
  customerName?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceARS: number;
  unitCostAtSaleUSD: number; // Snapshot of cost
}

export interface BusinessMetrics {
  totalRevenueARS: number;
  netProfitARS: number;
  totalStockValueUSD: number;
  roi: number;
}
