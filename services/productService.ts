import { supabase } from './supabaseClient';
import { mapDbProductToUi, mapUiProductToDb } from './mappers';
import { Product, PurchaseEntry, Sale, SaleItem } from '../types';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return (data ?? []).map(mapDbProductToUi);
}

export async function addProductToDb(product: Product): Promise<Product> {
  const productDb = mapUiProductToDb(product);
  const { data, error } = await supabase
    .from('products')
    .insert([productDb])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  
  return mapDbProductToUi(data);
}

export async function updateProductInDb(productId: string, updates: Partial<Product>): Promise<Product> {
  const product = await fetchProducts();
  const existing = product.find(p => p.id === productId);
  if (!existing) throw new Error('Product not found');
  
  const updated = { ...existing, ...updates };
  const productDb = mapUiProductToDb(updated);
  
  const { data, error } = await supabase
    .from('products')
    .update(productDb)
    .eq('id', productId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  return mapDbProductToUi(data);
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function addPurchaseToDb(purchase: PurchaseEntry): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .insert([{
      id: purchase.id,
      product_id: purchase.productId,
      date: purchase.date,
      quantity: purchase.quantity,
      cost_per_unit_usd: purchase.costPerUnitUSD,
      cost_currency: purchase.costCurrency,
      cost_value: purchase.costValue,
      exchange_rate_used: purchase.exchangeRateUsed,
    }]);
  
  if (error) {
    console.error('Error adding purchase:', error);
    throw error;
  }
}

export async function updateProductStock(productId: string, updates: { current_stock: number; avg_cost_usd: number; cost_value: number }): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId);
  
  if (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
}

export async function addSaleToDb(sale: Sale): Promise<void> {
  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert([{
      id: sale.id,
      date: sale.date,
      total_ars: sale.totalTotalARS,
      total_usd: sale.totalTotalUSD,
      exchange_rate_used: sale.exchangeRateUsed,
      channel: sale.channel,
      customer_name: sale.customerName ?? null,
    }])
    .select()
    .single();
  
  if (saleError) {
    console.error('Error adding sale:', saleError);
    throw saleError;
  }
  
  const saleItems = sale.items.map(item => ({
    id: crypto.randomUUID(),
    sale_id: sale.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price_ars: item.unitPriceARS,
    unit_cost_at_sale_usd: item.unitCostAtSaleUSD,
  }));
  
  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems);
  
  if (itemsError) {
    console.error('Error adding sale items:', itemsError);
    throw itemsError;
  }
}

export async function fetchSales(): Promise<Sale[]> {
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });
  
  if (salesError) {
    console.error('Error fetching sales:', salesError);
    throw salesError;
  }
  
  const { data: itemsData, error: itemsError } = await supabase
    .from('sale_items')
    .select('*');
  
  if (itemsError) {
    console.error('Error fetching sale items:', itemsError);
    throw itemsError;
  }
  
  return (salesData ?? []).map(sale => ({
    id: sale.id,
    date: sale.date,
    items: (itemsData ?? [])
      .filter(item => item.sale_id === sale.id)
      .map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPriceARS: item.unit_price_ars,
        unitCostAtSaleUSD: item.unit_cost_at_sale_usd,
      })),
    totalTotalARS: sale.total_ars,
    totalTotalUSD: sale.total_usd,
    exchangeRateUsed: sale.exchange_rate_used,
    channel: sale.channel as any,
    customerName: sale.customer_name ?? undefined,
  }));
}

export async function fetchPurchases(): Promise<PurchaseEntry[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
  
  return (data ?? []).map(p => ({
    id: p.id,
    productId: p.product_id,
    date: p.date,
    quantity: p.quantity,
    costPerUnitUSD: p.cost_per_unit_usd,
    costCurrency: p.cost_currency,
    costValue: p.cost_value,
    exchangeRateUsed: p.exchange_rate_used,
  }));
}