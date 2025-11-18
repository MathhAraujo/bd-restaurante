package com.example.restaurante.dao;

import com.example.restaurante.dto.*;
import com.example.restaurante.enums.Status_Comanda;
import com.example.restaurante.enums.Status_Mesa;
import com.example.restaurante.enums.Status_Reserva;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class DataDao {

    private final JdbcTemplate jdbcTemplate;

    private Occupation_DayDTO mapRowToOccupation_DayDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Occupation_DayDTO(
                rs.getString("day"),
                rs.getInt("num_reserva"),
                rs.getInt("total_ppl")
        );
    }

    private Reserva_MontlyDTO mapRowToReserva_MontlyDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Reserva_MontlyDTO(
                rs.getString("mes_ano"),
                rs.getInt("qnt")
        );
    }

    private Peak_ReservasDTO mapRowToPeak_ClienteDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Peak_ReservasDTO(
                rs.getInt("hora"),
                rs.getInt("qnt_reservas")
        );
    }

    private Group_Size_DistDTO mapRowToGroup_Size_DistDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Group_Size_DistDTO(
                rs.getInt("qnt_pessoas"),
                rs.getInt("qnt_reserva")
        );
    }

    private Cliente_area_DistDTO mapRowToCliente_area_DistDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Cliente_area_DistDTO(
                rs.getInt("area"),
                rs.getInt("qnt_cliente")
        );
    }

    private Mesa_Full_FunDTO mapRowToMesa_FullDTO(ResultSet rs, int rowNum) throws SQLException {

        Status_Mesa status_mesa = Optional.ofNullable(rs.getString("status_mesa")).map(Status_Mesa::valueOf).orElse(null);

        return new Mesa_Full_FunDTO(
                rs.getString("cpf"),
                rs.getString("nome"),
                rs.getShort("id_reserva"),
                rs.getDate("data_hora_chegada"),
                rs.getShort("id_mesa"),
                status_mesa
        );
    }

    private Cliente_Reserva_BiggerThanAvgDTO mapRowToCliente_Reserva_BiggerThanAvgDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Cliente_Reserva_BiggerThanAvgDTO(
                rs.getString("nome"),
                rs.getString("telefone"),
                rs.getShort("id_mesa"),
                rs.getShort("capacidade")
        );
    }

    private Cliente_Reserva_CanceladaDTO mapRowToCliente_Reserva_CANCELADADTO(ResultSet rs, int rowNum) throws SQLException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new Cliente_Reserva_CanceladaDTO(
                rs.getString("cpf"),
                rs.getString("nome"),
                rs.getString("telefone"),
                rs.getShort("id_reserva"),
                rs.getShort("qnt_pessoas"),
                LocalDateTime.parse(rs.getString("data_hora_chegada"), formatter),
                Status_Reserva.valueOf(rs.getString("status_reserva"))
        );
    }

    private Occupation_PercentageDTO mapRowToOccupation_PercentageDTO(ResultSet rs, int rowNum) throws SQLException {
        return new Occupation_PercentageDTO(
                rs.getFloat("ocupacao")
        );
    }

    private Reserva_Future_FullDTO mapRowToReserva_Future_FullDTO(ResultSet rs, int rowNum) throws SQLException {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        Status_Mesa status_mesa = Optional.ofNullable(rs.getString("status_mesa")).map(Status_Mesa::valueOf).orElse(null);

        return new Reserva_Future_FullDTO(
                rs.getShort("id_reserva"),
                rs.getString("cliente_cpf"),
                rs.getString("nome"),
                rs.getShort("qnt_pessoas"),
                LocalDateTime.parse(rs.getString("data_hora_chegada"), formatter),
                Status_Reserva.valueOf(rs.getString("status_reserva")),
                rs.getShort("id_mesa"),
                status_mesa,
                rs.getShort("capacidade"),
                rs.getShort("id_func")
        );
    }

    private Mesa_Ocupada_FullDTO mapRowToMesa_Ocupada_FullDTO(ResultSet rs, int rowNum) throws SQLException {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        Status_Reserva status_reserva = Optional.ofNullable(rs.getString("status_reserva")).map(Status_Reserva::valueOf).orElse(null);
        Optional<String> data_hora_str = Optional.ofNullable(rs.getString("data_hora_chegada"));
        LocalDateTime data_hora_chegada = data_hora_str.map(s -> LocalDateTime.parse(s, formatter)).orElse(null);
        Status_Comanda status_comanda = Optional.ofNullable(rs.getString("status_comanda")).map(Status_Comanda::valueOf).orElse(null);

        return new Mesa_Ocupada_FullDTO(
                rs.getShort("id_mesa"),
                Status_Mesa.valueOf(rs.getString("status_mesa")),
                rs.getShort("capacidade"),
                rs.getShort("id_reserva"),
                rs.getShort("qnt_pessoas"),
                data_hora_chegada,
                status_reserva,
                rs.getString("cpf"),
                rs.getShort("id_comanda"),
                status_comanda,
                rs.getFloat("total")
        );
    }

    private Cliente_Total_SpentDTO mapRowToCliente_Total_SpentDTO(ResultSet rs, int rowNum) throws SQLException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new Cliente_Total_SpentDTO(
                rs.getInt("id_registro"),
                rs.getString("cpf_cliente"),
                rs.getString("nome_cliente"),
                rs.getFloat("total_gasto"),
                LocalDateTime.parse(rs.getString("data_atualizacao"), formatter)
        );
    }

    private Comanda_Paga_LogDTO mapRowToComanda_Paga_LogDTO(ResultSet rs, int rowNum) throws SQLException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new Comanda_Paga_LogDTO(
                rs.getInt("id_log"),
                rs.getShort("id_comanda"),
                rs.getString("cpf_cliente"),
                rs.getString("nome_cliente"),
                rs.getShort("id_reserva"),
                rs.getFloat("total_comanda"),
                LocalDateTime.parse(rs.getString("data_hora_criacao"), formatter),
                Status_Comanda.valueOf(rs.getString("status_comanda")),
                rs.getShort("id_func_garcom"),
                LocalDateTime.parse(rs.getString("data_registro"), formatter)
        );
    }


    public List<Occupation_DayDTO> findOccupationPerDay() {
        return this.jdbcTemplate.query("SELECT DAYNAME(data_hora_chegada) AS day, COUNT(id_reserva) AS num_reserva, SUM(qnt_pessoas) AS total_ppl FROM Reserva GROUP BY day ORDER BY total_ppl", this::mapRowToOccupation_DayDTO);
    }

    public List<Reserva_MontlyDTO> findReservaPerMonth() {
        return this.jdbcTemplate.query("SELECT DATE_FORMAT(data_hora_chegada, '%Y-%m') AS mes_ano, COUNT(id_reserva) AS qnt FROM Reserva GROUP BY mes_ano ORDER BY mes_ano", this::mapRowToReserva_MontlyDTO);
    }

    public List<Peak_ReservasDTO> findPeakClienteHour() {
        return this.jdbcTemplate.query("SELECT HOUR(data_hora_chegada) AS hora, COUNT(id_reserva) AS qnt_reservas FROM Reserva GROUP BY hora ORDER BY hora", this::mapRowToPeak_ClienteDTO);
    }

    public List<Group_Size_DistDTO> findGroupSizeDist() {
        return this.jdbcTemplate.query("SELECT qnt_pessoas, COUNT(id_reserva) AS qnt_reserva FROM Reserva GROUP BY qnt_pessoas ORDER BY qnt_pessoas", this::mapRowToGroup_Size_DistDTO);
    }

    public List<Cliente_area_DistDTO> findClienteAreaDist() {
        return this.jdbcTemplate.query("SELECT LEFT(telefone, 2) AS area, COUNT(cpf) as qnt_cliente FROM Cliente GROUP BY area ORDER BY area", this::mapRowToCliente_area_DistDTO);
    }

    public List<Mesa_Full_FunDTO> findMesaFull() {
        return this.jdbcTemplate.query("(SELECT c.cpf, c.nome, r.id_reserva, r.data_hora_chegada, m.id_mesa, m.status_mesa FROM Cliente AS c LEFT JOIN Reserva AS r ON c.cpf = r.cliente_cpf LEFT JOIN Mesa AS m ON m.id_reserva = r.id_reserva) UNION (SELECT c.cpf, c.nome, r.id_reserva, r.data_hora_chegada, m.id_mesa, m.status_mesa FROM Cliente AS c RIGHT JOIN Reserva AS r ON c.cpf = r.cliente_cpf RIGHT JOIN Mesa AS m ON m.id_reserva = r.id_reserva) ORDER BY cpf, id_reserva, id_mesa;", this::mapRowToMesa_FullDTO);
    }

    public List<Cliente_Reserva_BiggerThanAvgDTO> fetchClienteWithBiggerAvgReserva() {
        return this.jdbcTemplate.query("SELECT DISTINCT c.nome, c.telefone, m.id_mesa, m.capacidade FROM Cliente AS c JOIN Reserva AS r ON c.cpf = r.cliente_cpf JOIN Mesa AS m ON m.id_reserva = r.id_reserva WHERE m.capacidade > (SELECT AVG(capacidade) FROM Mesa) ORDER BY m.capacidade DESC", this::mapRowToCliente_Reserva_BiggerThanAvgDTO);
    }

    public List<Cliente_Reserva_CanceladaDTO> fetchClienteWithReservaCandelada() {
        return this.jdbcTemplate.query("SELECT c.cpf, c.nome, c.telefone, r.id_reserva, r.qnt_pessoas, r.data_hora_chegada, r.status_reserva FROM Cliente c JOIN Reserva r ON r.cliente_cpf = c.cpf WHERE r.cliente_cpf IN (SELECT cliente_cpf FROM Reserva WHERE status_reserva = 'CANCELADA') AND r.status_reserva = 'CANCELADA'", this::mapRowToCliente_Reserva_CANCELADADTO);
    }

    public Occupation_PercentageDTO fetchOccupationPercentage() {
        return this.jdbcTemplate.query("SELECT fnc_ocupacao() as ocupacao;", this::mapRowToOccupation_PercentageDTO).stream().findFirst().orElse(null);
    }

    public List<Reserva_Future_FullDTO> fetchReservaFutureFull() {
        return this.jdbcTemplate.query("SELECT * FROM vw_reservas_futuras_completas", this::mapRowToReserva_Future_FullDTO);
    }

    public List<Mesa_Ocupada_FullDTO> fetchMesaOcupadaFull() {
        return this.jdbcTemplate.query("SELECT * FROM vw_mesas_ocupadas_completas", this::mapRowToMesa_Ocupada_FullDTO);
    }

    public List<Cliente_Total_SpentDTO> fetchClienteTotalSpent() {
        this.jdbcTemplate.update("CALL prc_cliente_total()");
        return this.jdbcTemplate.query("SELECT * FROM Cliente_Total ORDER BY total_gasto DESC", this::mapRowToCliente_Total_SpentDTO);
    }

    public List<Comanda_Paga_LogDTO> fetchComandaPagaLog() {
        return this.jdbcTemplate.query("select * from comanda_paga_log;", this::mapRowToComanda_Paga_LogDTO);
    }

}
