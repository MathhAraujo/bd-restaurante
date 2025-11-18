package com.example.restaurante.dao;

import com.example.restaurante.enums.Status_Comanda;
import com.example.restaurante.model.Comanda;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
@AllArgsConstructor
public class ComandaDao {
    private final JdbcTemplate jdbcTemplate;

    private Comanda mapRowToComanda(ResultSet rs, int rowNum) throws SQLException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new Comanda(
                rs.getShort("id_comanda"),
                rs.getShort("id_mesa"),
                rs.getFloat("total"),
                LocalDateTime.parse(rs.getString("data_hora_criacao"), formatter),
                Status_Comanda.valueOf(rs.getString("status_comanda"))
        );
    }

    public List<Comanda> findAllComanda() {
        return this.jdbcTemplate.query("SELECT * FROM Comanda", this::mapRowToComanda);
    }

    public List<Comanda> findComandaById(short idComanda) {
        return this.jdbcTemplate.query("SELECT * FROM Comanda WHERE id_comanda = ?", this::mapRowToComanda, idComanda);
    }

    public Short insertComanda(Comanda comanda) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        this.jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("INSERT INTO Comanda(id_mesa) VALUES(?)", Statement.RETURN_GENERATED_KEYS);
            ps.setShort(1, comanda.getId_mesa());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            return null;
        }

        return keyHolder.getKey().shortValue();
    }

    public int updateComanda(Comanda comanda) {
        return this.jdbcTemplate.update("UPDATE Comanda SET total=?, status_comanda=? WHERE id_comanda=?", comanda.getTotal(), comanda.getStatus_comanda().name(), comanda.getId_comanda());
    }

    public int deleteComanda(short id_comanda) {
        return this.jdbcTemplate.update("DELETE FROM Comanda WHERE id_comanda=?", id_comanda);
    }

    public int addComissao(short id_comanda, float percentual) {
        return this.jdbcTemplate.update("CALL prc_aplica_desconto(?, ?)", id_comanda, percentual);
    }
}
