package com.example.restaurante.service;

import com.example.restaurante.dao.ComandaDao;
import com.example.restaurante.model.Comanda;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ComandaService {
    private final ComandaDao comandaDao;

    public List<Comanda> fetchAllComandas() {
        return comandaDao.findAllComanda();
    }

    public Comanda fetchComandaById(short id_comanda) {
        List<Comanda> out = comandaDao.findComandaById(id_comanda);
        if (out.isEmpty()) {
            return null;
        }
        return out.get(0);
    }

    public Comanda createComanda(short id_mesa) {
        Short out = comandaDao.insertComanda(new Comanda(id_mesa));
        if (out == null) {
            return null;
        }
        return fetchComandaById(out);
    }

    public Comanda updateComanda(Comanda comanda) {
        if (comandaDao.updateComanda(comanda) == 1) {
            return fetchComandaById(comanda.getId_comanda());
        }
        return null;
    }

    public int deleteComanda(short id_comanda) {
        return comandaDao.deleteComanda(id_comanda);
    }

}
