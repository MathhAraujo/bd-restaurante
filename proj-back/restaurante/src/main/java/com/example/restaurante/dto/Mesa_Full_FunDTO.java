package com.example.restaurante.dto;

import com.example.restaurante.enums.Status_Mesa;

public record Mesa_Full_FunDTO(
        String cpf,
        String nome,
        Short id_reserva,
        java.sql.Date data_hora_chegada,
        Short id_mesa,
        Status_Mesa status_mesa) {
}
