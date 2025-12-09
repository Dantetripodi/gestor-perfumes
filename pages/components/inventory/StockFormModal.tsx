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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-2 md:p-4">
      <style>{`
        @media (min-width: 768px) {
          .stock-modal-container {
            max-height: none !important;
            overflow: visible !important;
          }
          .stock-modal-content {
            overflow: visible !important;
            max-height: none !important;
          }
        }
      `}</style>
      <div className="stock-modal-container bg-white rounded-lg shadow-2xl max-w-md w-full my-4 md:my-0 max-h-[calc(100vh-2rem)] md:max-h-none flex flex-col">
        <div className="flex-shrink-0 px-3 md:px-4 pt-2 md:pt-1.5 pb-1.5 md:pb-1 border-b border-slate-200">
          <h3 className="text-sm md:text-sm font-bold text-slate-900 mb-1 md:mb-0.5 leading-tight">
            Reponer inventario
          </h3>
          <p className="text-xs md:text-[10px] text-slate-500">
            Actualizar niveles para{' '}
            <span className="font-bold text-slate-800">{product.name}</span>
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="stock-modal-content px-3 md:px-4 py-2 md:py-1.5 overflow-y-auto md:overflow-visible space-y-2 md:space-y-1">
            <div>
              <label className="block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
                Cantidad a agregar
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full border border-slate-200 rounded p-2 md:p-1 text-base md:text-sm font-bold text-slate-800 focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                value={stockEntry.quantity}
                onChange={(e) => onChange('quantity', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
                Moneda
              </label>
              <select
                className="w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                value={stockEntry.costCurrency}
                onChange={(e) => onChange('costCurrency', e.target.value as Currency)}
              >
                <option value={Currency.USD}>USD</option>
                <option value={Currency.ARS}>ARS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
                Costo unitario
              </label>
              <div className="relative">
                <span className="absolute left-2 top-2 md:top-1 text-slate-400 text-sm md:text-xs">$</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  className="w-full border border-slate-200 rounded p-2 md:p-1 pl-6 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  value={stockEntry.costValue}
                  onChange={(e) => onChange('costValue', Number(e.target.value))}
                />
              </div>
              {stockEntry.costValue > 0 && (
                <div className="mt-1.5 md:mt-1 bg-slate-50 p-1.5 md:p-1 rounded border border-slate-200">
                  <div className="text-xs md:text-[9px] text-slate-500">Equivalente: <span className="font-medium text-slate-700">{getEquivalent()}</span></div>
                </div>
              )}
              <p className="text-[11px] md:text-[9px] text-amber-600 mt-1.5 md:mt-1 font-medium bg-amber-50 p-1.5 md:p-1 rounded border border-amber-100">
                <span className="font-bold">Nota:</span> Esto actualizará el costo promedio ponderado.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-end gap-2 px-3 md:px-4 py-1.5 md:py-1.5 border-t border-slate-200 bg-slate-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 md:px-3 md:py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 md:px-3 md:py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-bold shadow-lg shadow-amber-500/20 transition-all text-xs"
            >
              Confirmar stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};