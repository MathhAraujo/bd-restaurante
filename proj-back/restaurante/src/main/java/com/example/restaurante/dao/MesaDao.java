package com.example.restaurante.dao;

import com.example.restaurante.enums.Status_Mesa;
import com.example.restaurante.model.Mesa;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

@Repository
@AllArgsConstructor
public class MesaDao {
    private final JdbcTemplate jdbcTemplate;

    private Mesa mapRowToMesa(ResultSet rs, int rowNum) throws SQLException {
        return new Mesa(
                rs.getShort("id_mesa"),
                rs.getShort("id_func"),
                rs.getShort("id_reserva"),
                Status_Mesa.valueOf(rs.getString("status_mesa")),
                rs.getShort("capacidade")
        );
    }

    public List<Mesa> findAllMesa() {
        return this.jdbcTemplate.query("SELECT * FROM Mesa", this::mapRowToMesa);
    }

    public List<Mesa> findMesaById(short id_mesa) {
        return this.jdbcTemplate.query("SELECT * FROM Mesa WHERE id_mesa=?", this::mapRowToMesa, id_mesa);
    }

    public Short insertMesa(Mesa mesa) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("INSERT INTO Mesa(capacidade) VALUES(?)", Statement.RETURN_GENERATED_KEYS);
            ps.setShort(1, mesa.getCapacidade());
            return ps;
        }, keyHolder);

        if(keyHolder.getKey() == null) {
            return 0;
        }

        return keyHolder.getKey().shortValue();
    }

    public int updateMesa(Mesa mesa) {
        return this.jdbcTemplate.update("UPDATE Mesa SET id_func=?, id_reserva=?, status_mesa=?, capacidade=? WHERE id_mesa =?", mesa.getId_func(), mesa.getId_reserva(), mesa.getStatus_mesa().name(), mesa.getCapacidade(), mesa.getId_mesa());
    }

    public int deleteMesaById(short id_mesa) {
        return this.jdbcTemplate.update("DELETE FROM Mesa WHERE id_mesa=?", id_mesa);
    }
}
