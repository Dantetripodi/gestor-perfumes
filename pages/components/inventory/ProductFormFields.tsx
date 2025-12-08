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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            Marca
          </label>
          <input
            required
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            value={product.brand || ''}
            onChange={(e) => onChange('brand', e.target.value)}
            placeholder="Ej: Dior"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            SKU
          </label>
          <input
            required
            className="w-full border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            value={product.sku || ''}
            onChange={(e) => onChange('sku', e.target.value)}
            placeholder="COD-123"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
          Línea
        </label>
        <select
          required
          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
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
        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
          Nombre del producto
        </label>
        <input
          required
          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
          value={product.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Ej: Sauvage Elixir"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            Stock
          </label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            value={product.currentStock || 0}
            onChange={(e) => onChange('currentStock', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            Moneda
          </label>
          <select
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            value={product.costCurrency || Currency.USD}
            onChange={(e) => onChange('costCurrency', e.target.value as Currency)}
          >
            <option value={Currency.USD}>USD</option>
            <option value={Currency.ARS}>ARS</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            Costo
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            value={product.costValue || 0}
            onChange={(e) => onChange('costValue', Number(e.target.value))}
          />
        </div>
      </div>

      {showEquivalent && product.costValue && product.costValue > 0 && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Equivalente:</div>
          <div className="font-bold text-slate-700">{getEquivalent()}</div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
          Margen %
        </label>
        <input
          type="number"
          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          value={product.targetMargin || 30}
          onChange={(e) => onChange('targetMargin', Number(e.target.value))}
        />
      </div>
    </>
  );
};