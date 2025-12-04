import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sale } from '../types';
import { Calendar, User, CreditCard } from 'lucide-react';

export const Transactions: React.FC = () => {
    const { sales } = useStore();
    const sortedSales = [...sales].reverse();
    
    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">History</h2>
                <p className="text-slate-500 mt-1">Recent sales transactions.</p>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Products</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Customer</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Total (ARS)</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Ex. Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedSales.map((sale: Sale) => (
                            <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                    {new Date(sale.date).toLocaleDateString()} <br/>
                                    <span className="text-slate-400">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {sale.items.map((i, idx) => (
                                            <span key={idx} className="font-medium text-slate-800">
                                                {i.quantity}x {i.productName}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {sale.customerName ? (
                                        <div className="flex items-center gap-1.5">
                                            <User size={14} className="text-slate-400"/>
                                            {sale.customerName}
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 italic">Walk-in</span>
                                    )}
                                    <div className="text-xs text-slate-400 mt-0.5">{sale.channel}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">
                                    ${sale.totalTotalARS.toLocaleString('es-AR')}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                                    ${sale.exchangeRateUsed}
                                </td>
                            </tr>
                        ))}
                         {sales.length === 0 && (
                            <tr><td colSpan={5} className="p-12 text-center text-slate-400">No transactions recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-3">
                {sortedSales.map((sale: Sale) => (
                    <div key={sale.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-50">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar size={14} />
                                <span>{new Date(sale.date).toLocaleDateString()}</span>
                                <span className="text-slate-300">|</span>
                                <span>{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full uppercase">{sale.channel}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                             {sale.items.map((i, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-800">{i.productName}</span>
                                    <span className="text-slate-500">x{i.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-1">
                             <div className="text-xs text-slate-400">
                                 {sale.customerName && <span className="flex items-center gap-1"><User size={12}/> {sale.customerName}</span>}
                             </div>
                             <div className="text-right">
                                 <span className="block font-bold text-lg text-slate-900">${sale.totalTotalARS.toLocaleString('es-AR')}</span>
                                 <span className="block text-[10px] text-slate-400 font-mono">Rate: ${sale.exchangeRateUsed}</span>
                             </div>
                        </div>
                    </div>
                ))}
                 {sales.length === 0 && (
                    <div className="p-12 text-center text-slate-400">No transactions recorded yet.</div>
                )}
            </div>
        </div>
    );
}