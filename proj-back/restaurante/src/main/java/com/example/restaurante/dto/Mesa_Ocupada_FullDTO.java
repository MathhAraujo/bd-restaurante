package com.example.restaurante.dto;

import com.example.restaurante.enums.Status_Comanda;
import com.example.restaurante.enums.Status_Mesa;
import com.example.restaurante.enums.Status_Reserva;

import java.time.LocalDateTime;

public record Mesa_Ocupada_FullDTO(
        Short id_mesa,
        Status_Mesa status_mesa,
        Short capacidade,
        Short id_reserva,
        Short qnt_pessoas,
        LocalDateTime data_hora_chegada,
        Status_Reserva status_reserva,
        String cpf,
        Short id_comanda,
        Status_Comanda statusComanda,
        Float total
) {
}
