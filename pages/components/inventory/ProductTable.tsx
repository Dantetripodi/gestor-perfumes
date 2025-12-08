import React from 'react';
import { Product, Currency } from '../../../types';
import { ProductRow } from './ProductRow';

interface ProductTableProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAddStock: (productId: string) => void;
  convertToUSD: (value: number, currency: Currency) => number;
  convertFromUSD: (valueUSD: number, currency: Currency) => number;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onAddStock,
  convertToUSD,
  convertFromUSD,
}) => {
  return (
    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Producto</th>
              <th className="px-6 py-4 font-semibold text-slate-600">SKU</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                Costo
              </th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                Margen
              </th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-center">
                Stock
              </th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddStock={onAddStock}
                convertToUSD={convertToUSD}
                convertFromUSD={convertFromUSD}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};