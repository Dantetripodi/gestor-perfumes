import React from 'react';
import { Product, Currency } from '../../../types';

interface StockFormModalProps {
  isOpen: boolean;
  product: Product | null;
  stockEntry: {
    quantity: number;
    costValue: number;
    costCurrency: Currency;
  };
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onChange: (field: keyof StockFormModalProps['stockEntry'], value: any) => void;
  exchangeRate: number;
}

export const StockFormModal: React.FC<StockFormModalProps> = ({
  isOpen,
  product,
  stockEntry,
  onSubmit,
  onClose,
  onChange,
  exchangeRate,
}) => {
  if (!isOpen || !product) return null;

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Reponer inventario
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Actualizar niveles para{' '}
          <span className="font-bold text-slate-800">{product.name}</span>
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Cantidad a agregar
            </label>
            <input
              type="number"
              required
              min="1"
              className="w-full border border-slate-200 rounded-lg p-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={stockEntry.quantity}
              onChange={(e) => onChange('quantity', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Moneda
            </label>
            <select
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none mb-3"
              value={stockEntry.costCurrency}
              onChange={(e) => onChange('costCurrency', e.target.value as Currency)}
            >
              <option value={Currency.USD}>USD</option>
              <option value={Currency.ARS}>ARS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Costo unitario
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">$</span>
              <input
                type="number"
                required
                step="0.01"
                className="w-full border border-slate-200 rounded-lg p-3 pl-6 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                value={stockEntry.costValue}
                onChange={(e) => onChange('costValue', Number(e.target.value))}
              />
            </div>
            {stockEntry.costValue > 0 && (
              <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Equivalente:</div>
                <div className="font-medium text-slate-700">{getEquivalent()}</div>
              </div>
            )}
            <p className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
              <span className="font-bold">Nota:</span> Esto actualizará el costo
              promedio ponderado de tu inventario.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              Confirmar stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};