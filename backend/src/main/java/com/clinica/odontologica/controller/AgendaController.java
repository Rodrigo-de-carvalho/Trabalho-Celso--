package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Agenda;
import com.clinica.odontologica.service.AgendaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller da Agenda (horários dos dentistas). CRUD completo + listagem por dentista.
 */
@RestController
@RequestMapping("/api/agendas")
public class AgendaController {

    private final AgendaService service;

    public AgendaController(AgendaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Agenda> listar() {
        return service.listarTodos();
    }

    // GET /api/agendas/dentista/5 -> lista os horários do dentista de id 5.
    @GetMapping("/dentista/{idDentista}")
    public List<Agenda> listarPorDentista(@PathVariable Integer idDentista) {
        return service.listarPorDentista(idDentista);
    }

    @GetMapping("/{id}")
    public Agenda buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/agendas -> cria um bloco de horário para um dentista
    // (ex: { "dentista": { "idDentista": 1 }, "data": "2026-07-01", "horaInicio": "08:00", "horaFim": "12:00" }).
    @PostMapping
    public ResponseEntity<Agenda> criar(@RequestBody Agenda agenda) {
        Agenda criada = service.criar(agenda);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public Agenda atualizar(@PathVariable Integer id, @RequestBody Agenda agenda) {
        return service.atualizar(id, agenda);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
