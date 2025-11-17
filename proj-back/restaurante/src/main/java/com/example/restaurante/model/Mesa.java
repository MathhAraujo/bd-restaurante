package com.example.restaurante.model;

import com.example.restaurante.enums.Status_Mesa;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Mesa {

    private short id_mesa;
    private Short id_func;
    private Short id_reserva;
    private Status_Mesa status_mesa;
    private short capacidade;

    public Mesa(short capacidade) {
        this.capacidade = capacidade;
    }

}
