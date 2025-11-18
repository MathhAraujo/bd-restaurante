import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>🍽️ Restaurante</h1>
          <p>Dashboard</p>
        </div>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/clientes" className={isActive('/clientes') ? 'active' : ''}>
              👥 Clientes
            </Link>
          </li>
          <li>
            <Link to="/reservas" className={isActive('/reservas') ? 'active' : ''}>
              📅 Reservas
            </Link>
          </li>
          <li>
            <Link to="/mesas" className={isActive('/mesas') ? 'active' : ''}>
              🪑 Mesas
            </Link>
          </li>
          <li>
            <Link to="/comandas" className={isActive('/comandas') ? 'active' : ''}>
              🧾 Comandas
            </Link>
          </li>
          <li>
            <Link to="/data" className={isActive('/data') ? 'active' : ''}>
              📈 Analytics
            </Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;

