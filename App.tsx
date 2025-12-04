import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Settings } from './pages/Settings';
import { Transactions } from './pages/Transactions';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'sales': return <Sales />;
      case 'settings': return <Settings />;
      case 'transactions': return <Transactions />;
      default: return <Dashboard />;
    }
  };

  return (
    <StoreProvider>
      <Layout activePage={activePage} onNavigate={setActivePage}>
        {renderPage()}
      </Layout>
    </StoreProvider>
  );
};

export default App;