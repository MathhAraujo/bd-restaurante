import { useState, useEffect } from 'react';
import { comandaAPI } from '../services/api';
import './ComandaPage.css';

const STATUS_COMANDA = ['ABERTA', 'FECHADA', 'PAGA'];

function ComandaPage() {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showComissaoForm, setShowComissaoForm] = useState(false);
  const [editingComanda, setEditingComanda] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [sortField, setSortField] = useState('id_comanda');
  const [sortDirection, setSortDirection] = useState('asc');
  const [newIdMesa, setNewIdMesa] = useState('');
  const [comissaoData, setComissaoData] = useState({ id_comanda: '', percentual: '' });
  const [formData, setFormData] = useState({
    id_comanda: '',
    id_mesa: '',
    total: '',
    data_hora_criacao: '',
    status_comanda: 'ABERTA',
  });

  useEffect(() => {
    loadComandas();
  }, []);

  const loadComandas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await comandaAPI.getAll();
      setComandas(response.data || []);
    } catch (err) {
      setError('Erro ao carregar comandas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      loadComandas();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await comandaAPI.getById(parseInt(searchId));
      setComandas(response.data ? [response.data] : []);
    } catch (err) {
      setError('Erro na busca: ' + (err.response?.data?.message || err.message));
      setComandas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await comandaAPI.create(parseInt(newIdMesa));
      setShowCreateForm(false);
      setNewIdMesa('');
      loadComandas();
    } catch (err) {
      setError('Erro ao criar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddComissao = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await comandaAPI.addComissao({
        id_comanda: parseInt(comissaoData.id_comanda),
        percentual: parseFloat(comissaoData.percentual),
      });
      setShowComissaoForm(false);
      setComissaoData({ id_comanda: '', percentual: '' });
      loadComandas();
    } catch (err) {
      setError('Erro ao adicionar comissão: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const comandaData = {
        ...formData,
        id_comanda: parseInt(formData.id_comanda),
        id_mesa: parseInt(formData.id_mesa),
        total: parseFloat(formData.total) || 0,
      };
      await comandaAPI.update(comandaData);
      setShowForm(false);
      setEditingComanda(null);
      resetForm();
      loadComandas();
    } catch (err) {
      setError('Erro ao salvar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comanda) => {
    setEditingComanda(comanda);
    setFormData({
      id_comanda: comanda.id_comanda || '',
      id_mesa: comanda.id_mesa || '',
      total: comanda.total || '',
      data_hora_criacao: comanda.data_hora_criacao ? comanda.data_hora_criacao.split('T')[0] + 'T' + comanda.data_hora_criacao.split('T')[1]?.substring(0, 5) : '',
      status_comanda: comanda.status_comanda || 'ABERTA',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta comanda?')) return;

    setLoading(true);
    setError(null);
    try {
      await comandaAPI.delete(id);
      loadComandas();
    } catch (err) {
      setError('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_comanda: '',
      id_mesa: '',
      total: '',
      data_hora_criacao: '',
      status_comanda: 'ABERTA',
    });
  };

  return (
    <div className="comanda-page">
      <div className="page-header">
        <h1>🧾 Comandas</h1>
        <div>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + Nova Comanda
          </button>
          <button className="btn btn-secondary" onClick={() => setShowComissaoForm(true)} style={{ marginLeft: '10px' }}>
            + Adicionar Desconto
          </button>
        </div>
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
        <button onClick={loadComandas} className="btn btn-secondary">Limpar</button>
      </div>


      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setNewIdMesa(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Comanda</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>ID Mesa *</label>
                <input
                  type="number"
                  value={newIdMesa}
                  onChange={(e) => setNewIdMesa(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreateForm(false); setNewIdMesa(''); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showComissaoForm && (
        <div className="modal-overlay" onClick={() => { setShowComissaoForm(false); setComissaoData({ id_comanda: '', percentual: '' }); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Adicionar Desconto</h2>
            <form onSubmit={handleAddComissao}>
              <div className="form-group">
                <label>ID Comanda *</label>
                <input
                  type="number"
                  value={comissaoData.id_comanda}
                  onChange={(e) => setComissaoData({ ...comissaoData, id_comanda: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Percentual *</label>
                <input
                  type="number"
                  step="0.01"
                  value={comissaoData.percentual}
                  onChange={(e) => setComissaoData({ ...comissaoData, percentual: e.target.value })}
                  required
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowComissaoForm(false); setComissaoData({ id_comanda: '', percentual: '' }); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingComanda(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Comanda</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ID Comanda</label>
                <input
                  type="number"
                  value={formData.id_comanda}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>ID Mesa *</label>
                <input
                  type="number"
                  value={formData.id_mesa}
                  onChange={(e) => setFormData({ ...formData, id_mesa: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status_comanda}
                  onChange={(e) => setFormData({ ...formData, status_comanda: e.target.value })}
                  required
                >
                  {STATUS_COMANDA.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingComanda(null); resetForm(); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm && !showCreateForm && !showComissaoForm && <div className="loading">Carregando...</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => { setSortField('id_comanda'); setSortDirection(sortField === 'id_comanda' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID {sortField === 'id_comanda' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('id_mesa'); setSortDirection(sortField === 'id_mesa' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                ID Mesa {sortField === 'id_mesa' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('total'); setSortDirection(sortField === 'total' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('data_hora_criacao'); setSortDirection(sortField === 'data_hora_criacao' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Data/Hora Criação {sortField === 'data_hora_criacao' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('status_comanda'); setSortDirection(sortField === 'status_comanda' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Status {sortField === 'status_comanda' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {comandas.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">Nenhuma comanda encontrada</td>
              </tr>
            ) : (
              [...comandas].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                if (aVal == null) aVal = sortField === 'id_comanda' || sortField === 'id_mesa' || sortField === 'total' ? 0 : '';
                if (bVal == null) bVal = sortField === 'id_comanda' || sortField === 'id_mesa' || sortField === 'total' ? 0 : '';
                
                if (sortField === 'data_hora_criacao') {
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
              }).map((comanda) => (
                <tr key={comanda.id_comanda}>
                  <td>{comanda.id_comanda}</td>
                  <td>{comanda.id_mesa}</td>
                  <td>R$ {comanda.total?.toFixed(2) || '0.00'}</td>
                  <td>{comanda.data_hora_criacao ? new Date(comanda.data_hora_criacao).toLocaleString('pt-BR') : '-'}</td>
                  <td>
                    <span className={`status-badge status-${comanda.status_comanda?.toLowerCase()}`}>
                      {comanda.status_comanda}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-small btn-primary" onClick={() => handleEdit(comanda)}>
                      Editar
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(comanda.id_comanda)}>
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
          <h3>Total de Comandas</h3>
          <p className="stat-value">{comandas.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Médio</h3>
          <p className="stat-value">
            {comandas.length > 0
              ? `R$ ${(comandas.reduce((sum, comanda) => sum + (comanda.total || 0), 0) / comandas.length).toFixed(2)}`
              : 'R$ 0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Máximo</h3>
          <p className="stat-value">
            {comandas.length > 0
              ? `R$ ${Math.max(...comandas.map(comanda => comanda.total || 0)).toFixed(2)}`
              : 'R$ 0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Mínimo</h3>
          <p className="stat-value">
            {comandas.length > 0
              ? `R$ ${Math.min(...comandas.map(comanda => comanda.total || 0)).toFixed(2)}`
              : 'R$ 0.00'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Mediano</h3>
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
          <h3>Desvio Padrão</h3>
          <p className="stat-value">
            {(() => {
              if (comandas.length === 0) return 'R$ 0.00';
              const totals = comandas.map(comanda => comanda.total || 0);
              const mean = totals.reduce((sum, val) => sum + val, 0) / totals.length;
              const variance = totals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totals.length;
              const stdDev = Math.sqrt(variance);
              return `R$ ${stdDev.toFixed(2)}`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComandaPage;

