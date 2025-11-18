package com.example.restaurante.dto;

import com.example.restaurante.enums.Status_Comanda;

import java.time.LocalDateTime;

public record Comanda_Paga_LogDTO(
        Integer id_log,
        Short id_comanda,
        String cpf_cliente,
        String nome_cliente,
        Short id_reserva,
        Float total_comanda,
        LocalDateTime data_hora_criacao,
        Status_Comanda status_comanda,
        Short id_func_garcom,
        LocalDateTime data_registro

) {
}
