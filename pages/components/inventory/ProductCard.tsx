import React from 'react';
import { Product, Currency } from '../../../types';
import { Edit2, ArrowDown, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAddStock: (productId: string) => void;
  convertToUSD: (value: number, currency: Currency) => number;
  convertFromUSD: (valueUSD: number, currency: Currency) => number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onAddStock,
  convertToUSD,
  convertFromUSD,
}) => {
  const costInOtherCurrency =
    product.costCurrency === Currency.USD
      ? convertFromUSD(product.avgCostUSD, Currency.ARS)
      : convertToUSD(product.costValue, Currency.USD);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {product.brand}
            </span>
            {product.currentStock < 3 && (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </div>
          <h3 className="font-bold text-slate-800">{product.name}</h3>
          <div className="text-xs text-slate-500 mt-1 flex gap-3">
            <span>
              ${product.costValue.toFixed(0)} {product.costCurrency}
              <span className="text-slate-300 mx-1">|</span>≈ $
              {costInOtherCurrency.toFixed(0)}{' '}
              {product.costCurrency === Currency.USD ? 'ARS' : 'USD'}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Stock:{' '}
              <b
                className={
                  product.currentStock === 0 ? 'text-red-500' : 'text-slate-700'
                }
              >
                {product.currentStock}
              </b>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onEdit(product.id)}
          className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onAddStock(product.id)}
          className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          <ArrowDown size={16} />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};