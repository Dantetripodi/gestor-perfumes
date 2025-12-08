import React from 'react';
import { Product } from '../../../types';
import { ProductFormFields } from './ProductFormFields';

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  product: Partial<Product>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onChange: (field: keyof Product, value: any) => void;
  exchangeRate: number;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  product,
  onSubmit,
  onClose,
  onChange,
  exchangeRate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <ProductFormFields
            product={product}
            onChange={onChange}
            exchangeRate={exchangeRate}
          />
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
              className={`px-5 py-2.5 text-white rounded-xl font-medium shadow-lg transition-all ${
                mode === 'create'
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};