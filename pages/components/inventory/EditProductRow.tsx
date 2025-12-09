import React from 'react';
import { Product, Currency } from '../../../types';
import { ProductFormFields } from './ProductFormFields';
import { X, Check } from 'lucide-react';

interface EditProductRowProps {
  product: Product;
  editProductData: Partial<Product>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: keyof Product, value: any) => void;
  exchangeRate: number;
}

export const EditProductRow: React.FC<EditProductRowProps> = ({
  product,
  editProductData,
  onSubmit,
  onCancel,
  onChange,
  exchangeRate,
}) => {
  return (
    <tr className="bg-blue-50 border-b border-blue-200">
      <td colSpan={6} className="px-6 py-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900">Editando: {product.name}</h4>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs inline-flex items-center gap-1 transition-colors"
              >
                <Check size={14} /> Guardar
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
          <ProductFormFields
            product={editProductData}
            onChange={onChange}
            exchangeRate={exchangeRate}
          />
        </form>
      </td>
    </tr>
  );
};