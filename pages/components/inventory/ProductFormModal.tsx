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
    <>
      <style>{`
        @media (min-width: 768px) {
          .product-modal-wrapper {
            overflow: hidden !important;
          }
          .product-modal-container {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
          }
          .product-modal-form {
            height: auto !important;
            overflow: visible !important;
          }
          .product-modal-content {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
        }
      `}</style>
      <div className="product-modal-wrapper fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-2 md:p-4 overflow-y-auto md:overflow-hidden">
        <div className="product-modal-container bg-white rounded-lg shadow-2xl max-w-lg w-full my-4 md:my-0 flex flex-col">
          <div className="flex-shrink-0 px-3 md:px-4 pt-2 md:pt-1.5 pb-1.5 md:pb-1 border-b border-slate-200">
            <h3 className="text-sm md:text-sm font-bold text-slate-900 leading-tight">
              {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
            </h3>
          </div>
          <form onSubmit={onSubmit} className="product-modal-form flex flex-col">
            <div className="product-modal-content px-3 md:px-4 py-2 md:py-1.5">
              <ProductFormFields
                product={product}
                onChange={onChange}
                exchangeRate={exchangeRate}
              />
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
                className={`px-3 py-1.5 md:px-3 md:py-1 text-white rounded-lg font-medium shadow transition-all text-xs ${
                  mode === 'create'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {mode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};