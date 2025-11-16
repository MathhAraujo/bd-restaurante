import axios from "axios";
import { type ReservaMonthlyDTO } from "../types/ReservaMonthlyDTO";
import { type PeakReservasDTO } from "../types/PeakReservasDTO";
import { type GroupSizeDistDTO } from "../types/GroupSizeDistDTO";
import { type ClienteAreaDistDTO } from "../types/ClienteAreaDistDTO";
import { type OccupationDayDTO } from "../types/OccupationDayDTO";

const API_URL = "http://localhost:8080/api/data";

export const dataService = {
  getOccupationPerDay: () => axios.get<OccupationDayDTO[]>(`${API_URL}/reserva_day`),
  getReservaMonthly: () => axios.get<ReservaMonthlyDTO[]>(`${API_URL}/reserva_count_month`),
  getPeakReservaHour: () => axios.get<PeakReservasDTO[]>(`${API_URL}/peak_reserva_hour`),
  getGroupSizeDistribution: () => axios.get<GroupSizeDistDTO[]>(`${API_URL}/group_size_distribution`),
  getClienteAreaDistribution: () => axios.get<ClienteAreaDistDTO[]>(`${API_URL}/cliente_area_distribution`)
};
