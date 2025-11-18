package com.example.restaurante.controller;


import com.example.restaurante.dto.*;
import com.example.restaurante.service.DataService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/data")
public class DataController {

    private final DataService dataService;

    @GetMapping("/reserva_day")
    public ResponseEntity<List<Occupation_DayDTO>> findOccupationPerDay() {
        return new ResponseEntity<>(dataService.fetchOccupationPerDay(), HttpStatus.OK);
    }

    @GetMapping("/reserva_count_month")
    public ResponseEntity<List<Reserva_MontlyDTO>> findOccupationPerMonth() {
        return new ResponseEntity<>(dataService.fetchReservaPerMonth(), HttpStatus.OK);
    }

    @GetMapping("/peak_reserva_hour")
    public ResponseEntity<List<Peak_ReservasDTO>> findPeakClienteHour() {
        return new ResponseEntity<>(dataService.fetchPeakClienteHour(), HttpStatus.OK);
    }

    @GetMapping("/group_size_distribution")
    public ResponseEntity<List<Group_Size_DistDTO>> findGroupSizeDist() {
        return new ResponseEntity<>(dataService.fetchGroupSizeDist(), HttpStatus.OK);
    }

    @GetMapping("/cliente_area_distribution")
    public ResponseEntity<List<Cliente_area_DistDTO>> findClienteAreaDist() {
        return new ResponseEntity<>(dataService.fetchClienteAreaDist(), HttpStatus.OK);
    }

    @GetMapping("/mesa_full")
    public ResponseEntity<List<Mesa_Full_FunDTO>> findMesaFull() {
        return new ResponseEntity<>(dataService.fetchMesaFull(), HttpStatus.OK);
    }

    @GetMapping("/cliente_reserva_bigger_avg")
    public ResponseEntity<List<Cliente_Reserva_BiggerThanAvgDTO>> findReserva_Bigger_Avg() {
        return new ResponseEntity<>(dataService.fetchClienteReservaBiggerThanAvg(), HttpStatus.OK);
    }

    @GetMapping("/cliente_reserva_cancelada")
    public ResponseEntity<List<Cliente_Reserva_CanceladaDTO>> findClienteReservaCancelada() {
        return new ResponseEntity<>(dataService.fetchClienteReservaCancelada(), HttpStatus.OK);
    }

    @GetMapping("/occupation_percent")
    public ResponseEntity<Occupation_PercentageDTO> findOccupation_Percentage() {
        return new ResponseEntity<>(dataService.fetchOccupationPercentage(), HttpStatus.OK);
    }

    @GetMapping("/reserva_future_full")
    public ResponseEntity<List<Reserva_Future_FullDTO>> findReserva_Future_Full() {
        return new ResponseEntity<>(dataService.fetchReservaFutureFull(), HttpStatus.OK);
    }

    @GetMapping("/mesa_ocupada_full")
    public ResponseEntity<List<Mesa_Ocupada_FullDTO>> findMesaOcupadaFull() {
        return new ResponseEntity<>(dataService.fetchMesaOcupadaFull(), HttpStatus.OK);
    }

    @GetMapping("/cliente_total_spent")
    public ResponseEntity<List<Cliente_Total_SpentDTO>> findClienteTotal_Spent() {
        return new ResponseEntity<>(dataService.fetchClienteTotalSpent(), HttpStatus.OK);
    }

    @GetMapping("/comanda_paga_log")
    public ResponseEntity<List<Comanda_Paga_LogDTO>> findComandaPagaLog() {
        return new ResponseEntity<>(dataService.fetchComandaPagaLog(), HttpStatus.OK);
    }

}
