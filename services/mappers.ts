import { Product } from "@/types";

export const mapDbProductToUi = (p: any): Product => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    description: p.description,
    sku: p.sku,
    currentStock: p.current_stock,
    avgCostUSD: Number(p.avg_cost_usd ?? 0),
    costCurrency: p.cost_currency,
    costValue: Number(p.cost_value ?? 0),
    targetMargin: Number(p.target_margin ?? 0),
    imageUrl: p.image_url || undefined,
    line: p.line,
    category: p.category || undefined,
    size_ml: p.size_ml ?? undefined,
    variant: p.variant || undefined,
  });
  
  export const mapUiProductToDb = (p: Product) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    description: p.description,
    sku: p.sku,
    current_stock: p.currentStock,
    avg_cost_usd: p.avgCostUSD,
    cost_currency: p.costCurrency,
    cost_value: p.costValue,
    target_margin: p.targetMargin,
    image_url: p.imageUrl ?? null,
    line: p.line,
    category: p.category ?? null,
    size_ml: p.size_ml ?? null,
    variant: p.variant ?? null,
  });