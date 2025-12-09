import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Currency } from '../types';
import { Plus, Search, Package, X, Check } from 'lucide-react';
import { useProductForm } from '../hooks/useProductForm';
import { useCurrencyConversion } from '../hooks/useCurrencyConversion';
import { DEFAULT_PRODUCT } from '../constants/productDefaults';
import { ProductFormFields } from './components/inventory/ProductFormFields';
import { ProductTable } from './components/inventory/ProductTable';
import { ProductCard } from './components/inventory/ProductCard';

export const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, addStock, exchangeRate } = useStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [addingStockId, setAddingStockId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { product: newProduct, updateField: updateNewField, resetForm: resetNewForm } = useProductForm();
  const { product: editProductData, loadProduct, updateField: updateEditField, resetForm: resetEditForm } = useProductForm();
  const [stockEntry, setStockEntry] = useState({
    quantity: 1,
    costValue: 0,
    costCurrency: Currency.USD as Currency,
  });

  const { convertToUSD, convertFromUSD } = useCurrencyConversion(exchangeRate.sell);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.line) return;

    try {
      await addProduct({
        id: crypto.randomUUID(),
        name: newProduct.name!,
        brand: newProduct.brand || '',
        description: newProduct.description || '',
        sku: newProduct.sku!,
        currentStock: Number(newProduct.currentStock),
        avgCostUSD: 0,
        costCurrency: newProduct.costCurrency || Currency.USD,
        costValue: Number(newProduct.costValue),
        targetMargin: Number(newProduct.targetMargin),
        line: newProduct.line!,
        category: newProduct.category,
        size_ml: newProduct.size_ml,
        variant: newProduct.variant,
      } as Product);

      setShowAddProduct(false);
      resetNewForm();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto. Verifica la consola para más detalles.');
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    loadProduct({
      name: product.name,
      brand: product.brand,
      description: product.description,
      sku: product.sku,
      currentStock: product.currentStock,
      costCurrency: product.costCurrency,
      costValue: product.costValue,
      targetMargin: product.targetMargin,
      line: product.line,
      category: product.category,
      size_ml: product.size_ml,
      variant: product.variant,
    });
    setEditingProductId(productId);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    try {
      await updateProduct(editingProductId, {
        name: editProductData.name!,
        brand: editProductData.brand || '',
        description: editProductData.description || '',
        sku: editProductData.sku!,
        currentStock: Number(editProductData.currentStock),
        costCurrency: editProductData.costCurrency || Currency.USD,
        costValue: Number(editProductData.costValue),
        targetMargin: Number(editProductData.targetMargin),
        line: editProductData.line!,
        category: editProductData.category,
        size_ml: editProductData.size_ml,
        variant: editProductData.variant,
      });

      setEditingProductId(null);
      resetEditForm();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto. Verifica la consola para más detalles.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    resetEditForm();
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (
      window.confirm(
        `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer y también se eliminarán las compras relacionadas.`
      )
    ) {
      try {
        await deleteProduct(productId);
        if (editingProductId === productId) {
          setEditingProductId(null);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto. Verifica la consola para más detalles.');
      }
    }
  };

  const handleAddStockClick = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setAddingStockId(productId);
    setStockEntry({
      quantity: 1,
      costValue: product.costValue,
      costCurrency: product.costCurrency,
    });
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingStockId) return;

    try {
      await addStock(
        addingStockId,
        Number(stockEntry.quantity),
        Number(stockEntry.costValue),
        stockEntry.costCurrency
      );

      setAddingStockId(null);
      setStockEntry({ quantity: 1, costValue: 0, costCurrency: Currency.USD });
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error al agregar stock. Verifica la consola para más detalles.');
    }
  };

  const handleCancelStock = () => {
    setAddingStockId(null);
    setStockEntry({ quantity: 1, costValue: 0, costCurrency: Currency.USD });
  };

  const updateStockField = (field: keyof typeof stockEntry, value: any) => {
    setStockEntry((prev) => ({ ...prev, [field]: value }));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEquivalent = (costValue: number, costCurrency: Currency) => {
    if (costValue === 0) return null;
    if (costCurrency === Currency.USD) {
      const ars = costValue * (exchangeRate.sell || 1200);
      return `≈ $${ars.toFixed(2)} ARS`;
    } else {
      const usd = costValue / (exchangeRate.sell || 1200);
      return `≈ $${usd.toFixed(2)} USD`;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Inventario</h2>
          <p className="text-slate-500 mt-1">Gestiona productos y niveles de stock.</p>
        </div>
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="hidden md:flex bg-slate-900 text-white px-5 py-3 rounded-xl items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          {showAddProduct ? <X size={20} /> : <Plus size={20} />}
          {showAddProduct ? 'Cancelar' : 'Agregar producto'}
        </button>
      </div>

      {showAddProduct && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Nuevo producto</h3>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <ProductFormFields
              product={newProduct}
              onChange={updateNewField}
              exchangeRate={exchangeRate.sell}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddProduct(false);
                  resetNewForm();
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shadow transition-all"
              >
                Crear producto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-zinc-50 pt-2 pb-4">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, marca o SKU..."
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ProductTable
        products={filteredProducts}
        editingProductId={editingProductId}
        addingStockId={addingStockId}
        editProductData={editingProductId ? editProductData : undefined}
        stockEntry={addingStockId ? stockEntry : undefined}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onAddStock={handleAddStockClick}
        onUpdateProduct={handleUpdateProduct}
        onCancelEdit={handleCancelEdit}
        onAddStockSubmit={handleAddStock}
        onCancelStock={handleCancelStock}
        onUpdateStockField={updateStockField}
        convertToUSD={convertToUSD}
        convertFromUSD={convertFromUSD}
        exchangeRate={exchangeRate.sell}
      />

      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAddStock={handleAddStockClick}
            convertToUSD={convertToUSD}
            convertFromUSD={convertFromUSD}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p>No se encontraron productos.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddProduct(!showAddProduct)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        {showAddProduct ? <X size={28} /> : <Plus size={28} />}
      </button>
    </div>
  );
};