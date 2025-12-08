import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, Sale, PurchaseEntry, ExchangeRate, SaleItem, SaleChannel, Currency } from '../types';
import { fetchExchangeRate } from '../services/currencyService';
import {
  fetchProducts,
  addProductToDb,
  updateProductInDb,
  deleteProductFromDb,
  addPurchaseToDb,
  updateProductStock,
  addSaleToDb,
  fetchSales,
  fetchPurchases,
} from '../services/productService';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  purchases: PurchaseEntry[];
  exchangeRate: ExchangeRate;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addStock: (productId: string, quantity: number, costValue: number, costCurrency: Currency) => Promise<void>;
  recordSale: (items: {productId: string, quantity: number, priceARS: number}[], channel: SaleChannel, customer?: string) => Promise<void>;
  refreshExchangeRate: () => Promise<void>;
  setManualExchangeRate: (rate: number) => void;
  toggleRateSource: (source: 'API' | 'MANUAL') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const convertToUSD = (value: number, currency: Currency, exchangeRate: number): number => {
  if (currency === Currency.USD) return value;
  return value / exchangeRate;
};

const convertFromUSD = (valueUSD: number, currency: Currency, exchangeRate: number): number => {
  if (currency === Currency.USD) return valueUSD;
  return valueUSD * exchangeRate;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    buy: 0,
    sell: 0,
    lastUpdated: new Date().toISOString(),
    source: 'API'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, salesData, purchasesData] = await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchPurchases(),
        ]);
        setProducts(productsData);
        setSales(salesData);
        setPurchases(purchasesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (exchangeRate.sell > 0) {
      setProducts(prev => prev.map(p => {
        const costInUSD = convertToUSD(p.costValue, p.costCurrency, exchangeRate.sell);
        return {
          ...p,
          avgCostUSD: costInUSD,
        };
      }));
    }
  }, [exchangeRate.sell]);

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

  const addProduct = async (product: Product) => {
    try {
      const costInUSD = convertToUSD(product.costValue, product.costCurrency, exchangeRate.sell || 1200);
      const productWithUSD: Product = {
        ...product,
        avgCostUSD: costInUSD,
      };
      const savedProduct = await addProductToDb(productWithUSD);
      setProducts(prev => [...prev, savedProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const existing = products.find(p => p.id === productId);
      if (!existing) return;
      
      const updated = { ...existing, ...updates };
      
      if (updates.costValue !== undefined || updates.costCurrency !== undefined) {
        const newCostValue = updates.costValue ?? existing.costValue;
        const newCostCurrency = updates.costCurrency ?? existing.costCurrency;
        const costInUSD = convertToUSD(newCostValue, newCostCurrency, exchangeRate.sell || 1200);
        updated.avgCostUSD = costInUSD;
        updated.costValue = newCostValue;
        updated.costCurrency = newCostCurrency;
      }
      
      const savedProduct = await updateProductInDb(productId, updated);
      setProducts(prev => prev.map(p => p.id === productId ? savedProduct : p));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteProductFromDb(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setPurchases(prev => prev.filter(p => p.productId !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addStock = async (productId: string, quantity: number, costValue: number, costCurrency: Currency) => {
    try {
      const costInUSD = convertToUSD(costValue, costCurrency, exchangeRate.sell || 1200);
      
      const newPurchase: PurchaseEntry = {
        id: crypto.randomUUID(),
        productId,
        date: new Date().toISOString(),
        quantity,
        costPerUnitUSD: costInUSD,
        costCurrency,
        costValue,
        exchangeRateUsed: exchangeRate.sell || 1200
      };

      await addPurchaseToDb(newPurchase);
      setPurchases(prev => [...prev, newPurchase]);

      const product = products.find(p => p.id === productId);
      if (!product) return;

      const totalOldValue = product.currentStock * product.avgCostUSD;
      const newStockValue = quantity * costInUSD;
      const newTotalStock = product.currentStock + quantity;
      const newAvgCostUSD = newTotalStock > 0 ? (totalOldValue + newStockValue) / newTotalStock : costInUSD;

      const newCostValue = product.costCurrency === costCurrency
        ? ((product.costValue * product.currentStock) + (costValue * quantity)) / newTotalStock
        : convertFromUSD(newAvgCostUSD, product.costCurrency, exchangeRate.sell || 1200);

      await updateProductStock(productId, {
        current_stock: newTotalStock,
        avg_cost_usd: newAvgCostUSD,
        cost_value: newCostValue,
      });

      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          currentStock: newTotalStock,
          avgCostUSD: newAvgCostUSD,
          costValue: newCostValue,
        };
      }));
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  };

  const recordSale = async (cartItems: {productId: string, quantity: number, priceARS: number}[], channel: SaleChannel, customer?: string) => {
    try {
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

      await addSaleToDb(newSale);
      
      for (const item of saleItems) {
        const product = updatedProducts.find(p => p.id === item.productId);
        if (product) {
          await updateProductStock(item.productId, {
            current_stock: product.currentStock,
            avg_cost_usd: product.avgCostUSD,
            cost_value: product.costValue,
          });
        }
      }

      setProducts(updatedProducts);
      setSales(prev => [...prev, newSale]);
    } catch (error) {
      console.error('Error recording sale:', error);
      throw error;
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      sales,
      purchases,
      exchangeRate,
      addProduct,
      updateProduct,
      deleteProduct,
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