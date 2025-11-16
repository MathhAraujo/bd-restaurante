import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import ClienteMUI from "./ClientesMUI";
import ReservasMUI from "./ReservasMUI";
import { dataService } from "../services/dataService";
import { type ReservaMonthlyDTO } from "../types/ReservaMonthlyDTO";
import { type PeakReservasDTO } from "../types/PeakReservasDTO";
import { type GroupSizeDistDTO } from "../types/GroupSizeDistDTO";
import { type ClienteAreaDistDTO } from "../types/ClienteAreaDistDTO";
import { type OccupationDayDTO } from "../types/OccupationDayDTO";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardMUI() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  // Dados
  const [occupationData, setOccupationData] = useState<OccupationDayDTO[]>([]);
  const [reservaMonthlyData, setReservaMonthlyData] = useState<
    ReservaMonthlyDTO[]
  >([]);
  const [peakReservaData, setPeakReservaData] = useState<PeakReservasDTO[]>([]);
  const [groupSizeData, setGroupSizeData] = useState<GroupSizeDistDTO[]>([]);
  const [clienteAreaData, setClienteAreaData] = useState<ClienteAreaDistDTO[]>(
    []
  );

  useEffect(() => {
    dataService
      .getOccupationPerDay()
      .then((res) => setOccupationData(res.data || []));
    dataService
      .getReservaMonthly()
      .then((res) => setReservaMonthlyData(res.data || []));
    dataService
      .getPeakReservaHour()
      .then((res) => setPeakReservaData(res.data || []));
    dataService
      .getGroupSizeDistribution()
      .then((res) => setGroupSizeData(res.data || []));
    dataService
      .getClienteAreaDistribution()
      .then((res) => setClienteAreaData(res.data || []));
  }, []);

  const formatDay = (day: string) => {
    const daysPt: { [key: string]: string } = {
      SUNDAY: "Dom",
      MONDAY: "Seg",
      TUESDAY: "Ter",
      WEDNESDAY: "Qua",
      THURSDAY: "Qui",
      FRIDAY: "Sex",
      SATURDAY: "Sáb",
      Sunday: "Dom",
      Monday: "Seg",
      Tuesday: "Ter",
      Wednesday: "Qua",
      Thursday: "Qui",
      Friday: "Sex",
      Saturday: "Sáb",
    };
    return daysPt[day] || day;
  };

  const reorderDays = (data: OccupationDayDTO[]) => {
    const order = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const mapped = data.map((d) => ({
      day: formatDay(d.day),
      num_reserva: Number(d.num_reserva),
      total_ppl: Number(d.total_ppl),
    }));
    return order.map(
      (d) =>
        mapped.find((m) => m.day === d) || {
          day: d,
          num_reserva: 0,
          total_ppl: 0,
        }
    );
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: darkMode ? "#212121" : "#f5f5f5",
        color: darkMode ? "#f5f5f5" : "#212121",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          }
          label={darkMode ? "Dark Mode" : "Light Mode"}
          sx={{ color: darkMode ? "#f5f5f5" : "#212121" }}
        />
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: "#1976d2" } }}
        sx={{
          "& .MuiTab-root": {
            color: darkMode ? "#f5f5f5" : "#212121",
            bgcolor: darkMode ? "#424242" : "#ffffff",
            fontWeight: "bold",
            mr: 1,
          },
          "& .Mui-selected": {
            color: darkMode ? "#212121" : "#ffffff",
            bgcolor: darkMode ? "#ffffff" : "#1976d2",
          },
        }}
      >
        <Tab label="Clientes" />
        <Tab label="Reservas" />
        <Tab label="Análise" />
      </Tabs>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 2,
          width: "100%",
        }}
      >
        {selectedTab === 0 && <ClienteMUI darkMode={darkMode} />}
        {selectedTab === 1 && <ReservasMUI darkMode={darkMode} />}
        {selectedTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Análise de Reservas
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
              }}
            >
              {/* Gráfico 1: Ocupação por dia */}
              <Box>
                <Typography variant="subtitle1">
                  Reservas por Dia da Semana
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={reorderDays(occupationData)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="day"
                      stroke={darkMode ? "#f5f5f5" : "#212121"}
                    />
                    <YAxis stroke={darkMode ? "#f5f5f5" : "#212121"} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ color: darkMode ? "#f5f5f5" : "#212121" }}
                    />
                    <Bar
                      dataKey="num_reserva"
                      name="Nº de Reservas"
                      fill="#1976d2"
                    />
                    <Bar
                      dataKey="total_ppl"
                      name="Total Pessoas"
                      fill="#9c27b0"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Gráfico 2: Reservas mensais */}
              <Box>
                <Typography variant="subtitle1">Reservas Mensais</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reservaMonthlyData}>
                    <XAxis
                      dataKey="mes_ano"
                      stroke={darkMode ? "#f5f5f5" : "#212121"}
                    />
                    <YAxis stroke={darkMode ? "#f5f5f5" : "#212121"} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ color: darkMode ? "#f5f5f5" : "#212121" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="qnt"
                      name="Reservas"
                      stroke="#1976d2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Gráfico 3: Horário de pico */}
              <Box>
                <Typography variant="subtitle1">
                  Horário de Pico das Reservas
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={peakReservaData}>
                    <XAxis
                      dataKey="horario"
                      stroke={darkMode ? "#f5f5f5" : "#212121"}
                    />
                    <YAxis stroke={darkMode ? "#f5f5f5" : "#212121"} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ color: darkMode ? "#f5f5f5" : "#212121" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="qnt_reservas"
                      name="Reservas"
                      stroke="#9c27b0"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Gráfico 4: Distribuição por tamanho de grupo */}
              <Box>
                <Typography variant="subtitle1">
                  Distribuição por Tamanho de Grupo
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={groupSizeData}>
                    <XAxis
                      dataKey="qnt_pessoas"
                      stroke={darkMode ? "#f5f5f5" : "#212121"}
                    />
                    <YAxis stroke={darkMode ? "#f5f5f5" : "#212121"} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ color: darkMode ? "#f5f5f5" : "#212121" }}
                    />
                    <Bar dataKey="qnt_reserva" name="Reservas" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Gráfico 5: Distribuição de clientes por área */}
              <Box>
                <Typography variant="subtitle1">
                  Distribuição de Clientes por Área
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clienteAreaData}
                      dataKey="qnt_cliente"
                      nameKey="area"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#1976d2"
                      label
                    />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ color: darkMode ? "#f5f5f5" : "#212121" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
