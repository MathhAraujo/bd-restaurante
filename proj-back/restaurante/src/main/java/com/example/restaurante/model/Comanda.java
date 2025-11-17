package com.example.restaurante.model;

import com.example.restaurante.enums.Status_Comanda;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Comanda {

    private short id_comanda;
    private short id_mesa;
    private float total;
    private LocalDateTime data_hora_criacao;
    private Status_Comanda status_comanda;

    public Comanda(short id_mesa) {
        this.id_mesa = id_mesa;
    }

}
