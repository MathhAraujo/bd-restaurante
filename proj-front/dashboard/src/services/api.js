import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente API
export const clienteAPI = {
  getAll: () => api.get('/cliente/find/all'),
  getByCpf: (cpf) => api.get(`/cliente/find/cpf/${cpf}`),
  getByNome: (nome) => api.get(`/cliente/find/nome/${nome}`),
  getWithoutReserva: () => api.get('/cliente/find/all/without_reserva'),
  create: (cliente) => api.post('/cliente/add', cliente),
  update: (cliente) => api.put('/cliente/update', cliente),
  delete: (cpf) => api.delete(`/cliente/delete/${cpf}`),
};

// Mesa API
export const mesaAPI = {
  getAll: () => api.get('/mesa/find/all'),
  getById: (id) => api.get(`/mesa/find/id/${id}`),
  create: (capacidade) => api.post(`/mesa/add/${capacidade}`),
  update: (mesa) => api.put('/mesa/update', mesa),
  delete: (id) => api.delete(`/mesa/delete/${id}`),
};

// Comanda API
export const comandaAPI = {
  getAll: () => api.get('/comanda/find/all'),
  getById: (id) => api.get(`/comanda/find/id/${id}`),
  create: (id_mesa) => api.post(`/comanda/add/${id_mesa}`),
  update: (comanda) => api.put('/comanda/update', comanda),
  delete: (id) => api.delete(`/comanda/delete/${id}`),
  addComissao: (calc_comissao) => api.post('/comanda/call/add_desconto', calc_comissao),
};

// Reserva API
export const reservaAPI = {
  getAll: () => api.get('/reserva/find/all'),
  getById: (id) => api.get(`/reserva/find/id/${id}`),
  getByCpf: (cpf) => api.get(`/reserva/find/cpf/${cpf}`),
  getFuture: (cpf) => api.get(`/reserva/find/future/${cpf}`),
  getFutureBiggerThan: (qnt_pessoas) => api.get(`/reserva/find/future/bigger_then/${qnt_pessoas}`),
  getByPeriod: (period) => api.post('/reserva/find/reservation_period/', period),
  create: (reserva) => api.post('/reserva/add', reserva),
  update: (reserva) => api.put('/reserva/update', reserva),
  deleteById: (id) => api.delete(`/reserva/delete/${id}`),
  deleteByCpf: (cpf) => api.delete(`/reserva/delete/cpf/${cpf}`),
};

// Data API
export const dataAPI = {
  getReservaDay: () => api.get('/data/reserva_day'),
  getReservaCountMonth: () => api.get('/data/reserva_count_month'),
  getPeakReservaHour: () => api.get('/data/peak_reserva_hour'),
  getGroupSizeDistribution: () => api.get('/data/group_size_distribution'),
  getClienteAreaDistribution: () => api.get('/data/cliente_area_distribution'),
  getMesaFull: () => api.get('/data/mesa_full'),
  getClienteReservaBiggerAvg: () => api.get('/data/cliente_reserva_bigger_avg'),
  getClienteReservaCancelada: () => api.get('/data/cliente_reserva_cancelada'),
  getOccupationPercent: () => api.get('/data/occupation_percent'),
  getReservaFutureFull: () => api.get('/data/reserva_future_full'),
  getMesaOcupadaFull: () => api.get('/data/mesa_ocupada_full'),
  getClienteTotalSpent: () => api.get('/data/cliente_total_spent'),
  getComandaPagaLog: () => api.get('/data/comanda_paga_log'),
};

export default api;

