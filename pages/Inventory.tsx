import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Plus, Search, ArrowDown, Edit2, Package } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, addProduct, addStock } = useStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState<string | null>(null); // productId or null
  const [searchTerm, setSearchTerm] = useState('');

  // Forms State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', brand: '', description: '', sku: '', currentStock: 0, avgCostUSD: 0, targetMargin: 30
  });
  const [stockEntry, setStockEntry] = useState({ quantity: 1, costUSD: 0 });

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
      avgCostUSD: Number(newProduct.avgCostUSD),
      targetMargin: Number(newProduct.targetMargin),
    } as Product);
    
    setShowAddProduct(false);
    setNewProduct({ name: '', brand: '', description: '', sku: '', currentStock: 0, avgCostUSD: 0, targetMargin: 30 });
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddStock) return;
    
    addStock(showAddStock, Number(stockEntry.quantity), Number(stockEntry.costUSD));
    setShowAddStock(null);
    setStockEntry({ quantity: 1, costUSD: 0 });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Inventory</h2>
            <p className="text-slate-500 mt-1">Manage products and stock levels.</p>
        </div>
        <button 
          onClick={() => setShowAddProduct(true)}
          className="hidden md:flex bg-slate-900 text-white px-5 py-3 rounded-xl items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="sticky top-0 z-10 bg-zinc-50 pt-2 pb-4">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <Search className="text-slate-400" size={20} />
            <input 
            type="text" 
            placeholder="Search by name, brand, or SKU..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Product</th>
                <th className="px-6 py-4 font-semibold text-slate-600">SKU</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Cost (USD)</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Margin</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{product.name}</div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{product.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">${product.avgCostUSD.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{product.targetMargin}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.currentStock < 5 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {product.currentStock} Units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setShowAddStock(product.id);
                        setStockEntry({ quantity: 1, costUSD: product.avgCostUSD });
                      }}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      <ArrowDown size={14} /> Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{product.brand}</span>
                         {product.currentStock < 3 && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                    </div>
                    <h3 className="font-bold text-slate-800">{product.name}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                        <span>${product.avgCostUSD.toFixed(0)} USD</span>
                        <span className="text-slate-300">|</span>
                        <span>Stock: <b className={product.currentStock === 0 ? 'text-red-500' : 'text-slate-700'}>{product.currentStock}</b></span>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setShowAddStock(product.id);
                        setStockEntry({ quantity: 1, costUSD: product.avgCostUSD });
                    }}
                    className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors"
                >
                    <ArrowDown size={18} />
                </button>
            </div>
        ))}
        {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
                <Package size={48} className="mx-auto mb-3 opacity-20" />
                <p>No products found.</p>
            </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => setShowAddProduct(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6">New Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Brand</label>
                  <input required className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} placeholder="e.g. Dior" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">SKU</label>
                  <input required className="w-full border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="CODE-123" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Product Name</label>
                <input required className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Sauvage Elixir" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stock</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" value={newProduct.currentStock} onChange={e => setNewProduct({...newProduct, currentStock: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cost ($)</label>
                    <input type="number" step="0.01" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" value={newProduct.avgCostUSD} onChange={e => setNewProduct({...newProduct, avgCostUSD: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Margin %</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" value={newProduct.targetMargin} onChange={e => setNewProduct({...newProduct, targetMargin: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowAddProduct(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium shadow-lg shadow-slate-900/20 transition-all">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Restock Inventory</h3>
            <p className="text-sm text-slate-500 mb-6">Update levels for <span className="font-bold text-slate-800">{products.find(p => p.id === showAddStock)?.name}</span></p>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Quantity to Add</label>
                <input type="number" required min="1" className="w-full border border-slate-200 rounded-lg p-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" value={stockEntry.quantity} onChange={e => setStockEntry({...stockEntry, quantity: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Unit Cost (USD)</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">$</span>
                    <input type="number" required step="0.01" className="w-full border border-slate-200 rounded-lg p-3 pl-6 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" value={stockEntry.costUSD} onChange={e => setStockEntry({...stockEntry, costUSD: Number(e.target.value)})} />
                </div>
                <p className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold">Note:</span> This will update the weighted average cost of your inventory.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowAddStock(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-bold shadow-lg shadow-amber-500/20 transition-all">Confirm Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};