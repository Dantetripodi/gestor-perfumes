import { Currency, ProductLine } from '../types';
import { Product } from '../types';

export const DEFAULT_PRODUCT: Partial<Product> = {
  name: '',
  brand: '',
  description: '',
  sku: '',
  currentStock: 0,
  avgCostUSD: 0,
  costCurrency: Currency.USD,
  costValue: 0,
  targetMargin: 30,
  line: 'DUP' as ProductLine,
  category: undefined,
  size_ml: undefined,
  variant: undefined,
};

export const PRODUCT_LINES: { value: ProductLine; label: string }[] = [
  { value: 'DUP', label: 'DUP' },
  { value: 'ARABIC', label: 'ARABIC' },
  { value: 'DUP_MINI', label: 'DUP_MINI' },
  { value: 'ARABIC_OTHER', label: 'ARABIC_OTHER' },
];