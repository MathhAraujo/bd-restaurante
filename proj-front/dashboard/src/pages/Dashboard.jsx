import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>👥 Clientes</h2>
          <p>Gerencie clientes do restaurante</p>
          <a href="/clientes" className="card-link">Acessar →</a>
        </div>
        <div className="dashboard-card">
          <h2>🪑 Mesas</h2>
          <p>Gerencie mesas e sua disponibilidade</p>
          <a href="/mesas" className="card-link">Acessar →</a>
        </div>
        <div className="dashboard-card">
          <h2>🧾 Comandas</h2>
          <p>Gerencie comandas e pedidos</p>
          <a href="/comandas" className="card-link">Acessar →</a>
        </div>
        <div className="dashboard-card">
          <h2>📅 Reservas</h2>
          <p>Gerencie reservas de clientes</p>
          <a href="/reservas" className="card-link">Acessar →</a>
        </div>
        <div className="dashboard-card">
          <h2>📈 Analytics</h2>
          <p>Visualize dados e estatísticas</p>
          <a href="/data" className="card-link">Acessar →</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

