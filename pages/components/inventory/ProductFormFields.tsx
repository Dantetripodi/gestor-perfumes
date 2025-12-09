import React from 'react';
import { Product, Currency, ProductLine } from '../../../types';
import { PRODUCT_LINES } from '../../../constants/productDefaults';

interface ProductFormFieldsProps {
  product: Partial<Product>;
  onChange: (field: keyof Product, value: any) => void;
  exchangeRate: number;
  showEquivalent?: boolean;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  product,
  onChange,
  exchangeRate,
  showEquivalent = true,
}) => {
  const getEquivalent = () => {
    if (!product.costValue || product.costValue === 0) return null;
    
    if (product.costCurrency === Currency.USD) {
      const ars = product.costValue * (exchangeRate || 1200);
      return `≈ $${ars.toFixed(2)} ARS`;
    } else {
      const usd = product.costValue / (exchangeRate || 1200);
      return `≈ $${usd.toFixed(2)} USD`;
    }
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .form-field-spacing > * {
            margin-bottom: 0.25rem !important;
          }
          .form-label {
            font-size: 0.625rem !important;
            margin-bottom: 0.125rem !important;
          }
          .form-input {
            padding: 0.25rem 0.375rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
      <div className="form-field-spacing space-y-2 md:space-y-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-1.5">
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Marca
            </label>
            <input
              required
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.brand || ''}
              onChange={(e) => onChange('brand', e.target.value)}
              placeholder="Ej: Dior"
            />
          </div>
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              SKU
            </label>
            <input
              required
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs font-mono focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.sku || ''}
              onChange={(e) => onChange('sku', e.target.value)}
              placeholder="COD-123"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-1.5">
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Línea
            </label>
            <select
              required
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.line || 'DUP'}
              onChange={(e) => onChange('line', e.target.value as ProductLine)}
            >
              {PRODUCT_LINES.map((line) => (
                <option key={line.value} value={line.value}>
                  {line.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Nombre
            </label>
            <input
              required
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Ej: Sauvage Elixir"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-1">
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Stock
            </label>
            <input
              type="number"
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.currentStock || 0}
              onChange={(e) => onChange('currentStock', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Moneda
            </label>
            <select
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.costCurrency || Currency.USD}
              onChange={(e) => onChange('costCurrency', e.target.value as Currency)}
            >
              <option value={Currency.USD}>USD</option>
              <option value={Currency.ARS}>ARS</option>
            </select>
          </div>
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Costo
            </label>
            <input
              type="number"
              step="0.01"
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.costValue || 0}
              onChange={(e) => onChange('costValue', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label block text-xs md:text-[10px] font-bold text-slate-500 mb-1 md:mb-0.5 uppercase tracking-wide">
              Margen %
            </label>
            <input
              type="number"
              className="form-input w-full border border-slate-200 rounded p-2 md:p-1 text-sm md:text-xs focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              value={product.targetMargin || 30}
              onChange={(e) => onChange('targetMargin', Number(e.target.value))}
            />
          </div>
        </div>

        {showEquivalent && product.costValue && product.costValue > 0 && (
          <div className="bg-slate-50 p-2 md:p-1 rounded border border-slate-200">
            <div className="text-xs md:text-[9px] text-slate-500">Equivalente: <span className="font-bold text-slate-700">{getEquivalent()}</span></div>
          </div>
        )}
      </div>
    </>
  );
};