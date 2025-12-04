import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Settings } from './pages/Settings';
import { Transactions } from './pages/Transactions';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    try {
      switch (activePage) {
        case 'dashboard':
          return <Dashboard />;
        case 'inventory':
          return <Inventory />;
        case 'sales':
          return <Sales />;
        case 'settings':
          return <Settings />;
        case 'transactions':
          return <Transactions />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-red-800 font-bold mb-2">Error al cargar la página</h3>
            <p className="text-red-600 text-sm">{error instanceof Error ? error.message : 'Error desconocido'}</p>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <StoreProvider>
        <Layout activePage={activePage} onNavigate={setActivePage}>
          {renderPage()}
        </Layout>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;