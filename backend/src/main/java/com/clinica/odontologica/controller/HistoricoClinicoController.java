package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.HistoricoClinico;
import com.clinica.odontologica.service.HistoricoClinicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller do Histórico Clínico. CRUD completo + listagem por paciente.
 */
@RestController
@RequestMapping("/api/historicos")
public class HistoricoClinicoController {

    private final HistoricoClinicoService service;

    public HistoricoClinicoController(HistoricoClinicoService service) {
        this.service = service;
    }

    @GetMapping
    public List<HistoricoClinico> listar() {
        return service.listarTodos();
    }

    // GET /api/historicos/paciente/5 -> lista os históricos do paciente de id 5.
    @GetMapping("/paciente/{idPaciente}")
    public List<HistoricoClinico> listarPorPaciente(@PathVariable Integer idPaciente) {
        return service.listarPorPaciente(idPaciente);
    }

    @GetMapping("/{id}")
    public HistoricoClinico buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/historicos -> cria um histórico vinculado a um paciente
    // (ex: { "paciente": { "idPaciente": 1 }, "alergias": "Penicilina" }).
    @PostMapping
    public ResponseEntity<HistoricoClinico> criar(@RequestBody HistoricoClinico historico) {
        HistoricoClinico criado = service.criar(historico);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public HistoricoClinico atualizar(@PathVariable Integer id, @RequestBody HistoricoClinico historico) {
        return service.atualizar(id, historico);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
