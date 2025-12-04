import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, SaleChannel } from '../types';
import { Search, ShoppingCart, Trash2, CheckCircle, ChevronUp, ChevronDown, X } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  priceUSD: number;
}

export const Sales: React.FC = () => {
  const { products, exchangeRate, recordSale } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [channel, setChannel] = useState<SaleChannel>(SaleChannel.STORE);
  const [customer, setCustomer] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Mobile UI States
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Clear success message after 3 seconds
  useEffect(() => {
    if(successMsg) {
        const timer = setTimeout(() => setSuccessMsg(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      const suggestedPriceUSD = product.avgCostUSD * (1 + (product.targetMargin / 100));
      setCart([...cart, { product, quantity: 1, priceUSD: suggestedPriceUSD }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
    if (cart.length === 1) setIsMobileCartOpen(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updatePriceUSD = (id: string, newPrice: number) => {
      setCart(cart.map(item => item.product.id === id ? {...item, priceUSD: newPrice} : item));
  };

  const calculateTotals = () => {
    const subtotalUSD = cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
    const subtotalARS = subtotalUSD * exchangeRate.sell;
    return { subtotalUSD, subtotalARS };
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const totals = calculateTotals();
    const saleItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceARS: item.priceUSD * exchangeRate.sell
    }));

    recordSale(saleItems, channel, customer);
    setCart([]);
    setCustomer('');
    setSuccessMsg(`Sale recorded: $${totals.subtotalARS.toLocaleString('es-AR')}`);
    setIsMobileCartOpen(false);
  };

  const { subtotalUSD, subtotalARS } = calculateTotals();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
    p.currentStock > 0
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative">
        
      {/* Search Header */}
      <div className="mb-4 sticky top-0 bg-zinc-50 z-10 py-2">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {successMsg && (
            <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 animate-fade-in mx-4 md:mx-0">
                <CheckCircle size={20}/> 
                <span className="font-bold">{successMsg}</span>
            </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pb-32 md:pb-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {filteredProducts.map(product => {
               const suggestedUSD = product.avgCostUSD * (1 + (product.targetMargin/100));
               const priceARS = suggestedUSD * exchangeRate.sell;
               const inCartQty = cart.find(c => c.product.id === product.id)?.quantity || 0;

               return (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className={`relative bg-white p-5 rounded-2xl border transition-all cursor-pointer group select-none
                    ${inCartQty > 0 ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20' : 'border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'}
                  `}
                >
                  {inCartQty > 0 && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg scale-110 animate-fade-in z-10">
                          {inCartQty}
                      </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand}</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wide">Stock: {product.currentStock}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-4 leading-tight group-hover:text-amber-600 transition-colors">{product.name}</h3>
                  <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Estimate</div>
                          <div className="font-bold text-slate-900 text-xl">${Math.ceil(priceARS/100)*100}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">USD</div>
                          <div className="font-mono font-medium text-slate-600 text-lg">${suggestedUSD.toFixed(0)}</div>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Cart - Visible on Large Screens */}
        <div className="hidden lg:flex w-96 bg-white rounded-2xl shadow-xl border border-slate-200 flex-col h-full sticky top-0">
             <CartContents 
                cart={cart} 
                removeFromCart={removeFromCart} 
                updateQuantity={updateQuantity} 
                updatePriceUSD={updatePriceUSD}
                exchangeRate={exchangeRate.sell}
                subtotalUSD={subtotalUSD}
                subtotalARS={subtotalARS}
                channel={channel}
                setChannel={setChannel}
                customer={customer}
                setCustomer={setCustomer}
                handleCheckout={handleCheckout}
             />
        </div>
      </div>

      {/* Mobile Cart Bottom Bar & Drawer */}
      <div className="lg:hidden">
          {/* Bottom Bar Summary */}
          {totalItems > 0 && (
            <button 
                onClick={() => setIsMobileCartOpen(true)}
                className="fixed bottom-20 md:bottom-8 left-4 right-4 bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center z-40 animate-fade-in active:scale-95 transition-transform"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-slate-900">
                        {totalItems}
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-slate-400">Total Estimate</div>
                        <div className="font-bold text-lg">${subtotalARS.toLocaleString('es-AR')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
                    View Cart <ChevronUp size={16}/>
                </div>
            </button>
          )}

          {/* Cart Drawer Overlay */}
          {isMobileCartOpen && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)}></div>
                  <div className="bg-white rounded-t-3xl shadow-2xl w-full h-[85vh] relative flex flex-col animate-fade-in">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <ShoppingCart size={20} /> Order Summary
                          </h2>
                          <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                              <ChevronDown size={20} />
                          </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <CartContents 
                            cart={cart} 
                            removeFromCart={removeFromCart} 
                            updateQuantity={updateQuantity} 
                            updatePriceUSD={updatePriceUSD}
                            exchangeRate={exchangeRate.sell}
                            subtotalUSD={subtotalUSD}
                            subtotalARS={subtotalARS}
                            channel={channel}
                            setChannel={setChannel}
                            customer={customer}
                            setCustomer={setCustomer}
                            handleCheckout={handleCheckout}
                        />
                      </div>
                  </div>
              </div>
          )}
      </div>

    </div>
  );
};

// Extracted Cart Component for reuse in Desktop and Mobile views
const CartContents = ({ 
    cart, removeFromCart, updateQuantity, updatePriceUSD, exchangeRate, 
    subtotalUSD, subtotalARS, channel, setChannel, customer, setCustomer, handleCheckout 
}: any) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 p-8">
                        <ShoppingCart size={48} className="opacity-10"/>
                        <p className="text-sm font-medium">Cart is empty</p>
                    </div>
                ) : (
                    cart.map((item: CartItem) => (
                    <div key={item.product.id} className="flex flex-col gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.product.brand}</span>
                                <h4 className="font-bold text-slate-800">{item.product.name}</h4>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-600 font-medium transition-colors">-</button>
                                <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-600 font-medium transition-colors">+</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">USD</span>
                                <input 
                                    type="number" 
                                    className="w-16 border border-slate-200 rounded-md p-1 text-right text-sm font-mono focus:ring-2 focus:ring-amber-500/20 outline-none"
                                    value={item.priceUSD}
                                    onChange={(e) => updatePriceUSD(item.product.id, Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end items-baseline gap-1 text-slate-800">
                            <span className="text-xs text-slate-400">Total ARS</span>
                            <span className="font-bold text-lg">${(item.priceUSD * item.quantity * exchangeRate).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                    ))
                )}
            </div>

            <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100 space-y-4 rounded-b-xl">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Channel</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none bg-white border border-slate-200 rounded-lg p-2 text-sm font-medium text-slate-700 outline-none focus:border-amber-500"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value as SaleChannel)}
                            >
                                {Object.values(SaleChannel).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client</label>
                        <input 
                            type="text" 
                            placeholder="Optional" 
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 border-dashed">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal USD</span>
                        <span className="font-mono">${subtotalUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Rate (USD/ARS)</span>
                        <span className="font-mono">${exchangeRate}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2">
                        <span>Total</span>
                        <span>${subtotalARS.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                >
                    Confirm Sale
                </button>
            </div>
        </div>
    )
}