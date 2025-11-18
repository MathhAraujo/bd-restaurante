import { useState, useEffect } from 'react';
import { clienteAPI } from '../services/api';
import './ClientePage.css';

function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [sortField, setSortField] = useState('cpf');
  const [sortDirection, setSortDirection] = useState('asc');
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    telefone: '',
    data_nascimento: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clienteAPI.getAll();
      setClientes(response.data || []);
    } catch (err) {
      setError('Erro ao carregar clientes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // For "without_reserva", execute search regardless of search term
    if (searchType === 'without_reserva') {
      setLoading(true);
      setError(null);
      try {
        const response = await clienteAPI.getWithoutReserva();
        setClientes(response.data || []);
      } catch (err) {
        setError('Erro na busca: ' + (err.response?.data?.message || err.message));
        setClientes([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For other search types, require a search term
    if (!searchTerm.trim()) {
      loadClientes();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let response;
      if (searchType === 'cpf') {
        response = await clienteAPI.getByCpf(searchTerm);
        setClientes(response.data ? [response.data] : []);
      } else if (searchType === 'nome') {
        response = await clienteAPI.getByNome(searchTerm);
        setClientes(response.data || []);
      } else {
        loadClientes();
      }
    } catch (err) {
      setError('Erro na busca: ' + (err.response?.data?.message || err.message));
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingCliente) {
        await clienteAPI.update(formData);
      } else {
        await clienteAPI.create(formData);
      }
      setShowForm(false);
      setEditingCliente(null);
      resetForm();
      loadClientes();
    } catch (err) {
      setError('Erro ao salvar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      cpf: cliente.cpf || '',
      nome: cliente.nome || '',
      telefone: cliente.telefone || '',
      data_nascimento: cliente.data_nascimento ? cliente.data_nascimento.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (cpf) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    setLoading(true);
    setError(null);
    try {
      await clienteAPI.delete(cpf);
      loadClientes();
    } catch (err) {
      setError('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cpf: '',
      nome: '',
      telefone: '',
      data_nascimento: '',
    });
  };

  return (
    <div className="cliente-page">
      <div className="page-header">
        <h1>👥 Clientes</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingCliente(null); resetForm(); }}>
          + Novo Cliente
        </button>
      </div>

      <div className="search-section">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="search-select">
          <option value="all">Todos</option>
          <option value="cpf">Por CPF</option>
          <option value="nome">Por Nome</option>
          <option value="without_reserva">Sem Reserva</option>
        </select>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
          disabled={searchType === 'without_reserva'}
        />
        <button onClick={handleSearch} className="btn btn-secondary">Buscar</button>
        <button onClick={loadClientes} className="btn btn-secondary">Limpar</button>
      </div>


      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingCliente(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCliente ? 'Editar' : 'Novo'} Cliente</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                  disabled={!!editingCliente}
                />
              </div>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingCliente(null); resetForm(); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm && <div className="loading">Carregando...</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => { setSortField('cpf'); setSortDirection(sortField === 'cpf' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                CPF {sortField === 'cpf' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('nome'); setSortDirection(sortField === 'nome' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Nome {sortField === 'nome' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('telefone'); setSortDirection(sortField === 'telefone' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Telefone {sortField === 'telefone' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => { setSortField('data_nascimento'); setSortDirection(sortField === 'data_nascimento' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                Data de Nascimento {sortField === 'data_nascimento' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">Nenhum cliente encontrado</td>
              </tr>
            ) : (
              [...clientes].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                // Handle null/undefined values
                if (aVal == null) aVal = '';
                if (bVal == null) bVal = '';
                
                // Handle dates
                if (sortField === 'data_nascimento') {
                  aVal = aVal ? new Date(aVal).getTime() : 0;
                  bVal = bVal ? new Date(bVal).getTime() : 0;
                }
                
                // Convert to strings for comparison if not dates
                if (sortField !== 'data_nascimento') {
                  aVal = String(aVal).toLowerCase();
                  bVal = String(bVal).toLowerCase();
                }
                
                if (sortDirection === 'asc') {
                  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else {
                  return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                }
              }).map((cliente) => (
                <tr key={cliente.cpf}>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.telefone || '-'}</td>
                  <td>{cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <button className="btn btn-small btn-primary" onClick={() => handleEdit(cliente)}>
                      Editar
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(cliente.cpf)}>
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
          <h3>Total de Clientes</h3>
          <p className="stat-value">{clientes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Idade Média</h3>
          <p className="stat-value">
            {(() => {
              const validAges = clientes
                .filter(cliente => cliente.data_nascimento)
                .map(cliente => {
                  const birthDate = new Date(cliente.data_nascimento);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  return age;
                });
              return validAges.length > 0
                ? (validAges.reduce((sum, age) => sum + age, 0) / validAges.length).toFixed(2)
                : '0.00';
            })()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Idade Mediana</h3>
          <p className="stat-value">
            {(() => {
              const validAges = clientes
                .filter(cliente => cliente.data_nascimento)
                .map(cliente => {
                  const birthDate = new Date(cliente.data_nascimento);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  return age;
                })
                .sort((a, b) => a - b);
              if (validAges.length === 0) return '0.00';
              const mid = Math.floor(validAges.length / 2);
              return validAges.length % 2 === 0
                ? ((validAges[mid - 1] + validAges[mid]) / 2).toFixed(2)
                : validAges[mid].toFixed(2);
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientePage;

