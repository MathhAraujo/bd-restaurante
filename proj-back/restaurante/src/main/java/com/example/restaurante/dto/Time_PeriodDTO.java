package com.example.restaurante.dto;

import java.time.LocalDateTime;

public record Time_PeriodDTO(
        LocalDateTime init,
        LocalDateTime end
) {
}