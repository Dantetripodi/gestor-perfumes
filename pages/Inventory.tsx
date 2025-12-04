import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Currency } from '../types';
import { Plus, Search, ArrowDown, Package, Edit2, Trash2 } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, addStock, exchangeRate } = useStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState<string | null>(null);
  const [showAddStock, setShowAddStock] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    description: '',
    sku: '',
    currentStock: 0,
    avgCostUSD: 0,
    costCurrency: Currency.USD,
    costValue: 0,
    targetMargin: 30,
  });

  const [editProduct, setEditProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    description: '',
    sku: '',
    currentStock: 0,
    costCurrency: Currency.USD,
    costValue: 0,
    targetMargin: 30,
  });
  
  const [stockEntry, setStockEntry] = useState({
    quantity: 1,
    costValue: 0,
    costCurrency: Currency.USD as Currency,
  });

  const convertToUSD = (value: number, currency: Currency): number => {
    if (currency === Currency.USD) return value;
    return value / (exchangeRate.sell || 1200);
  };

  const convertFromUSD = (valueUSD: number, currency: Currency): number => {
    if (currency === Currency.USD) return valueUSD;
    return valueUSD * (exchangeRate.sell || 1200);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;

    addProduct({
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
    } as Product);

    setShowAddProduct(false);
    setNewProduct({
      name: '',
      brand: '',
      description: '',
      sku: '',
      currentStock: 0,
      avgCostUSD: 0,
      costCurrency: Currency.USD,
      costValue: 0,
      targetMargin: 30,
    });
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setEditProduct({
      name: product.name,
      brand: product.brand,
      description: product.description,
      sku: product.sku,
      currentStock: product.currentStock,
      costCurrency: product.costCurrency,
      costValue: product.costValue,
      targetMargin: product.targetMargin,
    });
    setShowEditProduct(productId);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditProduct) return;

    updateProduct(showEditProduct, {
      name: editProduct.name!,
      brand: editProduct.brand || '',
      description: editProduct.description || '',
      sku: editProduct.sku!,
      currentStock: Number(editProduct.currentStock),
      costCurrency: editProduct.costCurrency || Currency.USD,
      costValue: Number(editProduct.costValue),
      targetMargin: Number(editProduct.targetMargin),
    });

    setShowEditProduct(null);
    setEditProduct({
      name: '',
      brand: '',
      description: '',
      sku: '',
      currentStock: 0,
      costCurrency: Currency.USD,
      costValue: 0,
      targetMargin: 30,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer y también se eliminarán las compras relacionadas.`)) {
      deleteProduct(productId);
    }
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddStock) return;

    addStock(
      showAddStock,
      Number(stockEntry.quantity),
      Number(stockEntry.costValue),
      stockEntry.costCurrency
    );
    
    setShowAddStock(null);
    setStockEntry({ quantity: 1, costValue: 0, costCurrency: Currency.USD });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Inventario</h2>
          <p className="text-slate-500 mt-1">
            Gestiona productos y niveles de stock.
          </p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="hidden md:flex bg-slate-900 text-white px-5 py-3 rounded-xl items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={20} /> Agregar producto
        </button>
      </div>

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

      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Producto
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  SKU
                </th>
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
              {filteredProducts.map((product) => {
                const costInOtherCurrency = product.costCurrency === Currency.USD
                  ? convertFromUSD(product.avgCostUSD, Currency.ARS)
                  : convertToUSD(product.costValue, Currency.USD);
                
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {product.name}
                      </div>
                      <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                        {product.brand}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-slate-700">
                        ${product.costValue.toFixed(2)} {product.costCurrency}
                      </div>
                      <div className="text-xs text-slate-400">
                        ≈ ${costInOtherCurrency.toFixed(2)} {product.costCurrency === Currency.USD ? 'ARS' : 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {product.targetMargin}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.currentStock < 5
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {product.currentStock} Unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setShowAddStock(product.id);
                            setStockEntry({
                              quantity: 1,
                              costValue: product.costValue,
                              costCurrency: product.costCurrency,
                            });
                          }}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
                          title="Reponer stock"
                        >
                          <ArrowDown size={14} /> Stock
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => {
          const costInOtherCurrency = product.costCurrency === Currency.USD
            ? convertFromUSD(product.avgCostUSD, Currency.ARS)
            : convertToUSD(product.costValue, Currency.USD);
          
          return (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {product.brand}
                    </span>
                    {product.currentStock < 3 && (
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800">{product.name}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex gap-3">
                    <span>
                      ${product.costValue.toFixed(0)} {product.costCurrency}
                      <span className="text-slate-300 mx-1">|</span>
                      ≈ ${costInOtherCurrency.toFixed(0)} {product.costCurrency === Currency.USD ? 'ARS' : 'USD'}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Stock:{' '}
                      <b
                        className={
                          product.currentStock === 0
                            ? 'text-red-500'
                            : 'text-slate-700'
                        }
                      >
                        {product.currentStock}
                      </b>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleEditProduct(product.id)}
                  className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowAddStock(product.id);
                    setStockEntry({
                      quantity: 1,
                      costValue: product.costValue,
                      costCurrency: product.costCurrency,
                    });
                  }}
                  className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p>No se encontraron productos.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddProduct(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>

      {showAddProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Nuevo producto
            </h3>
            <form
              onSubmit={handleCreateProduct}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Marca
                  </label>
                  <input
                    required
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    value={newProduct.brand}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        brand: e.target.value,
                      })
                    }
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
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        sku: e.target.value,
                      })
                    }
                    placeholder="COD-123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Nombre del producto
                </label>
                <input
                  required
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      name: e.target.value,
                    })
                  }
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
                    value={newProduct.currentStock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        currentStock: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Moneda
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    value={newProduct.costCurrency || Currency.USD}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        costCurrency: e.target.value as Currency,
                      })
                    }
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
                    value={newProduct.costValue}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        costValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              {newProduct.costValue > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Equivalente:</div>
                  <div className="font-bold text-slate-700">
                    {newProduct.costCurrency === Currency.USD
                      ? `≈ $${(Number(newProduct.costValue) * (exchangeRate.sell || 1200)).toFixed(2)} ARS`
                      : `≈ $${(Number(newProduct.costValue) / (exchangeRate.sell || 1200)).toFixed(2)} USD`}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Margen %
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  value={newProduct.targetMargin}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      targetMargin: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium shadow-lg shadow-slate-900/20 transition-all"
                >
                  Crear producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Editar producto
            </h3>
            <form
              onSubmit={handleUpdateProduct}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Marca
                  </label>
                  <input
                    required
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    value={editProduct.brand}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        brand: e.target.value,
                      })
                    }
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
                    value={editProduct.sku}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        sku: e.target.value,
                      })
                    }
                    placeholder="COD-123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Nombre del producto
                </label>
                <input
                  required
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      name: e.target.value,
                    })
                  }
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
                    value={editProduct.currentStock}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        currentStock: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Moneda
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    value={editProduct.costCurrency || Currency.USD}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        costCurrency: e.target.value as Currency,
                      })
                    }
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
                    value={editProduct.costValue}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        costValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              {editProduct.costValue > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Equivalente:</div>
                  <div className="font-bold text-slate-700">
                    {editProduct.costCurrency === Currency.USD
                      ? `≈ $${(Number(editProduct.costValue) * (exchangeRate.sell || 1200)).toFixed(2)} ARS`
                      : `≈ $${(Number(editProduct.costValue) / (exchangeRate.sell || 1200)).toFixed(2)} USD`}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Margen %
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  value={editProduct.targetMargin}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      targetMargin: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditProduct(null)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Reponer inventario
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Actualizar niveles para{' '}
              <span className="font-bold text-slate-800">
                {products.find((p) => p.id === showAddStock)?.name}
              </span>
            </p>
            <form
              onSubmit={handleAddStock}
              className="space-y-4"
            >
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
                  onChange={(e) =>
                    setStockEntry({
                      ...stockEntry,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Moneda
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none mb-3"
                  value={stockEntry.costCurrency}
                  onChange={(e) =>
                    setStockEntry({
                      ...stockEntry,
                      costCurrency: e.target.value as Currency,
                    })
                  }
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
                  <span className="absolute left-3 top-3 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full border border-slate-200 rounded-lg p-3 pl-6 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    value={stockEntry.costValue}
                    onChange={(e) =>
                      setStockEntry({
                        ...stockEntry,
                        costValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
                {stockEntry.costValue > 0 && (
                  <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">Equivalente:</div>
                    <div className="font-medium text-slate-700">
                      {stockEntry.costCurrency === Currency.USD
                        ? `≈ $${(stockEntry.costValue * (exchangeRate.sell || 1200)).toFixed(2)} ARS`
                        : `≈ $${(stockEntry.costValue / (exchangeRate.sell || 1200)).toFixed(2)} USD`}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <span className="font-bold">Nota:</span> Esto
                  actualizará el costo promedio ponderado de tu
                  inventario.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddStock(null)}
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
      )}
    </div>
  );
};