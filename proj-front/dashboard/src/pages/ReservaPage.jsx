import { useState, useEffect } from 'react';
import { reservaAPI, comandaAPI } from '../services/api';
import './ReservaPage.css';

const STATUS_RESERVA = ['ABERTA', 'EM_ATENDIMENTO', 'FECHADA', 'CANCELADA'];

function ReservaPage() {
  const [reservas, setReservas] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [searchType, setSearchType] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [periodData, setPeriodData] = useState({ init: '', end: '' });
  const [sortField, setSortField] = useState('id_reserva');
  const [sortDirection, setSortDirection] = useState('asc');
  const [formData, setFormData] = useState({
    id_reserva: '',
    cliente_cpf: '',
    qnt_pessoas: '',
    data_hora_chegada: '',
    status_reserva: 'ABERTA',
  });

  useEffect(() => {
    loadReservas();
    loadComandas();
  }, []);

  const loadComandas = async () => {
    try {
      const response = await comandaAPI.getAll();
      setComandas(response.data || []);
    } catch (err) {
      // Silently fail for comandas, it's just for statistics
      console.error('Erro ao carregar comandas para estatísticas:', err);
    }
  };

  const loadReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservaAPI.getAll();
      setReservas(response.data || []);
    } catch (err) {
      setError('Erro ao carregar reservas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim() && searchType !== 'bigger_than') {
      loadReservas();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let response;
      if (searchType === 'id') {
        response = await reservaAPI.getById(parseInt(searchValue));
        setReservas(response.data ? [response.data] : []);
      } else if (searchType === 'cpf') {
        response = await reservaAPI.getByCpf(searchValue);
        setReservas(response.data || []);
      } else if (searchType === 'future') {
        response = await reservaAPI.getFuture(searchValue);
        setReservas(response.data || []);
      } else if (searchType === 'bigger_than') {
        response = await reservaAPI.getFutureBiggerThan(parseInt(searchValue));
        setReservas(response.data || []);
      } else {
        loadReservas();
      }
    } catch (err) {
      setError('Erro na busca: ' + (err.response?.data?.message || err.message));
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await reservaAPI.getByPeriod({
        init: periodData.init + 'T00:00:00',
        end: periodData.end + 'T23:59:59',
      });
      setReservas(response.data || []);
      setShowPeriodForm(false);
      setPeriodData({ init: '', end: '' });
    } catch (err) {
      setError('Erro na busca por período: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reservaData = {
        ...formData,
        id_reserva: formData.id_reserva ? parseInt(formData.id_reserva) : undefined,
        qnt_pessoas: parseInt(formData.qnt_pessoas),
        data_hora_chegada: formData.data_hora_chegada + ':00',
      };
      if (editingReserva) {
        await reservaAPI.update(reservaData);
      } else {
        await reservaAPI.create(reservaData);
      }
      setShowForm(false);
      setEditingReserva(null);
      resetForm();
      loadReservas();
      loadComandas();
    } catch (err) {
      setError('Erro ao salvar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    const dateTime = reserva.data_hora_chegada ? new Date(reserva.data_hora_chegada) : new Date();
    const dateStr = dateTime.toISOString().slice(0, 16);
    setFormData({
      id_reserva: reserva.id_reserva || '',
      cliente_cpf: reserva.cliente_cpf || '',
      qnt_pessoas: reserva.qnt_pessoas || '',
      data_hora_chegada: dateStr,
      status_reserva: reserva.status_reserva || 'ABERTA',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta reserva?')) return;

    setLoading(true);
    setError(null);
    try {
      await reservaAPI.deleteById(id);
      loadReservas();
      loadComandas();
    } catch (err) {
      setError('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_reserva: '',
      cliente_cpf: '',
      qnt_pessoas: '',
      data_hora_chegada: '',
      status_reserva: 'ABERTA',
    });
  };

  return (
    <div className="reserva-page">
      <div className="page-header">
        <h1>📅 Reservas</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingReserva(null); resetForm(); }}>
          + Nova Reserva
        </button>
      </div>

      <div className="search-section">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="search-select">
          <option value="all">Todas</option>
          <option value="id">Por ID</option>
          <option value="cpf">Por CPF</option>
          <option value="future">Futuras por CPF</option>
          <option value="bigger_than">Futuras com mais de X pessoas</option>
        </select>
        <input
          type={searchType === 'bigger_than' ? 'number' : 'text'}
          placeholder={searchType === 'bigger_than' ? 'Quantidade de pessoas...' : 'Buscar...'}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button onClick={handleSearch} className="btn btn-secondary">Buscar</button>
        <button onClick={() => setShowPeriodForm(true)} className="btn btn-secondary">Buscar por Período</button>
        <button onClick={loadReservas} className="btn btn-secondary">Limpar</button>
      </div>


      {error && <div className="error-message">{error}</div>}

      {showPeriodForm && (
        <div className="modal-overlay" onClick={() => { setShowPeriodForm(false); setPeriodData({ init: '', end: '' }); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Buscar por Período</h2>
            <form onSubmit={handlePeriodSearch}>
              <div className="form-group">
                <label>Data Inicial *</label>
                <input
                  type="date"
                  value={periodData.init}
                  onChange={(e) => setPeriodData({ ...periodData, init: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data Final *</label>
                <input
                  type="date"
                  value={periodData.end}
                  onChange={(e) => setPeriodData({ ...periodData, end: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowPeriodForm(false); setPeriodData({ init: '', end: '' }); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingReserva(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingReserva ? 'Editar' : 'Nova'} Reserva</h2>
            <form onSubmit={handleSubmit}>
              {editingReserva && (
                <div className="form-group">
                  <label>ID Reserva</label>
                  <input
                    type="number"
                    value={formData.id_reserva}
                    disabled
                  />
                </div>
              )}
              <div className="form-group">
                <label>CPF Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente_cpf}
                  onChange={(e) => setFormData({ ...formData, cliente_cpf: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantidade de Pessoas *</label>
                <input
                  type="number"
                  value={formData.qnt_pessoas}
                  onChange={(e) => setFormData({ ...formData, qnt_pessoas: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Data/Hora Chegada *</label>
                <input
                  type="datetime-local"
                  value={formData.data_hora_chegada}
                  onChange={(e) => setFormData({ ...formData, data_hora_chegada: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status_reserva}
                  onChange={(e) => setFormData({ ...formData, status_reserva: e.target.value })}
                  required
                >
                  {STATUS_RESERVA.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingReserva(null); resetForm(); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm && !showPeriodForm && <div className="loading">Carregando...</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => { setSortField('id_reserva'); setSortDirection(sortField === 'id_reserva' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID {sortField === 'id_reserva' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('cliente_cpf'); setSortDirection(sortField === 'cliente_cpf' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                CPF Cliente {sortField === 'cliente_cpf' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('qnt_pessoas'); setSortDirection(sortField === 'qnt_pessoas' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Qnt. Pessoas {sortField === 'qnt_pessoas' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('data_hora_chegada'); setSortDirection(sortField === 'data_hora_chegada' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Data/Hora Chegada {sortField === 'data_hora_chegada' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('status_reserva'); setSortDirection(sortField === 'status_reserva' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Status {sortField === 'status_reserva' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">Nenhuma reserva encontrada</td>
              </tr>
            ) : (
              [...reservas].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                if (aVal == null) aVal = sortField === 'id_reserva' || sortField === 'qnt_pessoas' ? 0 : '';
                if (bVal == null) bVal = sortField === 'id_reserva' || sortField === 'qnt_pessoas' ? 0 : '';
                
                if (sortField === 'data_hora_chegada') {
                  aVal = aVal ? new Date(aVal).getTime() : 0;
                  bVal = bVal ? new Date(bVal).getTime() : 0;
                  return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                  return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
                
                if (sortDirection === 'asc') {
                  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else {
                  return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                }
              }).map((reserva) => (
                <tr key={reserva.id_reserva}>
                  <td>{reserva.id_reserva}</td>
                  <td>{reserva.cliente_cpf}</td>
                  <td>{reserva.qnt_pessoas}</td>
                  <td>{reserva.data_hora_chegada ? new Date(reserva.data_hora_chegada).toLocaleString('pt-BR') : '-'}</td>
                  <td>
                    <span className={`status-badge status-${reserva.status_reserva?.toLowerCase().replace('_', '-')}`}>
                      {reserva.status_reserva}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-small btn-primary" onClick={() => handleEdit(reserva)}>
                      Editar
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(reserva.id_reserva)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics Section */}
      <div className="statistics-section">
        <div className="stat-card">
          <h3>Total de Reservas</h3>
          <p className="stat-value">{reservas.length}</p>
        </div>
        <div className="stat-card">
          <h3>Média de Pessoas por Reserva</h3>
          <p className="stat-value">
            {reservas.length > 0
              ? (reservas.reduce((sum, reserva) => sum + (reserva.qnt_pessoas || 0), 0) / reservas.length).toFixed(2)
              : '0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Mediana de Pessoas por Reserva</h3>
          <p className="stat-value">
            {(() => {
              if (reservas.length === 0) return '0.00';
              const pessoas = reservas.map(reserva => reserva.qnt_pessoas || 0).sort((a, b) => a - b);
              const mid = Math.floor(pessoas.length / 2);
              return pessoas.length % 2 === 0
                ? ((pessoas[mid - 1] + pessoas[mid]) / 2).toFixed(2)
                : pessoas[mid].toFixed(2);
            })()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Gasto Médio no Restaurante</h3>
          <p className="stat-value">
            {comandas.length > 0
              ? `R$ ${(comandas.reduce((sum, comanda) => sum + (comanda.total || 0), 0) / comandas.length).toFixed(2)}`
              : 'R$ 0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Gasto Mediano no Restaurante</h3>
          <p className="stat-value">
            {(() => {
              if (comandas.length === 0) return 'R$ 0.00';
              const totals = comandas.map(comanda => comanda.total || 0).sort((a, b) => a - b);
              const mid = Math.floor(totals.length / 2);
              const median = totals.length % 2 === 0
                ? (totals[mid - 1] + totals[mid]) / 2
                : totals[mid];
              return `R$ ${median.toFixed(2)}`;
            })()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Horário Mais Comum</h3>
          <p className="stat-value">
            {(() => {
              const hourCounts = {};
              reservas.forEach(reserva => {
                if (reserva.data_hora_chegada) {
                  const date = new Date(reserva.data_hora_chegada);
                  const hour = date.getHours();
                  hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                }
              });
              const hourKeys = Object.keys(hourCounts).map(Number);
              if (hourKeys.length === 0) return '-';
              const mostCommonHour = hourKeys.reduce((a, b) => 
                hourCounts[a] > hourCounts[b] ? a : b
              );
              return `${String(mostCommonHour).padStart(2, '0')}:00`;
            })()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Horário Menos Comum</h3>
          <p className="stat-value">
            {(() => {
              const hourCounts = {};
              reservas.forEach(reserva => {
                if (reserva.data_hora_chegada) {
                  const date = new Date(reserva.data_hora_chegada);
                  const hour = date.getHours();
                  hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                }
              });
              const hourKeys = Object.keys(hourCounts).map(Number);
              if (hourKeys.length === 0) return '-';
              const leastCommonHour = hourKeys.reduce((a, b) => 
                hourCounts[a] < hourCounts[b] ? a : b
              );
              return `${String(leastCommonHour).padStart(2, '0')}:00`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReservaPage;

