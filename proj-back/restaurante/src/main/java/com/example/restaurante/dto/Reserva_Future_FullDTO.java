package com.example.restaurante.dto;

import com.example.restaurante.enums.Status_Mesa;
import com.example.restaurante.enums.Status_Reserva;

import java.time.LocalDateTime;

public record Reserva_Future_FullDTO(
        Short id_reserva,
        String cliente_cpf,
        String nome,
        Short qnt_pessoas,
        LocalDateTime data_hora_chegada,
        Status_Reserva status_reserva,
        Short id_mesa,
        Status_Mesa status_mesa,
        Short capacidade,
        Short id_func
) {
}
