package com.example.restaurante.dto;

import com.example.restaurante.enums.Status_Reserva;

import java.time.LocalDateTime;

public record ReservaFuturaDTO(
        String nome,
        String telefone,
        short id_reserva,
        short qnt_pessoas,
        LocalDateTime data_hora_chegada,
        Status_Reserva status_reserva
) {}
