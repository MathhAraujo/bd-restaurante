package com.example.restaurante.controller;

import com.example.restaurante.model.Cliente;
import com.example.restaurante.service.ClienteService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("api/cliente")
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping("/find/all")
    public ResponseEntity<List<Cliente>> getAllCliente() {
        List<Cliente> clientes = clienteService.fetchAllCliente();
        if (clientes.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(clientes, HttpStatus.OK);
    }

    @GetMapping("/find/cpf/{cpf}")
    public ResponseEntity<Cliente> fetchClienteByCpf(@PathVariable("cpf") String cpf) {
        Cliente cliente = clienteService.fetchClienteByCpf(cpf);
        if (cliente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(cliente, HttpStatus.OK);
    }

    @GetMapping("/find/nome/{nome}")
    public ResponseEntity<List<Cliente>> fetchClienteByNome(@PathVariable("nome") String nome) {
        List<Cliente> cliente = clienteService.fetchClienteByNome(nome);
        if (cliente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(cliente, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Cliente> addCliente(@RequestBody Cliente cliente) {
        Cliente newCliente = clienteService.createCliente(cliente);
        if (newCliente == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(newCliente, HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<Cliente> updateCliente(@RequestBody Cliente cliente) {
        Cliente clienteUpdate = clienteService.updateCliente(cliente);

        if (clienteUpdate == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(clienteUpdate, HttpStatus.OK);

    }

    @DeleteMapping("delete/{cpf}")
    public ResponseEntity<?> deleteCliente(@PathVariable("cpf") String cpf) {
        int ok = clienteService.deleteCliente(cpf);

        if (ok == 0) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }

}
