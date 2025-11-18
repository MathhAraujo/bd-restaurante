import { useState, useEffect } from 'react';
import { dataAPI } from '../services/api';
import './LogsPage.css';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('data_registro');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataAPI.getComandaPagaLog();
      setLogs(response.data || []);
    } catch (err) {
      setError('Erro ao carregar logs: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && logs.length === 0) {
    return <div className="loading">Carregando logs...</div>;
  }

  return (
    <div className="logs-page">
      <div className="page-header">
        <h1>📋 Logs</h1>
        <button className="btn btn-primary" onClick={loadLogs}>
          Atualizar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Carregando...</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => { setSortField('id_log'); setSortDirection(sortField === 'id_log' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID Log {sortField === 'id_log' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('id_comanda'); setSortDirection(sortField === 'id_comanda' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID Comanda {sortField === 'id_comanda' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('cpf_cliente'); setSortDirection(sortField === 'cpf_cliente' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                CPF Cliente {sortField === 'cpf_cliente' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('nome_cliente'); setSortDirection(sortField === 'nome_cliente' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Nome Cliente {sortField === 'nome_cliente' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('id_reserva'); setSortDirection(sortField === 'id_reserva' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID Reserva {sortField === 'id_reserva' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('total_comanda'); setSortDirection(sortField === 'total_comanda' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Total {sortField === 'total_comanda' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('data_hora_criacao'); setSortDirection(sortField === 'data_hora_criacao' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Data/Hora Criação {sortField === 'data_hora_criacao' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('status_comanda'); setSortDirection(sortField === 'status_comanda' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Status {sortField === 'status_comanda' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('id_func_garcom'); setSortDirection(sortField === 'id_func_garcom' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID Func. Garçom {sortField === 'id_func_garcom' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('data_registro'); setSortDirection(sortField === 'data_registro' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Data Registro {sortField === 'data_registro' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty-state">Nenhum log encontrado</td>
              </tr>
            ) : (
              [...logs].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                // Handle null/undefined values
                if (aVal == null) aVal = sortField === 'id_log' || sortField === 'id_comanda' || sortField === 'id_reserva' || sortField === 'total_comanda' || sortField === 'id_func_garcom' ? 0 : '';
                if (bVal == null) bVal = sortField === 'id_log' || sortField === 'id_comanda' || sortField === 'id_reserva' || sortField === 'total_comanda' || sortField === 'id_func_garcom' ? 0 : '';
                
                // Handle dates
                if (sortField === 'data_hora_criacao' || sortField === 'data_registro') {
                  aVal = aVal ? new Date(aVal).getTime() : 0;
                  bVal = bVal ? new Date(bVal).getTime() : 0;
                  return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                // Handle numbers
                if (sortField === 'id_log' || sortField === 'id_comanda' || sortField === 'id_reserva' || sortField === 'total_comanda' || sortField === 'id_func_garcom') {
                  aVal = Number(aVal) || 0;
                  bVal = Number(bVal) || 0;
                  return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                // Convert to strings for comparison
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
                
                if (sortDirection === 'asc') {
                  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else {
                  return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                }
              }).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.id_log ?? '-'}</td>
                  <td>{item.id_comanda ?? '-'}</td>
                  <td>{item.cpf_cliente ?? '-'}</td>
                  <td>{item.nome_cliente ?? '-'}</td>
                  <td>{item.id_reserva ?? '-'}</td>
                  <td>R$ {item.total_comanda?.toFixed(2) || '0.00'}</td>
                  <td>{item.data_hora_criacao ? new Date(item.data_hora_criacao).toLocaleString('pt-BR') : '-'}</td>
                  <td>
                    {item.status_comanda ? (
                      <span className={`status-badge status-${item.status_comanda.toLowerCase()}`}>
                        {item.status_comanda}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{item.id_func_garcom ?? '-'}</td>
                  <td>{item.data_registro ? new Date(item.data_registro).toLocaleString('pt-BR') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="statistics-section">
        <div className="stat-card">
          <h3>Total de Logs</h3>
          <p className="stat-value">{logs.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Arrecadado</h3>
          <p className="stat-value">
            {logs.length > 0
              ? `R$ ${logs.reduce((sum, log) => sum + (log.total_comanda || 0), 0).toFixed(2)}`
              : 'R$ 0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Média por Comanda</h3>
          <p className="stat-value">
            {logs.length > 0
              ? `R$ ${(logs.reduce((sum, log) => sum + (log.total_comanda || 0), 0) / logs.length).toFixed(2)}`
              : 'R$ 0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogsPage;

