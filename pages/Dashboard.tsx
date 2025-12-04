import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { generateBusinessInsight } from '../services/geminiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, DollarSign, Package, Sparkles, ArrowUpRight } from 'lucide-react';

/** Panel principal con métricas del negocio. */
export const Dashboard: React.FC = () => {
  const { sales, products, exchangeRate } = useStore();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const metrics = useMemo(() => {
    const totalRevenueARS = sales.reduce(
      (acc, sale) => acc + sale.totalTotalARS,
      0
    );

    const grossProfitARS = sales.reduce((acc, sale) => {
      const saleCostUSD = sale.items.reduce(
        (itemAcc, item) =>
          itemAcc + item.unitCostAtSaleUSD * item.quantity,
        0
      );
      const saleCostARS = saleCostUSD * sale.exchangeRateUsed;
      return acc + (sale.totalTotalARS - saleCostARS);
    }, 0);

    const totalStockValueUSD = products.reduce(
      (acc, p) => acc + p.currentStock * p.avgCostUSD,
      0
    );
    const totalStockValueARS = totalStockValueUSD * exchangeRate.sell;

    return {
      totalRevenueARS,
      grossProfitARS,
      totalStockValueUSD,
      totalStockValueARS,
      margin:
        totalRevenueARS > 0
          ? (grossProfitARS / totalRevenueARS) * 100
          : 0,
    };
  }, [sales, products, exchangeRate]);

  const last7DaysSales = useMemo(() => {
    const data: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data[d.toISOString().split('T')[0]] = 0;
    }

    sales.forEach((sale) => {
      const dateKey = sale.date.split('T')[0];
      if (data[dateKey] !== undefined) {
        data[dateKey] += sale.totalTotalARS;
      }
    });

    return Object.entries(data).map(([date, amount]) => {
      const d = new Date(date);
      return {
        date: d.toLocaleDateString('es-AR', { weekday: 'short' }),
        fullDate: date,
        amount,
      };
    });
  }, [sales]);

  const bestSellers = useMemo(() => {
    const counts: { [id: string]: { name: string; qty: number } } = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!counts[item.productId]) {
          counts[item.productId] = { name: item.productName, qty: 0 };
        }
        counts[item.productId].qty += item.quantity;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales]);

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    const result = await generateBusinessInsight(
      sales,
      products,
      exchangeRate
    );
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Panel</h2>
          <p className="text-slate-500 mt-1">
            Resumen del rendimiento del negocio.
          </p>
        </div>
        <button
          onClick={handleGetInsight}
          disabled={loadingInsight}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
        >
          {loadingInsight ? (
            <Sparkles size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} className="text-amber-400" />
          )}
          <span className="font-medium">
            {loadingInsight ? 'Analizando...' : 'Asesor IA'}
          </span>
        </button>
      </div>

      {insight && (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-2xl shadow-sm animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2 relative z-10">
            <Sparkles size={18} className="text-indigo-600" /> Informe de
            insights
          </h3>
          <div className="prose prose-sm prose-indigo text-slate-700 markdown-body relative z-10">
            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 text-slate-700">
              {insight}
            </pre>
          </div>
          <button
            onClick={() => setInsight(null)}
            className="text-xs font-semibold text-indigo-600 mt-4 hover:text-indigo-800 z-10 relative"
          >
            Cerrar informe
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 rounded-xl text-green-600">
                <TrendingUp size={22} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={12} /> En vivo
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Ingresos totales
            </p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ${(metrics.totalRevenueARS / 1000).toFixed(1)}k{' '}
              <span className="text-sm font-normal text-slate-400">
                ARS
              </span>
            </h3>
          </div>
        </div>

        {/* Ganancia bruta */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <DollarSign size={22} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {metrics.margin.toFixed(0)}% margen
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Ganancia bruta
            </p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ${(metrics.grossProfitARS / 1000).toFixed(1)}k{' '}
              <span className="text-sm font-normal text-slate-400">
                ARS
              </span>
            </h3>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                <Package size={22} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                Base USD
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Valor de stock
            </p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              $
              {metrics.totalStockValueUSD.toLocaleString('es-AR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              <span className="text-sm font-normal text-slate-400">
                USD
              </span>
            </h3>
          </div>
        </div>

        {/* Más vendido */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-900/10 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-slate-800 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-800 rounded-xl text-amber-400 border border-slate-700">
                <Sparkles size={22} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">
              Producto destacado
            </p>
            <h3 className="text-xl font-bold text-white tracking-tight truncate">
              {bestSellers[0]?.name || 'Sin ventas aún'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {bestSellers[0]?.qty || 0} unidades vendidas
            </p>
          </div>
        </div>
      </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Tendencia de ingresos{' '}
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              Últimos 7 días
            </span>
          </h3>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={288}>
              <AreaChart
                data={last7DaysSales}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#f59e0b"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#f59e0b"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow:
                      '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px',
                  }}
                  cursor={{
                    stroke: '#cbd5e1',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString('es-AR')}`,
                    'Ingresos',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: '#b45309',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Más vendidos
          </h3>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={288}>
              <BarChart
                data={bestSellers}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{
                    fill: '#475569',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow:
                      '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="qty"
                  fill="#1e293b"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};