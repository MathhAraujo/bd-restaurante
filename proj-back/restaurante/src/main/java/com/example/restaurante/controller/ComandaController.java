package com.example.restaurante.controller;

import com.example.restaurante.dto.Calc_ComissaoDTO;
import com.example.restaurante.model.Comanda;
import com.example.restaurante.service.ComandaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/comanda")
public class ComandaController {

    private final ComandaService comandaService;

    @GetMapping("/find/all")
    public ResponseEntity<List<Comanda>> getAllComanda() {
        List<Comanda> comandas = comandaService.fetchAllComandas();
        if (comandas.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(comandas, HttpStatus.OK);
    }

    @GetMapping("/find/id/{id}")
    public ResponseEntity<Comanda> getComandaById(@PathVariable("id") short id) {
        Comanda comanda = comandaService.fetchComandaById(id);
        if (comanda == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(comanda, HttpStatus.OK);
    }

    @PostMapping("/add/{id_mesa}")
    public ResponseEntity<Comanda> createComanda(@PathVariable short id_mesa) {
        Comanda newComanda = comandaService.createComanda(id_mesa);
        if (newComanda == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(newComanda, HttpStatus.OK);
    }

    @PostMapping("/call/add_comissao")
    public ResponseEntity<Comanda> addComissao(@RequestBody Calc_ComissaoDTO calc_comissaoDTO) {
        if (calc_comissaoDTO == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(comandaService.addComissao(calc_comissaoDTO), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<Comanda> updateComanda(@RequestBody Comanda comanda) {
        Comanda comandaUpdate = comandaService.updateComanda(comanda);
        if (comandaUpdate == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(comandaUpdate, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id_comanda}")
    public ResponseEntity<Comanda> deleteComanda(@PathVariable short id_comanda) {
        if (comandaService.deleteComanda(id_comanda) == 0) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}