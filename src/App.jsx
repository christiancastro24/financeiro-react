import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analises from './pages/Analises';
import OrcamentoDiario from './pages/OrcamentoDiario';
import ResumoCategoria from './pages/ResumoCategoria';
import Investimentos from './pages/Investimentos';
import Aposentadoria from './pages/Aposentadoria';
import Jornada100k from './pages/Jornada100k';
import MetasSonhos from './pages/MetasSonhos';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analises':
        return <Analises />;
      case 'orcamento':
        return <OrcamentoDiario />;
      case 'resumo':
        return <ResumoCategoria />;
      case 'investimentos':
        return <Investimentos />;
      case 'aposentadoria':
        return <Aposentadoria />;
      case 'jornada':
        return <Jornada100k />;
      case 'metas':
        return <MetasSonhos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderPage()}
    </Layout>
  );
}

export default App;