import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClientePage from './pages/ClientePage';
import MesaPage from './pages/MesaPage';
import ComandaPage from './pages/ComandaPage';
import ReservaPage from './pages/ReservaPage';
import DataPage from './pages/DataPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<ClientePage />} />
          <Route path="/mesas" element={<MesaPage />} />
          <Route path="/comandas" element={<ComandaPage />} />
          <Route path="/reservas" element={<ReservaPage />} />
          <Route path="/data" element={<DataPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

