package com.example.restaurante.service;

import com.example.restaurante.dao.DataDao;
import com.example.restaurante.dto.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class DataService {
    private final DataDao dataDao;

    public List<Occupation_DayDTO> fetchOccupationPerDay() {
        return dataDao.findOccupationPerDay();
    }


    public List<Reserva_MontlyDTO> fetchReservaPerMonth() {
        return dataDao.findReservaPerMonth();
    }

    public List<Peak_ReservasDTO> fetchPeakClienteHour() {
        return dataDao.findPeakClienteHour();
    }

    public List<Group_Size_DistDTO> fetchGroupSizeDist() {
        return dataDao.findGroupSizeDist();
    }

    public List<Cliente_area_DistDTO> fetchClienteAreaDist() {
        return dataDao.findClienteAreaDist();
    }
}
