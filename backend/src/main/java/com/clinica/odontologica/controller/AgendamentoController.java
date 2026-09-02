package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Agendamento;
import com.clinica.odontologica.service.AgendamentoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos Agendamentos. CRUD completo.
 * As regras (horário ocupado, ids existem) ficam no AgendamentoService.
 */
@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService service;

    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Agendamento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Agendamento buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/agendamentos -> cria o agendamento. O frontend envia os ids do
    // paciente, dentista e procedimento (ex: { "paciente": { "idPaciente": 1 }, ... }).
    @PostMapping
    public ResponseEntity<Agendamento> criar(@RequestBody Agendamento agendamento) {
        Agendamento criado = service.criar(agendamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Agendamento atualizar(@PathVariable Integer id, @RequestBody Agendamento agendamento) {
        return service.atualizar(id, agendamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
