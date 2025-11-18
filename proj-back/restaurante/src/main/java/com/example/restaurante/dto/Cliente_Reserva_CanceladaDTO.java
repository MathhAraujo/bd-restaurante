package com.example.restaurante.dto;

import com.example.restaurante.enums.Status_Reserva;

import java.time.LocalDateTime;

public record Cliente_Reserva_CanceladaDTO(
        String cpf,
        String nome,
        String telefone,
        Short id_reserva,
        Short qnt_pessoas,
        LocalDateTime data_hora_chegada,
        Status_Reserva status_reserva
) {
}
