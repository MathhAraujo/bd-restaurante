package com.example.restaurante.service;

import com.example.restaurante.dao.MesaDao;
import com.example.restaurante.model.Mesa;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MesaService {

    private final MesaDao mesaDao;

    public List<Mesa> fetchAllMesa(){
        return mesaDao.findAllMesa();
    }

    public Mesa fetchMesaById(short id){
        List<Mesa> mesa = this.mesaDao.findMesaById(id);
        if(mesa.isEmpty()){
            return null;
        }
        return mesa.get(0);
    }

    public Mesa createMesa(short capacidade){
        short out = mesaDao.insertMesa(new Mesa(capacidade));
        if(out != 0){
            return fetchMesaById(out);
        }
        return null;
    }

    public Mesa updateMesa(Mesa mesa){
        if(mesaDao.updateMesa(mesa) == 1){
            return mesa;
        }
        return null;
    }

    public int deleteMesa(short id_mesa){
        return mesaDao.deleteMesaById(id_mesa);
    }

}
