import React from 'react';
import { Product, Currency } from '../../../types';
import { ProductRow } from './ProductRow';
import { EditProductRow } from './EditProductRow.tsx';
import { StockFormRow } from './StockFormRow.tsx';

interface ProductTableProps {
  products: Product[];
  editingProductId: string | null;
  addingStockId: string | null;
  editProductData?: Partial<Product>;
  stockEntry?: {
    quantity: number;
    costValue: number;
    costCurrency: Currency;
  };
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAddStock: (productId: string) => void;
  onUpdateProduct: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onAddStockSubmit: (e: React.FormEvent) => void;
  onCancelStock: () => void;
  onUpdateStockField: (field: keyof NonNullable<ProductTableProps['stockEntry']>, value: any) => void;
  convertToUSD: (value: number, currency: Currency) => number;
  convertFromUSD: (valueUSD: number, currency: Currency) => number;
  exchangeRate: number;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  editingProductId,
  addingStockId,
  editProductData,
  stockEntry,
  onEdit,
  onDelete,
  onAddStock,
  onUpdateProduct,
  onCancelEdit,
  onAddStockSubmit,
  onCancelStock,
  onUpdateStockField,
  convertToUSD,
  convertFromUSD,
  exchangeRate,
}) => {
  if (products.length === 0) {
    return (
      <div className="hidden md:block text-center py-12 text-slate-400">
        <p>No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-xl shadow-sm border border-slate-200">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
              Producto
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
              SKU
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
              Costo
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
              Margen
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">
              Stock
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            if (editingProductId === product.id) {
              return (
                <EditProductRow
                  key={product.id}
                  product={product}
                  editProductData={editProductData || {}}
                  onSubmit={onUpdateProduct}
                  onCancel={onCancelEdit}
                  onChange={(field, value) => {
                    if (editProductData) {
                      onUpdateProduct({ preventDefault: () => {} } as React.FormEvent);
                    }
                  }}
                  exchangeRate={exchangeRate}
                />
              );
            }
            return (
              <React.Fragment key={product.id}>
                <ProductRow
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddStock={onAddStock}
                  convertToUSD={convertToUSD}
                  convertFromUSD={convertFromUSD}
                />
                {addingStockId === product.id && stockEntry && (
                  <StockFormRow
                    product={product}
                    stockEntry={stockEntry}
                    onSubmit={onAddStockSubmit}
                    onCancel={onCancelStock}
                    onChange={onUpdateStockField}
                    exchangeRate={exchangeRate}
                  />
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};