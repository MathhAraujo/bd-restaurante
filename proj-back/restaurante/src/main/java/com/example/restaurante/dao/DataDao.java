package com.example.restaurante.dao;

import com.example.restaurante.dto.*;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

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
}
