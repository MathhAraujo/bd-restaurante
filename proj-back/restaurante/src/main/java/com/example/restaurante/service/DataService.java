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

    public List<Mesa_Full_FunDTO> fetchMesaFull() {
        return dataDao.findMesaFull();
    }

    public List<Cliente_Reserva_BiggerThanAvgDTO> fetchClienteReservaBiggerThanAvg() {
        return dataDao.fetchClienteWithBiggerAvgReserva();
    }

    public List<Cliente_Reserva_CanceladaDTO> fetchClienteReservaCancelada() {
        return dataDao.fetchClienteWithReservaCandelada();
    }

    public Occupation_PercentageDTO fetchOccupationPercentage() {
        return dataDao.fetchOccupationPercentage();
    }

    public List<Reserva_Future_FullDTO> fetchReservaFutureFull() {
        return dataDao.fetchReservaFutureFull();
    }

    public List<Mesa_Ocupada_FullDTO> fetchMesaOcupadaFull() {
        return dataDao.fetchMesaOcupadaFull();
    }

    public List<Cliente_Total_SpentDTO> fetchClienteTotalSpent() {
        return dataDao.fetchClienteTotalSpent();
    }

    public List<Comanda_Paga_LogDTO> fetchComandaPagaLog() {
        return dataDao.fetchComandaPagaLog();
    }

}
