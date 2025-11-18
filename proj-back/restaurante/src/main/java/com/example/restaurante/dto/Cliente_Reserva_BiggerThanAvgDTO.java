package com.example.restaurante.dto;

public record Cliente_Reserva_BiggerThanAvgDTO(
        String nome,
        String telefone,
        Short id_mesa,
        Short capacidade
) {
}
