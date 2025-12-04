import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, PurchaseEntry, ExchangeRate, SaleItem, SaleChannel } from '../types';
import { fetchExchangeRate } from '../services/currencyService';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  purchases: PurchaseEntry[];
  exchangeRate: ExchangeRate;
  addProduct: (product: Product) => void;
  addStock: (productId: string, quantity: number, costUSD: number) => void;
  recordSale: (items: {productId: string, quantity: number, priceARS: number}[], channel: SaleChannel, customer?: string) => void;
  refreshExchangeRate: () => Promise<void>;
  setManualExchangeRate: (rate: number) => void;
  toggleRateSource: (source: 'API' | 'MANUAL') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Data for Initial Load
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Sauvage', brand: 'Dior', description: 'Eau de Toilette 100ml', sku: 'DIO-SAU-100', currentStock: 10, avgCostUSD: 85, targetMargin: 40 },
  { id: '2', name: 'Bleu de Chanel', brand: 'Chanel', description: 'Parfum 100ml', sku: 'CHA-BLE-100', currentStock: 5, avgCostUSD: 110, targetMargin: 35 },
  { id: '3', name: 'Acqua Di Gio', brand: 'Giorgio Armani', description: 'Profondo 75ml', sku: 'ARM-ADG-75', currentStock: 12, avgCostUSD: 70, targetMargin: 50 },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<PurchaseEntry[]>(() => {
    const saved = localStorage.getItem('purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    buy: 0,
    sell: 0,
    lastUpdated: new Date().toISOString(),
    source: 'API'
  });

  // Persist to LocalStorage
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('purchases', JSON.stringify(purchases)); }, [purchases]);

  // Initial Rate Fetch
  useEffect(() => {
    if (exchangeRate.source === 'API') {
      refreshExchangeRate();
    }
  }, []);

  const refreshExchangeRate = async () => {
    if (exchangeRate.source === 'MANUAL') return;
    const rate = await fetchExchangeRate();
    setExchangeRate(rate);
  };

  const setManualExchangeRate = (val: number) => {
    setExchangeRate(prev => ({
      ...prev,
      sell: val,
      buy: val * 0.95, // Approximate spread
      lastUpdated: new Date().toISOString(),
      source: 'MANUAL'
    }));
  };

  const toggleRateSource = (source: 'API' | 'MANUAL') => {
    setExchangeRate(prev => ({ ...prev, source }));
    if (source === 'API') refreshExchangeRate();
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const addStock = (productId: string, quantity: number, costUSD: number) => {
    const newPurchase: PurchaseEntry = {
      id: crypto.randomUUID(),
      productId,
      date: new Date().toISOString(),
      quantity,
      costPerUnitUSD: costUSD,
      exchangeRateUsed: exchangeRate.sell
    };

    setPurchases(prev => [...prev, newPurchase]);

    // Recalculate Weighted Average Cost and Stock
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      
      const totalOldValue = p.currentStock * p.avgCostUSD;
      const newStockValue = quantity * costUSD;
      const newTotalStock = p.currentStock + quantity;
      const newAvgCost = newTotalStock > 0 ? (totalOldValue + newStockValue) / newTotalStock : costUSD;

      return {
        ...p,
        currentStock: newTotalStock,
        avgCostUSD: newAvgCost
      };
    }));
  };

  const recordSale = (cartItems: {productId: string, quantity: number, priceARS: number}[], channel: SaleChannel, customer?: string) => {
    const saleItems: SaleItem[] = [];
    let totalARS = 0;
    let totalUSD = 0;

    // Update stock and build sale items
    const updatedProducts = products.map(p => {
      const cartItem = cartItems.find(c => c.productId === p.id);
      if (!cartItem) return p;

      // Logic to prevent negative stock could go here, but allowing for now with warning in UI
      const soldQty = cartItem.quantity;
      
      saleItems.push({
        productId: p.id,
        productName: p.name,
        quantity: soldQty,
        unitPriceARS: cartItem.priceARS,
        unitCostAtSaleUSD: p.avgCostUSD
      });

      totalARS += cartItem.priceARS * soldQty;
      // Effective USD received based on current replacement cost logic or just conversion
      totalUSD += (cartItem.priceARS * soldQty) / exchangeRate.sell; 

      return {
        ...p,
        currentStock: p.currentStock - soldQty
      };
    });

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: saleItems,
      totalTotalARS: totalARS,
      totalTotalUSD: totalUSD,
      exchangeRateUsed: exchangeRate.sell,
      channel,
      customerName: customer
    };

    setProducts(updatedProducts);
    setSales(prev => [...prev, newSale]);
  };

  return (
    <StoreContext.Provider value={{
      products,
      sales,
      purchases,
      exchangeRate,
      addProduct,
      addStock,
      recordSale,
      refreshExchangeRate,
      setManualExchangeRate,
      toggleRateSource
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
