import { useState, useEffect } from 'react';
import { dataAPI } from '../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './DataPage.css';

const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];

function DataPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Views states
  const [mesaFull, setMesaFull] = useState([]);
  const [reservaFutureFull, setReservaFutureFull] = useState([]);
  const [clienteBiggerAvg, setClienteBiggerAvg] = useState([]);
  const [mesaOcupada, setMesaOcupada] = useState([]);
  const [clienteCancelada, setClienteCancelada] = useState([]);
  
  // Logs states
  const [logs, setLogs] = useState([]);
  
  // Sorting states for Views - Mesas Completas
  const [mesaSortField, setMesaSortField] = useState('id_mesa');
  const [mesaSortDirection, setMesaSortDirection] = useState('asc');
  
  // Sorting states for Views - Reservas Completas
  const [reservaSortField, setReservaSortField] = useState('id_reserva');
  const [reservaSortDirection, setReservaSortDirection] = useState('asc');
  
  // Sorting states for Views - Clientes com Reservas Maiores que a Média
  const [clienteBiggerAvgSortField, setClienteBiggerAvgSortField] = useState('cliente_cpf');
  const [clienteBiggerAvgSortDirection, setClienteBiggerAvgSortDirection] = useState('asc');
  
  // Sorting states for Views - Mesas Ocupadas Completas
  const [mesaOcupadaSortField, setMesaOcupadaSortField] = useState('id_mesa');
  const [mesaOcupadaSortDirection, setMesaOcupadaSortDirection] = useState('asc');
  
  // Sorting states for Views - Clientes com Reservas Canceladas
  const [clienteCanceladaSortField, setClienteCanceladaSortField] = useState('cliente_cpf');
  const [clienteCanceladaSortDirection, setClienteCanceladaSortDirection] = useState('asc');
  
  // Sorting states for Logs
  const [logsSortField, setLogsSortField] = useState('data_registro');
  const [logsSortDirection, setLogsSortDirection] = useState('desc');

  useEffect(() => {
    loadAllData();
    loadViewsData();
    loadLogsData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        reservaDay, reservaMonth, peakHour, groupSize, clienteArea,
        occupationPercent, reservaFuture, clienteSpent
      ] = await Promise.all([
        dataAPI.getReservaDay(),
        dataAPI.getReservaCountMonth(),
        dataAPI.getPeakReservaHour(),
        dataAPI.getGroupSizeDistribution(),
        dataAPI.getClienteAreaDistribution(),
        dataAPI.getOccupationPercent(),
        dataAPI.getReservaFutureFull(),
        dataAPI.getClienteTotalSpent(),
      ]);

      setData({
        reservaDay: reservaDay.data || [],
        reservaMonth: reservaMonth.data || [],
        peakHour: peakHour.data || [],
        groupSize: groupSize.data || [],
        clienteArea: clienteArea.data || [],
        occupationPercent: occupationPercent.data || {},
        reservaFuture: reservaFuture.data || [],
        clienteSpent: clienteSpent.data || [],
      });
    } catch (err) {
      setError('Erro ao carregar dados: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadViewsData = async () => {
    try {
      const [
        mesaFullResponse, 
        reservaFutureFullResponse,
        clienteBiggerAvgResponse,
        mesaOcupadaResponse,
        clienteCanceladaResponse
      ] = await Promise.all([
        dataAPI.getMesaFull(),
        dataAPI.getReservaFutureFull(),
        dataAPI.getClienteReservaBiggerAvg(),
        dataAPI.getMesaOcupadaFull(),
        dataAPI.getClienteReservaCancelada(),
      ]);
      setMesaFull(mesaFullResponse.data || []);
      setReservaFutureFull(reservaFutureFullResponse.data || []);
      setClienteBiggerAvg(clienteBiggerAvgResponse.data || []);
      setMesaOcupada(mesaOcupadaResponse.data || []);
      setClienteCancelada(clienteCanceladaResponse.data || []);
    } catch (err) {
      console.error('Erro ao carregar views:', err);
    }
  };

  const loadLogsData = async () => {
    try {
      const response = await dataAPI.getComandaPagaLog();
      setLogs(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  };

  if (loading) {
    return <div className="loading">Carregando dados...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="data-page">
      <div className="page-header">
        <h1>📈 Analytics</h1>
        <button className="btn btn-primary" onClick={() => {
          loadAllData();
          loadViewsData();
          loadLogsData();
        }}>
          Atualizar Dados
        </button>
      </div>

      <div className="tabs-section">
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'views' ? 'active' : ''}`}
          onClick={() => setActiveTab('views')}
        >
          👁️ Views
        </button>
        <button 
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="charts-grid">
        {/* Reservations per Day */}
        {data.reservaDay && data.reservaDay.length > 0 && (() => {
          // Day order: Sunday through Saturday
          const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayOrderPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
          
          // Create a map of existing data (case-insensitive)
          const dataMap = {};
          data.reservaDay.forEach(item => {
            const dayKey = item.day ? item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase() : '';
            dataMap[dayKey] = item;
          });
          
          // Create array with all days, including missing ones with 0 values
          const chartData = dayOrder.map((day, index) => {
            const dayData = dataMap[day];
            return {
              day: dayOrderPt[index],
              num_reserva: dayData ? dayData.num_reserva : 0,
              total_ppl: dayData ? dayData.total_ppl : 0
            };
          });

          return (
            <div className="chart-card">
              <h2>Ocupação por Dia</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                  <Legend />
                  <Bar dataKey="num_reserva" fill="#3498db" name="Número de Reservas" />
                  <Bar dataKey="total_ppl" fill="#2ecc71" name="Total de Pessoas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Reservations per Month */}
        {data.reservaMonth && data.reservaMonth.length > 0 && (
          <div className="chart-card">
            <h2>Reservas por Mês</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.reservaMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_ano" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                <Legend />
                <Line type="monotone" dataKey="qnt" stroke="#3498db" name="Quantidade" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Peak Hours */}
        {data.peakHour && data.peakHour.length > 0 && (
          <div className="chart-card">
            <h2>Horários de Pico</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.peakHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="horario" label={{ value: 'Hora', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Reservas', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                <Legend />
                <Bar dataKey="qnt_reservas" fill="#e74c3c" name="Quantidade de Reservas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Group Size Distribution */}
        {data.groupSize && data.groupSize.length > 0 && (
          <div className="chart-card">
            <h2>Distribuição de Tamanho de Grupo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.groupSize}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ qnt_pessoas, qnt_reserva }) => `${qnt_pessoas} pessoas: ${qnt_reserva}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="qnt_reserva"
                >
                  {data.groupSize.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cliente Area Distribution */}
        {data.clienteArea && data.clienteArea.length > 0 && (
          <div className="chart-card">
            <h2>Distribuição de Clientes por Área</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.clienteArea} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="area" type="category" width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                <Legend />
                <Bar dataKey="qnt_cliente" fill="#9b59b6" name="Quantidade de Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cliente Total Spent */}
        {data.clienteSpent && data.clienteSpent.length > 0 && (() => {
          // Sort by total_gasto descending and take top 3
          const top3 = [...data.clienteSpent]
            .sort((a, b) => (b.total_gasto || 0) - (a.total_gasto || 0))
            .slice(0, 3)
            .map(item => ({
              nome: item.nome_cliente || item.nome || item.cliente_cpf || item.cpf_cliente || 'Cliente',
              total_gasto: item.total_gasto || 0
            }));

          return top3.length > 0 ? (
            <div className="chart-card">
              <h2>Total Gasto por Cliente (Top 3)</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top3}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                  <Legend />
                  <Bar dataKey="total_gasto" fill="#1abc9c" name="Total Gasto" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null;
        })()}

        {/* Reserva Future Full - Total Pessoas per Day */}
        {data.reservaFuture && data.reservaFuture.length > 0 && (() => {
          // Group by day and sum pessoas
          const pessoasPerDay = data.reservaFuture.reduce((acc, item) => {
            if (!item.data_hora_chegada) return acc;
            const date = new Date(item.data_hora_chegada);
            const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format for sorting
            const dayLabel = date.toLocaleDateString('pt-BR'); // DD/MM/YYYY for display
            const pessoas = item.qnt_pessoas || 0;
            
            if (acc[dayKey]) {
              acc[dayKey].total += pessoas;
            } else {
              acc[dayKey] = {
                day: dayLabel,
                total: pessoas,
                sortKey: dayKey
              };
            }
            return acc;
          }, {});

          // Convert to array and sort by date
          const chartData = Object.values(pessoasPerDay)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

          return chartData.length > 0 ? (
            <div className="chart-card">
              <h2>Total de Pessoas por Dia (Reservas Futuras)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Total de Pessoas', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#e0e0e0' }} />
                  <Legend />
                  <Bar dataKey="total" fill="#3498db" name="Total de Pessoas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null;
        })()}

        </div>
      )}

      {activeTab === 'views' && (
        <div className="views-section">
          {/* Mesas Completas Table */}
          {(() => {
            const allFields = mesaFull.length > 0 ? Object.keys(mesaFull[0]) : [];
            const fieldLabels = {
              id_mesa: 'ID Mesa',
              cpf: 'CPF Cliente',
              nome: 'Nome Cliente',
              telefone: 'Telefone',
              data_nascimento: 'Data Nascimento',
              id_reserva: 'ID Reserva',
              status_mesa: 'Status Mesa',
              capacidade: 'Capacidade',
              id_func: 'ID Funcionário',
              data_hora_chegada: 'Data/Hora Chegada',
              qnt_pessoas: 'Qnt. Pessoas',
              status_reserva: 'Status Reserva',
            };
            
            return (
              <div className="view-card">
                <h2>Mesas Completas</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {allFields.map(field => (
                          <th 
                            key={field}
                            className="sortable" 
                            onClick={() => { 
                              setMesaSortField(field); 
                              setMesaSortDirection(mesaSortField === field && mesaSortDirection === 'asc' ? 'desc' : 'asc'); 
                            }}
                          >
                            {fieldLabels[field] || field} {mesaSortField === field && (mesaSortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mesaFull.length === 0 ? (
                        <tr>
                          <td colSpan={allFields.length} className="empty-state">Nenhuma mesa encontrada</td>
                        </tr>
                      ) : (
                        [...mesaFull].sort((a, b) => {
                          let aVal = a[mesaSortField];
                          let bVal = b[mesaSortField];
                          
                          if (aVal == null) aVal = ['id_mesa', 'id_reserva', 'capacidade', 'id_func', 'qnt_pessoas'].includes(mesaSortField) ? 0 : '';
                          if (bVal == null) bVal = ['id_mesa', 'id_reserva', 'capacidade', 'id_func', 'qnt_pessoas'].includes(mesaSortField) ? 0 : '';
                          
                          if (mesaSortField === 'data_hora_chegada' || mesaSortField === 'data_nascimento') {
                            aVal = aVal ? new Date(aVal).getTime() : 0;
                            bVal = bVal ? new Date(bVal).getTime() : 0;
                            return mesaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          if (['id_mesa', 'id_reserva', 'capacidade', 'id_func', 'qnt_pessoas'].includes(mesaSortField)) {
                            aVal = Number(aVal) || 0;
                            bVal = Number(bVal) || 0;
                            return mesaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          aVal = String(aVal).toLowerCase();
                          bVal = String(bVal).toLowerCase();
                          
                          if (mesaSortDirection === 'asc') {
                            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                          } else {
                            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                          }
                        }).map((item, idx) => (
                          <tr key={idx}>
                            {allFields.map(field => {
                              let value = item[field];
                              if (value == null) value = '-';
                              else if (field === 'data_hora_chegada' || field === 'data_nascimento') {
                                value = new Date(value).toLocaleString('pt-BR');
                              } else if (field === 'status_mesa' || field === 'status_reserva') {
                                value = value ? (
                                  <span className={`status-badge status-${String(value).toLowerCase().replace('_', '-')}`}>
                                    {value}
                                  </span>
                                ) : '-';
                              }
                              return <td key={field}>{value}</td>;
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Reservas Completas Table */}
          {(() => {
            const allFields = reservaFutureFull.length > 0 ? Object.keys(reservaFutureFull[0]) : [];
            const fieldLabels = {
              id_reserva: 'ID Reserva',
              cliente_cpf: 'CPF Cliente',
              nome: 'Nome Cliente',
              telefone: 'Telefone',
              data_nascimento: 'Data Nascimento',
              qnt_pessoas: 'Qnt. Pessoas',
              data_hora_chegada: 'Data/Hora Chegada',
              status_reserva: 'Status Reserva',
              id_mesa: 'ID Mesa',
              status_mesa: 'Status Mesa',
              capacidade: 'Capacidade',
              id_func: 'ID Funcionário',
            };
            
            return (
              <div className="view-card">
                <h2>Reservas Abertas Futuras Completas</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {allFields.map(field => (
                          <th 
                            key={field}
                            className="sortable" 
                            onClick={() => { 
                              setReservaSortField(field); 
                              setReservaSortDirection(reservaSortField === field && reservaSortDirection === 'asc' ? 'desc' : 'asc'); 
                            }}
                          >
                            {fieldLabels[field] || field} {reservaSortField === field && (reservaSortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reservaFutureFull.length === 0 ? (
                        <tr>
                          <td colSpan={allFields.length} className="empty-state">Nenhuma reserva encontrada</td>
                        </tr>
                      ) : (
                        [...reservaFutureFull].sort((a, b) => {
                          let aVal = a[reservaSortField];
                          let bVal = b[reservaSortField];
                          
                          if (aVal == null) aVal = ['id_reserva', 'qnt_pessoas', 'id_mesa', 'capacidade', 'id_func'].includes(reservaSortField) ? 0 : '';
                          if (bVal == null) bVal = ['id_reserva', 'qnt_pessoas', 'id_mesa', 'capacidade', 'id_func'].includes(reservaSortField) ? 0 : '';
                          
                          if (reservaSortField === 'data_hora_chegada' || reservaSortField === 'data_nascimento') {
                            aVal = aVal ? new Date(aVal).getTime() : 0;
                            bVal = bVal ? new Date(bVal).getTime() : 0;
                            return reservaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          if (['id_reserva', 'qnt_pessoas', 'id_mesa', 'capacidade', 'id_func'].includes(reservaSortField)) {
                            aVal = Number(aVal) || 0;
                            bVal = Number(bVal) || 0;
                            return reservaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          aVal = String(aVal).toLowerCase();
                          bVal = String(bVal).toLowerCase();
                          
                          if (reservaSortDirection === 'asc') {
                            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                          } else {
                            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                          }
                        }).map((item, idx) => (
                          <tr key={idx}>
                            {allFields.map(field => {
                              let value = item[field];
                              if (value == null) value = '-';
                              else if (field === 'data_hora_chegada' || field === 'data_nascimento') {
                                value = new Date(value).toLocaleString('pt-BR');
                              } else if (field === 'status_mesa' || field === 'status_reserva') {
                                value = value ? (
                                  <span className={`status-badge status-${String(value).toLowerCase().replace('_', '-')}`}>
                                    {value}
                                  </span>
                                ) : '-';
                              }
                              return <td key={field}>{value}</td>;
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Clientes com Reservas Maiores que a Média */}
          {(() => {
            const allFields = clienteBiggerAvg.length > 0 ? Object.keys(clienteBiggerAvg[0]) : [];
            const fieldLabels = {
              cliente_cpf: 'CPF Cliente',
              cpf: 'CPF',
              nome: 'Nome',
              telefone: 'Telefone',
              data_nascimento: 'Data Nascimento',
              qnt_pessoas: 'Qnt. Pessoas',
              id_reserva: 'ID Reserva',
            };
            
            return (
              <div className="view-card">
                <h2>Clientes com Reservas Maiores que a Média</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {allFields.map(field => (
                          <th 
                            key={field}
                            className="sortable" 
                            onClick={() => { 
                              setClienteBiggerAvgSortField(field); 
                              setClienteBiggerAvgSortDirection(clienteBiggerAvgSortField === field && clienteBiggerAvgSortDirection === 'asc' ? 'desc' : 'asc'); 
                            }}
                          >
                            {fieldLabels[field] || field} {clienteBiggerAvgSortField === field && (clienteBiggerAvgSortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clienteBiggerAvg.length === 0 ? (
                        <tr>
                          <td colSpan={allFields.length} className="empty-state">Nenhum cliente encontrado</td>
                        </tr>
                      ) : (
                        [...clienteBiggerAvg].sort((a, b) => {
                          let aVal = a[clienteBiggerAvgSortField];
                          let bVal = b[clienteBiggerAvgSortField];
                          
                          if (aVal == null) aVal = ['qnt_pessoas', 'id_reserva'].includes(clienteBiggerAvgSortField) ? 0 : '';
                          if (bVal == null) bVal = ['qnt_pessoas', 'id_reserva'].includes(clienteBiggerAvgSortField) ? 0 : '';
                          
                          if (clienteBiggerAvgSortField === 'data_nascimento') {
                            aVal = aVal ? new Date(aVal).getTime() : 0;
                            bVal = bVal ? new Date(bVal).getTime() : 0;
                            return clienteBiggerAvgSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          if (['qnt_pessoas', 'id_reserva'].includes(clienteBiggerAvgSortField)) {
                            aVal = Number(aVal) || 0;
                            bVal = Number(bVal) || 0;
                            return clienteBiggerAvgSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          aVal = String(aVal).toLowerCase();
                          bVal = String(bVal).toLowerCase();
                          
                          if (clienteBiggerAvgSortDirection === 'asc') {
                            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                          } else {
                            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                          }
                        }).map((item, idx) => (
                          <tr key={idx}>
                            {allFields.map(field => {
                              let value = item[field];
                              if (value == null) value = '-';
                              else if (field === 'data_nascimento') {
                                value = new Date(value).toLocaleDateString('pt-BR');
                              }
                              return <td key={field}>{value}</td>;
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Mesas Ocupadas Completas */}
          {(() => {
            const allFields = mesaOcupada.length > 0 ? Object.keys(mesaOcupada[0]) : [];
            const fieldLabels = {
              id_mesa: 'ID Mesa',
              capacidade: 'Capacidade',
              status_mesa: 'Status Mesa',
              id_func: 'ID Funcionário',
              id_reserva: 'ID Reserva',
              cpf: 'CPF Cliente',
              nome: 'Nome Cliente',
              telefone: 'Telefone',
              data_nascimento: 'Data Nascimento',
              data_hora_chegada: 'Data/Hora Chegada',
              qnt_pessoas: 'Qnt. Pessoas',
              status_reserva: 'Status Reserva',
            };
            
            return (
              <div className="view-card">
                <h2>Mesas Ocupadas Completas</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {allFields.map(field => (
                          <th 
                            key={field}
                            className="sortable" 
                            onClick={() => { 
                              setMesaOcupadaSortField(field); 
                              setMesaOcupadaSortDirection(mesaOcupadaSortField === field && mesaOcupadaSortDirection === 'asc' ? 'desc' : 'asc'); 
                            }}
                          >
                            {fieldLabels[field] || field} {mesaOcupadaSortField === field && (mesaOcupadaSortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mesaOcupada.length === 0 ? (
                        <tr>
                          <td colSpan={allFields.length} className="empty-state">Nenhuma mesa encontrada</td>
                        </tr>
                      ) : (
                        [...mesaOcupada].sort((a, b) => {
                          let aVal = a[mesaOcupadaSortField];
                          let bVal = b[mesaOcupadaSortField];
                          
                          if (aVal == null) aVal = ['id_mesa', 'capacidade', 'id_func', 'id_reserva', 'qnt_pessoas'].includes(mesaOcupadaSortField) ? 0 : '';
                          if (bVal == null) bVal = ['id_mesa', 'capacidade', 'id_func', 'id_reserva', 'qnt_pessoas'].includes(mesaOcupadaSortField) ? 0 : '';
                          
                          if (mesaOcupadaSortField === 'data_hora_chegada' || mesaOcupadaSortField === 'data_nascimento') {
                            aVal = aVal ? new Date(aVal).getTime() : 0;
                            bVal = bVal ? new Date(bVal).getTime() : 0;
                            return mesaOcupadaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          if (['id_mesa', 'capacidade', 'id_func', 'id_reserva', 'qnt_pessoas'].includes(mesaOcupadaSortField)) {
                            aVal = Number(aVal) || 0;
                            bVal = Number(bVal) || 0;
                            return mesaOcupadaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          aVal = String(aVal).toLowerCase();
                          bVal = String(bVal).toLowerCase();
                          
                          if (mesaOcupadaSortDirection === 'asc') {
                            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                          } else {
                            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                          }
                        }).map((item, idx) => (
                          <tr key={idx}>
                            {allFields.map(field => {
                              let value = item[field];
                              if (value == null) value = '-';
                              else if (field === 'data_hora_chegada' || field === 'data_nascimento') {
                                value = new Date(value).toLocaleString('pt-BR');
                              } else if (field === 'status_mesa' || field === 'status_reserva') {
                                value = value ? (
                                  <span className={`status-badge status-${String(value).toLowerCase().replace('_', '-')}`}>
                                    {value}
                                  </span>
                                ) : '-';
                              }
                              return <td key={field}>{value}</td>;
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Clientes com Reservas Canceladas */}
          {(() => {
            const allFields = clienteCancelada.length > 0 ? Object.keys(clienteCancelada[0]) : [];
            const fieldLabels = {
              cliente_cpf: 'CPF Cliente',
              cpf: 'CPF',
              nome: 'Nome',
              telefone: 'Telefone',
              data_nascimento: 'Data Nascimento',
              qnt_canceladas: 'Qnt. Canceladas',
            };
            
            return (
              <div className="view-card">
                <h2>Clientes com Reservas Canceladas</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {allFields.map(field => (
                          <th 
                            key={field}
                            className="sortable" 
                            onClick={() => { 
                              setClienteCanceladaSortField(field); 
                              setClienteCanceladaSortDirection(clienteCanceladaSortField === field && clienteCanceladaSortDirection === 'asc' ? 'desc' : 'asc'); 
                            }}
                          >
                            {fieldLabels[field] || field} {clienteCanceladaSortField === field && (clienteCanceladaSortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clienteCancelada.length === 0 ? (
                        <tr>
                          <td colSpan={allFields.length} className="empty-state">Nenhum cliente encontrado</td>
                        </tr>
                      ) : (
                        [...clienteCancelada].sort((a, b) => {
                          let aVal = a[clienteCanceladaSortField];
                          let bVal = b[clienteCanceladaSortField];
                          
                          if (aVal == null) aVal = clienteCanceladaSortField === 'qnt_canceladas' ? 0 : '';
                          if (bVal == null) bVal = clienteCanceladaSortField === 'qnt_canceladas' ? 0 : '';
                          
                          if (clienteCanceladaSortField === 'data_nascimento') {
                            aVal = aVal ? new Date(aVal).getTime() : 0;
                            bVal = bVal ? new Date(bVal).getTime() : 0;
                            return clienteCanceladaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          if (clienteCanceladaSortField === 'qnt_canceladas') {
                            aVal = Number(aVal) || 0;
                            bVal = Number(bVal) || 0;
                            return clienteCanceladaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          
                          aVal = String(aVal).toLowerCase();
                          bVal = String(bVal).toLowerCase();
                          
                          if (clienteCanceladaSortDirection === 'asc') {
                            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                          } else {
                            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                          }
                        }).map((item, idx) => (
                          <tr key={idx}>
                            {allFields.map(field => {
                              let value = item[field];
                              if (value == null) value = '-';
                              else if (field === 'data_nascimento') {
                                value = new Date(value).toLocaleDateString('pt-BR');
                              }
                              return <td key={field}>{value}</td>;
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="logs-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => { setLogsSortField('id_log'); setLogsSortDirection(logsSortField === 'id_log' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Log {logsSortField === 'id_log' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('id_comanda'); setLogsSortDirection(logsSortField === 'id_comanda' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Comanda {logsSortField === 'id_comanda' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('cpf_cliente'); setLogsSortDirection(logsSortField === 'cpf_cliente' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    CPF Cliente {logsSortField === 'cpf_cliente' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('nome_cliente'); setLogsSortDirection(logsSortField === 'nome_cliente' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Nome Cliente {logsSortField === 'nome_cliente' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('id_reserva'); setLogsSortDirection(logsSortField === 'id_reserva' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Reserva {logsSortField === 'id_reserva' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('total_comanda'); setLogsSortDirection(logsSortField === 'total_comanda' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Total {logsSortField === 'total_comanda' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('data_hora_criacao'); setLogsSortDirection(logsSortField === 'data_hora_criacao' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Data/Hora Criação {logsSortField === 'data_hora_criacao' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('status_comanda'); setLogsSortDirection(logsSortField === 'status_comanda' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Status {logsSortField === 'status_comanda' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('id_func_garcom'); setLogsSortDirection(logsSortField === 'id_func_garcom' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    ID Func. Garçom {logsSortField === 'id_func_garcom' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => { setLogsSortField('data_registro'); setLogsSortDirection(logsSortField === 'data_registro' && logsSortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Data Registro {logsSortField === 'data_registro' && (logsSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-state">Nenhum log encontrado</td>
                  </tr>
                ) : (
                  [...logs].sort((a, b) => {
                    let aVal = a[logsSortField];
                    let bVal = b[logsSortField];
                    
                    if (aVal == null) aVal = logsSortField === 'id_log' || logsSortField === 'id_comanda' || logsSortField === 'id_reserva' || logsSortField === 'total_comanda' || logsSortField === 'id_func_garcom' ? 0 : '';
                    if (bVal == null) bVal = logsSortField === 'id_log' || logsSortField === 'id_comanda' || logsSortField === 'id_reserva' || logsSortField === 'total_comanda' || logsSortField === 'id_func_garcom' ? 0 : '';
                    
                    if (logsSortField === 'data_hora_criacao' || logsSortField === 'data_registro') {
                      aVal = aVal ? new Date(aVal).getTime() : 0;
                      bVal = bVal ? new Date(bVal).getTime() : 0;
                      return logsSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    if (logsSortField === 'id_log' || logsSortField === 'id_comanda' || logsSortField === 'id_reserva' || logsSortField === 'total_comanda' || logsSortField === 'id_func_garcom') {
                      aVal = Number(aVal) || 0;
                      bVal = Number(bVal) || 0;
                      return logsSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    aVal = String(aVal).toLowerCase();
                    bVal = String(bVal).toLowerCase();
                    
                    if (logsSortDirection === 'asc') {
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
            <div className="stat-card">
              <h3>Mediana por Comanda</h3>
              <p className="stat-value">
                {(() => {
                  if (logs.length === 0) return 'R$ 0.00';
                  const totals = logs.map(log => log.total_comanda || 0).sort((a, b) => a - b);
                  const mid = Math.floor(totals.length / 2);
                  const median = totals.length % 2 === 0
                    ? (totals[mid - 1] + totals[mid]) / 2
                    : totals[mid];
                  return `R$ ${median.toFixed(2)}`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataPage;

