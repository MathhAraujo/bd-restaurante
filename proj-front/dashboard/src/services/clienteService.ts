import axios from "axios";
import { type Cliente } from "../types/Cliente";

const API_URL = "http://localhost:8080/api/cliente";

export const clienteService = {
  getAll: () => axios.get<Cliente[]>(`${API_URL}/find/all`),
  getByCpf: (cpf: string) => axios.get<Cliente | null>(`${API_URL}/find/cpf/${cpf}`),
  getByNome: (nome: string) => axios.get<Cliente[]>(`${API_URL}/find/nome/${nome}`),
  add: (cliente: Cliente) => axios.post<Cliente>(`${API_URL}/add`, cliente),
  update: (cliente: Cliente) => axios.put<Cliente>(`${API_URL}/update`, cliente),
  delete: (cpf: string) => axios.delete(`${API_URL}/delete/${cpf}`)
};