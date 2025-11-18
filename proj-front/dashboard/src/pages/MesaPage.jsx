import { useState, useEffect } from 'react';
import { mesaAPI, dataAPI } from '../services/api';
import './MesaPage.css';

const STATUS_MESA = ['LIVRE', 'OCUPADA', 'RESERVADA'];

function MesaPage() {
  const [mesas, setMesas] = useState([]);
  const [occupationPercent, setOccupationPercent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMesa, setEditingMesa] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [newCapacidade, setNewCapacidade] = useState('');
  const [sortField, setSortField] = useState('id_mesa');
  const [sortDirection, setSortDirection] = useState('asc');
  const [formData, setFormData] = useState({
    id_mesa: '',
    id_func: '',
    id_reserva: '',
    status_mesa: 'LIVRE',
    capacidade: '',
  });

  useEffect(() => {
    loadMesas();
    loadOccupationPercent();
  }, []);

  const loadOccupationPercent = async () => {
    try {
      const response = await dataAPI.getOccupationPercent();
      setOccupationPercent(response.data);
    } catch (err) {
      console.error('Erro ao carregar percentual de ocupação:', err);
    }
  };

  const loadMesas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mesaAPI.getAll();
      setMesas(response.data || []);
    } catch (err) {
      setError('Erro ao carregar mesas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      loadMesas();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await mesaAPI.getById(parseInt(searchId));
      setMesas(response.data ? [response.data] : []);
    } catch (err) {
      setError('Erro na busca: ' + (err.response?.data?.message || err.message));
      setMesas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await mesaAPI.create(parseInt(newCapacidade));
      setShowCreateForm(false);
      setNewCapacidade('');
      loadMesas();
      loadOccupationPercent();
    } catch (err) {
      setError('Erro ao criar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const mesaData = {
        ...formData,
        id_mesa: parseInt(formData.id_mesa),
        id_func: formData.id_func ? parseInt(formData.id_func) : null,
        id_reserva: formData.id_reserva ? parseInt(formData.id_reserva) : null,
        capacidade: parseInt(formData.capacidade),
      };
      await mesaAPI.update(mesaData);
      setShowForm(false);
      setEditingMesa(null);
      resetForm();
      loadMesas();
      loadOccupationPercent();
    } catch (err) {
      setError('Erro ao salvar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mesa) => {
    setEditingMesa(mesa);
    setFormData({
      id_mesa: mesa.id_mesa || '',
      id_func: mesa.id_func || '',
      id_reserva: mesa.id_reserva || '',
      status_mesa: mesa.status_mesa || 'LIVRE',
      capacidade: mesa.capacidade || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mesa?')) return;

    setLoading(true);
    setError(null);
    try {
      await mesaAPI.delete(id);
      loadMesas();
      loadOccupationPercent();
    } catch (err) {
      setError('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_mesa: '',
      id_func: '',
      id_reserva: '',
      status_mesa: 'LIVRE',
      capacidade: '',
    });
  };

  return (
    <div className="mesa-page">
      <div className="page-header">
        <h1>🪑 Mesas</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          + Nova Mesa
        </button>
      </div>

      <div className="search-section">
        <input
          type="number"
          placeholder="Buscar por ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button onClick={handleSearch} className="btn btn-secondary">Buscar</button>
        <button onClick={loadMesas} className="btn btn-secondary">Limpar</button>
      </div>


      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setNewCapacidade(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Mesa</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Capacidade *</label>
                <input
                  type="number"
                  value={newCapacidade}
                  onChange={(e) => setNewCapacidade(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreateForm(false); setNewCapacidade(''); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingMesa(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Mesa</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ID Mesa</label>
                <input
                  type="number"
                  value={formData.id_mesa}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>ID Funcionário</label>
                <input
                  type="number"
                  value={formData.id_func}
                  onChange={(e) => setFormData({ ...formData, id_func: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>ID Reserva</label>
                <input
                  type="number"
                  value={formData.id_reserva}
                  onChange={(e) => setFormData({ ...formData, id_reserva: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status_mesa}
                  onChange={(e) => setFormData({ ...formData, status_mesa: e.target.value })}
                  required
                >
                  {STATUS_MESA.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Capacidade *</label>
                <input
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingMesa(null); resetForm(); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm && !showCreateForm && <div className="loading">Carregando...</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => { setSortField('id_mesa'); setSortDirection(sortField === 'id_mesa' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID {sortField === 'id_mesa' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('id_func'); setSortDirection(sortField === 'id_func' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID Funcionário {sortField === 'id_func' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>ID Reserva</th>
              <th className="sortable" onClick={() => { setSortField('status_mesa'); setSortDirection(sortField === 'status_mesa' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Status {sortField === 'status_mesa' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('capacidade'); setSortDirection(sortField === 'capacidade' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Capacidade {sortField === 'capacidade' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {mesas.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">Nenhuma mesa encontrada</td>
              </tr>
            ) : (
              [...mesas].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                if (aVal == null) aVal = sortField === 'id_mesa' || sortField === 'capacidade' || sortField === 'id_func' ? 0 : '';
                if (bVal == null) bVal = sortField === 'id_mesa' || sortField === 'capacidade' || sortField === 'id_func' ? 0 : '';
                
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
              }).map((mesa) => (
                <tr key={mesa.id_mesa}>
                  <td>{mesa.id_mesa}</td>
                  <td>{mesa.id_func || '-'}</td>
                  <td>{mesa.id_reserva || '-'}</td>
                  <td>
                    <span className={`status-badge status-${mesa.status_mesa?.toLowerCase()}`}>
                      {mesa.status_mesa}
                    </span>
                  </td>
                  <td>{mesa.capacidade}</td>
                  <td>
                    <button className="btn btn-small btn-primary" onClick={() => handleEdit(mesa)}>
                      Editar
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(mesa.id_mesa)}>
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
          <h3>Total de Mesas</h3>
          <p className="stat-value">{mesas.length}</p>
        </div>
        <div className="stat-card">
          <h3>Capacidade Média</h3>
          <p className="stat-value">
            {mesas.length > 0
              ? (mesas.reduce((sum, mesa) => sum + (mesa.capacidade || 0), 0) / mesas.length).toFixed(2)
              : '0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Capacidade Máxima</h3>
          <p className="stat-value">
            {mesas.length > 0
              ? Math.max(...mesas.map(mesa => mesa.capacidade || 0))
              : '0'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Capacidade Mínima</h3>
          <p className="stat-value">
            {mesas.length > 0
              ? Math.min(...mesas.map(mesa => mesa.capacidade || 0))
              : '0'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Capacidade Mediana</h3>
          <p className="stat-value">
            {(() => {
              if (mesas.length === 0) return '0.00';
              const capacidades = mesas.map(mesa => mesa.capacidade || 0).sort((a, b) => a - b);
              const mid = Math.floor(capacidades.length / 2);
              return capacidades.length % 2 === 0
                ? ((capacidades[mid - 1] + capacidades[mid]) / 2).toFixed(2)
                : capacidades[mid].toFixed(2);
            })()}
          </p>
        </div>
        {occupationPercent?.ocupacao !== undefined && (
          <div className="stat-card">
            <h3>Percentual de Ocupação</h3>
            <p className="stat-value">{occupationPercent.ocupacao.toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MesaPage;

