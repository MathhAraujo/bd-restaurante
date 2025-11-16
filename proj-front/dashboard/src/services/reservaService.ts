import axios from "axios";
import { type Reserva } from "../types/Reserva";
import { type ReservaFuturaDTO } from "../types/ReservaFuturaDTO";
import { type TimePeriodDTO } from "../types/TimePeriodDTO";

const API_URL = "http://localhost:8080/api/reserva";

export const reservaService = {
  getAll: () => axios.get<Reserva[]>(`${API_URL}/find/all`),
  getById: (id: number) => axios.get<Reserva>(`${API_URL}/find/id/${id}`),
  getByCpf: (cpf: string) => axios.get<Reserva[]>(`${API_URL}/find/cpf/${cpf}`),
  getFutureBiggerThan: (qnt_pessoas: number) =>
    axios.get<ReservaFuturaDTO[]>(`${API_URL}/find/future/bigger_then/${qnt_pessoas}`),
  getAllFutureReserva: (cpf: string) =>
    axios.get<Reserva[]>(`${API_URL}/find/future/${cpf}`),
  getReservationInPeriod: (period: TimePeriodDTO) =>
    axios.post<ReservaFuturaDTO[]>(`${API_URL}/find/reservation_period/`, period),
  add: (reserva: Omit<Reserva, "id_reserva">) => axios.post<Reserva>(`${API_URL}/add`, reserva),
  update: (reserva: Reserva) => axios.put<Reserva>(`${API_URL}/update`, reserva),
  deleteById: (id: number) => axios.delete(`${API_URL}/delete/id/${id}`),
  deleteByCpf: (cpf: string) => axios.delete(`${API_URL}/delete/cpf/${cpf}`)
};