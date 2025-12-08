import React from 'react';
import { Product, Currency } from '../../../types';
import { Edit2, ArrowDown, Trash2 } from 'lucide-react';

interface ProductRowProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAddStock: (productId: string) => void;
  convertToUSD: (value: number, currency: Currency) => number;
  convertFromUSD: (valueUSD: number, currency: Currency) => number;
}

export const ProductRow: React.FC<ProductRowProps> = ({
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
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="font-bold text-slate-900">{product.name}</div>
        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
          {product.brand}
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-slate-500 text-xs">
        {product.sku}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="font-medium text-slate-700">
          ${product.costValue.toFixed(2)} {product.costCurrency}
        </div>
        <div className="text-xs text-slate-400">
          ≈ ${costInOtherCurrency.toFixed(2)}{' '}
          {product.costCurrency === Currency.USD ? 'ARS' : 'USD'}
        </div>
      </td>
      <td className="px-6 py-4 text-right text-slate-600">
        {product.targetMargin}%
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.currentStock < 5
              ? 'bg-red-50 text-red-700 border border-red-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}
        >
          {product.currentStock} Unidades
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product.id)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
            title="Editar producto"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onAddStock(product.id)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
            title="Reponer stock"
          >
            <ArrowDown size={14} /> Stock
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
            title="Eliminar producto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};