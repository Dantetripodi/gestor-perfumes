import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Sauvage', brand: 'Dior', description: 'Eau de Toilette 100ml', sku: 'DIO-SAU-100', currentStock: 10, avgCostUSD: 85, targetMargin: 40 },
  { id: '2', name: 'Bleu de Chanel', brand: 'Chanel', description: 'Parfum 100ml', sku: 'CHA-BLE-100', currentStock: 5, avgCostUSD: 110, targetMargin: 35 },
  { id: '3', name: 'Acqua Di Gio', brand: 'Giorgio Armani', description: 'Profondo 75ml', sku: 'ARM-ADG-75', currentStock: 12, avgCostUSD: 70, targetMargin: 50 },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      return INITIAL_PRODUCTS;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('sales');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading sales from localStorage:', error);
      return [];
    }
  });

  const [purchases, setPurchases] = useState<PurchaseEntry[]>(() => {
    try {
      const saved = localStorage.getItem('purchases');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading purchases from localStorage:', error);
      return [];
    }
  });

  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    buy: 0,
    sell: 0,
    lastUpdated: new Date().toISOString(),
    source: 'API'
  });

  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('sales', JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales to localStorage:', error);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('purchases', JSON.stringify(purchases));
    } catch (error) {
      console.error('Error saving purchases to localStorage:', error);
    }
  }, [purchases]);

  const refreshExchangeRate = useCallback(async () => {
    try {
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate(prev => ({
        ...prev,
        buy: prev.buy || 1180,
        sell: prev.sell || 1200,
        lastUpdated: new Date().toISOString(),
        source: 'MANUAL'
      }));
    }
  }, []);

  useEffect(() => {
    refreshExchangeRate();
  }, [refreshExchangeRate]);

  const setManualExchangeRate = (val: number) => {
    setExchangeRate(prev => ({
      ...prev,
      sell: val,
      buy: val * 0.95,
      lastUpdated: new Date().toISOString(),
      source: 'MANUAL'
    }));
  };

  const toggleRateSource = (source: 'API' | 'MANUAL') => {
    setExchangeRate(prev => ({ ...prev, source }));
    if (source === 'API') {
      refreshExchangeRate();
    }
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
      exchangeRateUsed: exchangeRate.sell || 1200
    };

    setPurchases(prev => [...prev, newPurchase]);

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
    const currentRate = exchangeRate.sell || 1200;

    const updatedProducts = products.map(p => {
      const cartItem = cartItems.find(c => c.productId === p.id);
      if (!cartItem) return p;

      const soldQty = cartItem.quantity;
      
      saleItems.push({
        productId: p.id,
        productName: p.name,
        quantity: soldQty,
        unitPriceARS: cartItem.priceARS,
        unitCostAtSaleUSD: p.avgCostUSD
      });

      totalARS += cartItem.priceARS * soldQty;
      totalUSD += (cartItem.priceARS * soldQty) / currentRate;

      return {
        ...p,
        currentStock: Math.max(0, p.currentStock - soldQty)
      };
    });

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: saleItems,
      totalTotalARS: totalARS,
      totalTotalUSD: totalUSD,
      exchangeRateUsed: currentRate,
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