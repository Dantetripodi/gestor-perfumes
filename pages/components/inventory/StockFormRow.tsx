import React from 'react';
import { Product, Currency } from '../../../types';
import { X, Check } from 'lucide-react';

interface StockFormRowProps {
  product: Product;
  stockEntry: {
    quantity: number;
    costValue: number;
    costCurrency: Currency;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: keyof StockFormRowProps['stockEntry'], value: any) => void;
  exchangeRate: number;
}

export const StockFormRow: React.FC<StockFormRowProps> = ({
  product,
  stockEntry,
  onSubmit,
  onCancel,
  onChange,
  exchangeRate,
}) => {
  const getEquivalent = () => {
    if (stockEntry.costValue === 0) return null;
    if (stockEntry.costCurrency === Currency.USD) {
      const ars = stockEntry.costValue * (exchangeRate || 1200);
      return `≈ $${ars.toFixed(2)} ARS`;
    } else {
      const usd = stockEntry.costValue / (exchangeRate || 1200);
      return `≈ $${usd.toFixed(2)} USD`;
    }
  };

  return (
    <tr className="bg-amber-50 border-b border-amber-200">
      <td colSpan={6} className="px-6 py-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">Reponer stock: {product.name}</h4>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-xs inline-flex items-center gap-1 transition-colors"
              >
                <Check size={14} /> Confirmar
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
              >
                <X size={14} /> Cancelar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
                Cantidad
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                value={stockEntry.quantity}
                onChange={(e) => onChange('quantity', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
                Moneda
              </label>
              <select
                className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                value={stockEntry.costCurrency}
                onChange={(e) => onChange('costCurrency', e.target.value as Currency)}
              >
                <option value={Currency.USD}>USD</option>
                <option value={Currency.ARS}>ARS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
                Costo unitario
              </label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  className="w-full border border-slate-200 rounded p-2 pl-6 text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  value={stockEntry.costValue}
                  onChange={(e) => onChange('costValue', Number(e.target.value))}
                />
              </div>
              {stockEntry.costValue > 0 && (
                <div className="mt-1 text-xs text-slate-500">
                  {getEquivalent()}
                </div>
              )}
            </div>
          </div>
        </form>
      </td>
    </tr>
  );
};