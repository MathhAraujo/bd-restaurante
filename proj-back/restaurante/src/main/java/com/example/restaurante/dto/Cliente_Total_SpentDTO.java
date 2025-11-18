package com.example.restaurante.dto;

import java.time.LocalDateTime;

public record Cliente_Total_SpentDTO(
        Integer id_registro,
        String cpf_cliente,
        String nome_cliente,
        Float total_gasto,
        LocalDateTime data_atualizacao
) {
}
