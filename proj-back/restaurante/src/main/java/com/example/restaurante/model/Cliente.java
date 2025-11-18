package com.example.restaurante.model;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@ToString
public class Cliente {

    private String cpf;
    private String telefone;
    private String nome;
    private LocalDate data_nascimento;

}