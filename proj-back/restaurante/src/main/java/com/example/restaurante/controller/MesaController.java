package com.example.restaurante.controller;

import com.example.restaurante.model.Mesa;
import com.example.restaurante.service.MesaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("api/mesa")
public class MesaController {

    private MesaService mesaService;

    @GetMapping("/find/all")
    public ResponseEntity<List<Mesa>> listarMesas() {
        List<Mesa> mesas = mesaService.fetchAllMesa();
        if (mesas == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(mesas, HttpStatus.OK);
    }

    @GetMapping("/find/id/{id}")
    public ResponseEntity<Mesa> buscarMesaId(@PathVariable short id) {
        Mesa mesa = mesaService.fetchMesaById(id);
        if (mesa == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(mesa, HttpStatus.OK);
    }

    @PostMapping("/add/{capacidade}")
    public ResponseEntity<Mesa> addMesa(@PathVariable short capacidade) {
        Mesa newMesa = mesaService.createMesa(capacidade);
        if (newMesa == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(newMesa, HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<Mesa> updateMesa(@RequestBody Mesa mesa) {
        Mesa newMesa = mesaService.updateMesa(mesa);
        if (newMesa == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(newMesa, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id_mesa}")
    public ResponseEntity<Mesa> deleteMesa(@PathVariable short id_mesa) {
        if (mesaService.deleteMesa(id_mesa) == 0) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
