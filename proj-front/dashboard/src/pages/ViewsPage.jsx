import { useState, useEffect } from 'react';
import { dataAPI } from '../services/api';
import './ViewsPage.css';

function ViewsPage() {
  const [mesaFull, setMesaFull] = useState([]);
  const [reservaFutureFull, setReservaFutureFull] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sorting states for Mesas Completas
  const [mesaSortField, setMesaSortField] = useState('id_mesa');
  const [mesaSortDirection, setMesaSortDirection] = useState('asc');
  
  // Sorting states for Reservas Completas
  const [reservaSortField, setReservaSortField] = useState('id_reserva');
  const [reservaSortDirection, setReservaSortDirection] = useState('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mesaFullResponse, reservaFutureFullResponse] = await Promise.all([
        dataAPI.getMesaFull(),
        dataAPI.getReservaFutureFull(),
      ]);

      setMesaFull(mesaFullResponse.data || []);
      setReservaFutureFull(reservaFutureFullResponse.data || []);
    } catch (err) {
      setError('Erro ao carregar dados: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando dados...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="views-page">
      <div className="page-header">
        <h1>👁️ Views</h1>
        <button className="btn btn-primary" onClick={loadData}>
          Atualizar Dados
        </button>
      </div>

      <div className="views-grid">
        {/* Mesas Completas Table */}
        <div className="view-card">
          <h2>Mesas Completas</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => { setMesaSortField('id_mesa'); setMesaSortDirection(mesaSortField === 'id_mesa' && mesaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Mesa {mesaSortField === 'id_mesa' && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setMesaSortField('cpf'); setMesaSortDirection(mesaSortField === 'cpf' && mesaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    CPF Cliente {mesaSortField === 'cpf' && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setMesaSortField('nome'); setMesaSortDirection(mesaSortField === 'nome' && mesaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Nome Cliente {mesaSortField === 'nome' && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setMesaSortField('id_reserva'); setMesaSortDirection(mesaSortField === 'id_reserva' && mesaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Reserva {mesaSortField === 'id_reserva' && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setMesaSortField('status_mesa'); setMesaSortDirection(mesaSortField === 'status_mesa' && mesaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Status {mesaSortField === 'status_mesa' && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setMesaSortField('data_hora_chegada'); setMesaSortDirection(mesaSortField === 'data_hora_chegada' && mesaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Data/Hora Chegada {mesaSortField === 'data_hora_chegada' && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mesaFull.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">Nenhuma mesa encontrada</td>
                  </tr>
                ) : (
                  [...mesaFull].sort((a, b) => {
                    let aVal = a[mesaSortField];
                    let bVal = b[mesaSortField];
                    
                    // Handle null/undefined values
                    if (aVal == null) aVal = mesaSortField === 'id_mesa' || mesaSortField === 'id_reserva' ? 0 : '';
                    if (bVal == null) bVal = mesaSortField === 'id_mesa' || mesaSortField === 'id_reserva' ? 0 : '';
                    
                    // Handle dates
                    if (mesaSortField === 'data_hora_chegada') {
                      aVal = aVal ? new Date(aVal).getTime() : 0;
                      bVal = bVal ? new Date(bVal).getTime() : 0;
                      return mesaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    // Handle numbers
                    if (mesaSortField === 'id_mesa' || mesaSortField === 'id_reserva') {
                      aVal = Number(aVal) || 0;
                      bVal = Number(bVal) || 0;
                      return mesaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    // Convert to strings for comparison
                    aVal = String(aVal).toLowerCase();
                    bVal = String(bVal).toLowerCase();
                    
                    if (mesaSortDirection === 'asc') {
                      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                    } else {
                      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                    }
                  }).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.id_mesa ?? '-'}</td>
                      <td>{item.cpf ?? '-'}</td>
                      <td>{item.nome ?? '-'}</td>
                      <td>{item.id_reserva ?? '-'}</td>
                      <td>
                        {item.status_mesa ? (
                          <span className={`status-badge status-${item.status_mesa.toLowerCase()}`}>
                            {item.status_mesa}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{item.data_hora_chegada ? new Date(item.data_hora_chegada).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservas Completas Table */}
        <div className="view-card">
          <h2>Reservas Completas</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => { setReservaSortField('id_reserva'); setReservaSortDirection(reservaSortField === 'id_reserva' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Reserva {reservaSortField === 'id_reserva' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('cliente_cpf'); setReservaSortDirection(reservaSortField === 'cliente_cpf' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    CPF Cliente {reservaSortField === 'cliente_cpf' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('nome'); setReservaSortDirection(reservaSortField === 'nome' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Nome Cliente {reservaSortField === 'nome' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('qnt_pessoas'); setReservaSortDirection(reservaSortField === 'qnt_pessoas' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Qnt. Pessoas {reservaSortField === 'qnt_pessoas' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('data_hora_chegada'); setReservaSortDirection(reservaSortField === 'data_hora_chegada' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Data/Hora Chegada {reservaSortField === 'data_hora_chegada' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('status_reserva'); setReservaSortDirection(reservaSortField === 'status_reserva' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Status Reserva {reservaSortField === 'status_reserva' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('id_mesa'); setReservaSortDirection(reservaSortField === 'id_mesa' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Mesa {reservaSortField === 'id_mesa' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('status_mesa'); setReservaSortDirection(reservaSortField === 'status_mesa' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Status Mesa {reservaSortField === 'status_mesa' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('capacidade'); setReservaSortDirection(reservaSortField === 'capacidade' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Capacidade {reservaSortField === 'capacidade' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setReservaSortField('id_func'); setReservaSortDirection(reservaSortField === 'id_func' && reservaSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Funcionário {reservaSortField === 'id_func' && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservaFutureFull.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-state">Nenhuma reserva encontrada</td>
                  </tr>
                ) : (
                  [...reservaFutureFull].sort((a, b) => {
                    let aVal = a[reservaSortField];
                    let bVal = b[reservaSortField];
                    
                    // Handle null/undefined values
                    if (aVal == null) aVal = reservaSortField === 'id_reserva' || reservaSortField === 'qnt_pessoas' || reservaSortField === 'id_mesa' || reservaSortField === 'capacidade' || reservaSortField === 'id_func' ? 0 : '';
                    if (bVal == null) bVal = reservaSortField === 'id_reserva' || reservaSortField === 'qnt_pessoas' || reservaSortField === 'id_mesa' || reservaSortField === 'capacidade' || reservaSortField === 'id_func' ? 0 : '';
                    
                    // Handle dates
                    if (reservaSortField === 'data_hora_chegada') {
                      aVal = aVal ? new Date(aVal).getTime() : 0;
                      bVal = bVal ? new Date(bVal).getTime() : 0;
                      return reservaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    // Handle numbers
                    if (reservaSortField === 'id_reserva' || reservaSortField === 'qnt_pessoas' || reservaSortField === 'id_mesa' || reservaSortField === 'capacidade' || reservaSortField === 'id_func') {
                      aVal = Number(aVal) || 0;
                      bVal = Number(bVal) || 0;
                      return reservaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    // Convert to strings for comparison
                    aVal = String(aVal).toLowerCase();
                    bVal = String(bVal).toLowerCase();
                    
                    if (reservaSortDirection === 'asc') {
                      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                    } else {
                      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                    }
                  }).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.id_reserva ?? '-'}</td>
                      <td>{item.cliente_cpf ?? '-'}</td>
                      <td>{item.nome ?? '-'}</td>
                      <td>{item.qnt_pessoas ?? '-'}</td>
                      <td>{item.data_hora_chegada ? new Date(item.data_hora_chegada).toLocaleString('pt-BR') : '-'}</td>
                      <td>
                        {item.status_reserva ? (
                          <span className={`status-badge status-${item.status_reserva.toLowerCase().replace('_', '-')}`}>
                            {item.status_reserva}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{item.id_mesa ?? '-'}</td>
                      <td>
                        {item.status_mesa ? (
                          <span className={`status-badge status-${item.status_mesa.toLowerCase()}`}>
                            {item.status_mesa}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{item.capacidade ?? '-'}</td>
                      <td>{item.id_func ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewsPage;

