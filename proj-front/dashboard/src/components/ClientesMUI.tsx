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
import { clienteService } from "../services/clienteService";
import { type Cliente } from "../types/Cliente";

interface ClientesMUIProps {
  darkMode: boolean;
}

export default function ClientesMUI({ darkMode }: ClientesMUIProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchCpf, setSearchCpf] = useState("");
  const [searchNome, setSearchNome] = useState("");

  const [openAddCliente, setOpenAddCliente] = useState(false);
  const [newCpf, setNewCpf] = useState("");
  const [newNome, setNewNome] = useState("");
  const [newTelefone, setNewTelefone] = useState("");

  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [openEditCliente, setOpenEditCliente] = useState(false);

  const [sortField, setSortField] = useState<"nome" | "cpf" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const inputStyle = {
    bgcolor: darkMode ? "#616161" : "#ffffff",
    color: darkMode ? "#f5f5f5" : "#212121",
  };

  useEffect(() => {
    fetchAllClientes();
  }, []);

  const fetchAllClientes = () => {
    clienteService
      .getAll()
      .then((res) => setClientes(res.data || []))
      .catch(() => setClientes([]));
  };

  const applyFilters = async () => {
    try {
      let filtered: Cliente[] = [];

      if (searchCpf) {
        const res = await clienteService.getByCpf(searchCpf);
        if (res.data) filtered.push(res.data);
      }

      if (searchNome) {
        const res = await clienteService.getByNome(searchNome);
        filtered = filtered.length
          ? filtered.filter((c) => res.data.some((f) => f.cpf === c.cpf))
          : res.data || [];
      }

      if (!searchCpf && !searchNome) fetchAllClientes();
      else setClientes(filtered);
    } catch {
      setClientes([]);
    }
  };

  const handleDelete = (cpf: string) => {
    if (!window.confirm("Deseja realmente deletar este cliente?")) return;
    clienteService
      .delete(cpf)
      .then(() => fetchAllClientes())
      .catch(console.error);
  };

  const handleAddCliente = () => {
    clienteService
      .add({ cpf: newCpf, nome: newNome, telefone: newTelefone })
      .then(() => {
        fetchAllClientes();
        setOpenAddCliente(false);
        setNewCpf("");
        setNewNome("");
        setNewTelefone("");
      })
      .catch(console.error);
  };

  const handleEditCliente = (updated: Cliente) => {
    clienteService
      .update(updated)
      .then(() => {
        fetchAllClientes();
        setOpenEditCliente(false);
      })
      .catch(console.error);
  };

  const handleSort = (field: "nome" | "cpf") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedClientes = [...clientes].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField].toLowerCase();
    const valB = b[sortField].toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="CPF"
          value={searchCpf}
          onChange={(e) => setSearchCpf(e.target.value)}
          sx={inputStyle}
        />
        <TextField
          label="Nome"
          value={searchNome}
          onChange={(e) => setSearchNome(e.target.value)}
          sx={inputStyle}
        />
        <Button variant="contained" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setSearchCpf("");
            setSearchNome("");
            fetchAllClientes();
          }}
        >
          Limpar Filtros
        </Button>
        <Button variant="contained" onClick={() => setOpenAddCliente(true)}>
          Adicionar Cliente
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
                onClick={() => handleSort("cpf")}
              >
                CPF {sortField === "cpf" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                sx={{
                  color: darkMode ? "#f5f5f5" : "white",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("nome")}
              >
                Nome {sortField === "nome" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell sx={{ color: darkMode ? "#f5f5f5" : "white" }}>
                Telefone
              </TableCell>
              <TableCell sx={{ color: darkMode ? "#f5f5f5" : "white" }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedClientes.map((c) => (
              <TableRow
                key={c.cpf}
                sx={{ bgcolor: darkMode ? "#616161" : "#f0f0f0", mb: 1 }}
              >
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {c.cpf}
                </TableCell>
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {c.nome}
                </TableCell>
                <TableCell sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}>
                  {c.telefone}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setEditingCliente(c);
                      setOpenEditCliente(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(c.cpf)}
                  >
                    Deletar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAddCliente} onClose={() => setOpenAddCliente(false)}>
        <DialogTitle>Adicionar Cliente</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="CPF"
            value={newCpf}
            onChange={(e) => setNewCpf(e.target.value)}
          />
          <TextField
            label="Nome"
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
          />
          <TextField
            label="Telefone"
            value={newTelefone}
            onChange={(e) => setNewTelefone(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenAddCliente(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleAddCliente}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditCliente} onClose={() => setOpenEditCliente(false)}>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField label="CPF" value={editingCliente?.cpf} disabled />
          <TextField
            label="Nome"
            value={editingCliente?.nome}
            onChange={(e) =>
              setEditingCliente((prev) =>
                prev ? { ...prev, nome: e.target.value } : null
              )
            }
          />
          <TextField
            label="Telefone"
            value={editingCliente?.telefone}
            onChange={(e) =>
              setEditingCliente((prev) =>
                prev ? { ...prev, telefone: e.target.value } : null
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenEditCliente(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => editingCliente && handleEditCliente(editingCliente)}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
