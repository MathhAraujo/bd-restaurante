package com.example.restaurante.service;

import com.example.restaurante.dao.ClienteDao;
import com.example.restaurante.model.Cliente;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@AllArgsConstructor
public class ClienteService {

    private final ClienteDao clienteDao;

    public List<Cliente> fetchAllCliente() {
        return clienteDao.findAllCliente();
    }

    public Cliente fetchClienteByCpf(String cpf) {
        List<Cliente> result = clienteDao.findClienteByCpf(cpf);

        if (result.isEmpty()) {
            return null;
        }

        return result.get(0);
    }

    public List<Cliente> fetchClienteByNome(String nome) {
        List<Cliente> result = clienteDao.findClienteByNome(nome);
        if (result.isEmpty()) {
            return null;
        }
        return result;
    }

    public Cliente createCliente(Cliente cliente) {
        if (clienteDao.insertCliente(cliente) == 1) {
            return cliente;
        }
        return null;
    }

    public Cliente updateCliente(Cliente cliente) {
        if (clienteDao.updateCliente(cliente) == 1) {
            return cliente;
        }
        return null;
    }

    public int deleteCliente(String cpf) {
        return clienteDao.deleteCliente(cpf);

    }

}
