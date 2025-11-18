package com.example.restaurante.dao;

import com.example.restaurante.model.Cliente;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ClienteDao {

    private final JdbcTemplate jdbcTemplate;

    private Cliente mapRowToCliente(ResultSet rs, int rowNum) throws SQLException {
        return new Cliente(
                rs.getString("cpf"),
                rs.getString("nome"),
                rs.getString("telefone"),
                rs.getObject("data_nascimento", LocalDate.class)
        );
    }

    public List<Cliente> findAllCliente() {
        return this.jdbcTemplate.query("SELECT * FROM Cliente", this::mapRowToCliente);
    }

    public List<Cliente> findClienteByCpf(String cpf) {
        return this.jdbcTemplate.query("SELECT * FROM Cliente WHERE cpf=?", this::mapRowToCliente, cpf);
    }

    public List<Cliente> findClienteByNome(String nome) {
        return this.jdbcTemplate.query("SELECT * FROM Cliente WHERE nome like UPPER(?)", this::mapRowToCliente, "%" + nome + "%".toUpperCase());
    }

    public List<Cliente> findClienteWoutReserva() {
        return this.jdbcTemplate.query("SELECT * FROM Cliente AS c LEFT JOIN Reserva AS r ON c.cpf = r.cliente_cpf WHERE r.id_reserva IS NULL", this::mapRowToCliente);
    }


    public int insertCliente(Cliente cliente) {
        return this.jdbcTemplate.update("INSERT INTO Cliente(cpf, nome, telefone, data_nascimento) VALUES(?,?,?,?)", cliente.getCpf(), cliente.getNome(), cliente.getTelefone(), cliente.getData_nascimento());
    }

    public int updateCliente(Cliente cliente) {
        return this.jdbcTemplate.update("UPDATE Cliente SET Nome=?, Telefone=?, Data_nascimento=? WHERE cpf=?", cliente.getNome(), cliente.getTelefone(), cliente.getData_nascimento(), cliente.getCpf());
    }

    public int deleteCliente(String cpf) {
        return this.jdbcTemplate.update("DELETE FROM Cliente WHERE cpf=?", cpf);
    }

}

