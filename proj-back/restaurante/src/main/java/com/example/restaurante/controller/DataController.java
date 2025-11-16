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
        return new ResponseEntity<>(dataService.fetchGroupSizeDist(),HttpStatus.OK);
    }

    @GetMapping("/cliente_area_distribution")
    public ResponseEntity<List<Cliente_area_DistDTO>> findClienteAreaDist(){
        return new ResponseEntity<>(dataService.fetchClienteAreaDist(), HttpStatus.OK);
    }

}
