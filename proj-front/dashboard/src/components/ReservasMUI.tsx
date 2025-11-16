import { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { reservaService } from "../services/reservaService";
import { type Reserva } from "../types/Reserva";
import { type ReservaFuturaDTO } from "../types/ReservaFuturaDTO";
import { type TimePeriodDTO } from "../types/TimePeriodDTO";

interface ReservasMUIProps {
  darkMode: boolean;
}

export default function ReservasMUI({ darkMode }: ReservasMUIProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [searchCpf, setSearchCpf] = useState("");
  const [searchId, setSearchId] = useState("");
  const [filterQntPessoas, setFilterQntPessoas] = useState("");
  const [filterInit, setFilterInit] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [openAddReserva, setOpenAddReserva] = useState(false);
  const [newCpf, setNewCpf] = useState("");
  const [newQnt, setNewQnt] = useState("");
  const [newDataHora, setNewDataHora] = useState("");

  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [openEditReserva, setOpenEditReserva] = useState(false);

  const [sortField, setSortField] = useState<
    "id_reserva" | "qnt_pessoas" | "data_hora_chegada" | null
  >(null);
  const [sortAsc, setSortAsc] = useState(true);

  const inputStyle = {
    bgcolor: darkMode ? "#616161" : "#ffffff",
    color: darkMode ? "#f5f5f5" : "#212121",
  };

  useEffect(() => {
    fetchAllReservas();
  }, []);

  const fetchAllReservas = () => {
    reservaService
      .getAll()
      .then((res) => setReservas(res.data || []))
      .catch(() => setReservas([]));
  };

  const mapReservaFuturaToReserva = (dto: ReservaFuturaDTO): Reserva => ({
    id_reserva: dto.id_reserva,
    cliente_cpf: "",
    qnt_pessoas: dto.qnt_pessoas,
    data_hora_chegada: dto.data_hora_chegada.toString(),
  });

  const formatToLocalDateTime = (value: string) => {
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const applyFilters = async () => {
    try {
      let filtered: Reserva[] = [];

      if (searchId) {
        const res = await reservaService.getById(Number(searchId));
        if (res.data) filtered.push(res.data);
      }

      if (searchCpf) {
        const res = await reservaService.getByCpf(searchCpf);
        const lista = res.data || [];
        filtered = filtered.length
          ? filtered.filter((r) =>
              lista.some((f) => f.id_reserva === r.id_reserva)
            )
          : lista;
      }

      if (filterQntPessoas) {
        const res = await reservaService.getFutureBiggerThan(
          Number(filterQntPessoas)
        );
        const lista = (res.data || []).map(mapReservaFuturaToReserva);
        filtered = filtered.length
          ? filtered.filter((r) =>
              lista.some((f) => f.id_reserva === r.id_reserva)
            )
          : lista;
      }

      if (filterInit && filterEnd) {
        const period: TimePeriodDTO = {
          init: formatToLocalDateTime(filterInit),
          end: formatToLocalDateTime(filterEnd),
        };
        const res = await reservaService.getReservationInPeriod(period);
        const lista = (res.data || []).map(mapReservaFuturaToReserva);
        filtered = filtered.length
          ? filtered.filter((r) =>
              lista.some((f) => f.id_reserva === r.id_reserva)
            )
          : lista;
      }

      if (
        !searchCpf &&
        !searchId &&
        !filterQntPessoas &&
        (!filterInit || !filterEnd)
      ) {
        fetchAllReservas();
      } else {
        setReservas(filtered);
      }
    } catch {
      setReservas([]);
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Deseja realmente deletar esta reserva?")) return;
    reservaService
      .deleteById(id)
      .then(() => fetchAllReservas())
      .catch(console.error);
  };

  const handleAddReserva = () => {
    reservaService
      .add({
        cliente_cpf: newCpf,
        qnt_pessoas: Number(newQnt),
        data_hora_chegada: formatToLocalDateTime(newDataHora),
      })
      .then(() => {
        fetchAllReservas();
        setOpenAddReserva(false);
        setNewCpf("");
        setNewQnt("");
        setNewDataHora("");
      })
      .catch(console.error);
  };

  const handleEditReserva = (updated: Reserva) => {
    reservaService
      .update(updated)
      .then(() => {
        fetchAllReservas();
        setOpenEditReserva(false);
      })
      .catch(console.error);
  };

  const handleSort = (
    field: "id_reserva" | "qnt_pessoas" | "data_hora_chegada"
  ) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedReservas = [...reservas].sort((a, b) => {
    if (!sortField) return 0;
    let valA: number | string = a[sortField];
    let valB: number | string = b[sortField];

    if (sortField === "data_hora_chegada") {
      valA = new Date(a.data_hora_chegada).getTime();
      valB = new Date(b.data_hora_chegada).getTime();
    }

    return sortAsc
      ? valA > valB
        ? 1
        : valA < valB
        ? -1
        : 0
      : valA < valB
      ? 1
      : valA > valB
      ? -1
      : 0;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="ID Reserva"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          sx={inputStyle}
        />
        <TextField
          label="CPF"
          value={searchCpf}
          onChange={(e) => setSearchCpf(e.target.value)}
          sx={inputStyle}
        />
        <TextField
          label="Qtd Pessoas >="
          value={filterQntPessoas}
          onChange={(e) => setFilterQntPessoas(e.target.value)}
          sx={inputStyle}
        />
        <TextField
          type="datetime-local"
          label="Início"
          value={filterInit}
          onChange={(e) => setFilterInit(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={inputStyle}
        />
        <TextField
          type="datetime-local"
          label="Fim"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={inputStyle}
        />
        <Button variant="contained" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setSearchId("");
            setSearchCpf("");
            setFilterQntPessoas("");
            setFilterInit("");
            setFilterEnd("");
            fetchAllReservas();
          }}
        >
          Limpar Filtros
        </Button>
        <Button variant="contained" onClick={() => setOpenAddReserva(true)}>
          Adicionar Reserva
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ bgcolor: darkMode ? "#424242" : "#ffffff" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: darkMode ? "#616161" : "#1976d2" }}>
            <TableRow>
              <TableCell
                sx={{
                  color: darkMode ? "#f5f5f5" : "white",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("id_reserva")}
              >
                ID {sortField === "id_reserva" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell sx={{ color: darkMode ? "#f5f5f5" : "white" }}>
                CPF
              </TableCell>
              <TableCell
                sx={{
                  color: darkMode ? "#f5f5f5" : "white",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("qnt_pessoas")}
              >
                Qtd Pessoas{" "}
                {sortField === "qnt_pessoas" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                sx={{
                  color: darkMode ? "#f5f5f5" : "white",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("data_hora_chegada")}
              >
                Data/Hora{" "}
                {sortField === "data_hora_chegada" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell sx={{ color: darkMode ? "#f5f5f5" : "white" }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedReservas.map((r) => (
              <TableRow
                key={r.id_reserva}
                sx={{ bgcolor: darkMode ? "#616161" : "#f0f0f0", mb: 1 }}
              >
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {r.id_reserva}
                </TableCell>
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {r.cliente_cpf}
                </TableCell>
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {r.qnt_pessoas}
                </TableCell>
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {new Date(r.data_hora_chegada).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setEditingReserva(r);
                      setOpenEditReserva(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(r.id_reserva)}
                  >
                    Deletar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAddReserva} onClose={() => setOpenAddReserva(false)}>
        <DialogTitle>Adicionar Reserva</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="CPF"
            value={newCpf}
            onChange={(e) => setNewCpf(e.target.value)}
          />
          <TextField
            label="Qtd Pessoas"
            value={newQnt}
            onChange={(e) => setNewQnt(e.target.value)}
          />
          <TextField
            type="datetime-local"
            label="Data/Hora Chegada"
            value={newDataHora}
            onChange={(e) => setNewDataHora(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenAddReserva(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleAddReserva}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditReserva} onClose={() => setOpenEditReserva(false)}>
        <DialogTitle>Editar Reserva</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField label="ID" value={editingReserva?.id_reserva} disabled />
          <TextField
            label="CPF"
            value={editingReserva?.cliente_cpf}
            onChange={(e) =>
              setEditingReserva((prev) =>
                prev ? { ...prev, cliente_cpf: e.target.value } : null
              )
            }
          />
          <TextField
            label="Qtd Pessoas"
            value={editingReserva?.qnt_pessoas}
            onChange={(e) =>
              setEditingReserva((prev) =>
                prev ? { ...prev, qnt_pessoas: Number(e.target.value) } : null
              )
            }
          />
          <TextField
            type="datetime-local"
            label="Data/Hora Chegada"
            value={
              editingReserva
                ? formatToLocalDateTime(editingReserva.data_hora_chegada)
                : ""
            }
            onChange={(e) =>
              setEditingReserva((prev) =>
                prev
                  ? {
                      ...prev,
                      data_hora_chegada: formatToLocalDateTime(e.target.value),
                    }
                  : null
              )
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenEditReserva(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => editingReserva && handleEditReserva(editingReserva)}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
