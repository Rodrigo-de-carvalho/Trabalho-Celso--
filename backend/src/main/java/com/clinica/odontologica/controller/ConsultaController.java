package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Consulta;
import com.clinica.odontologica.service.ConsultaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller das Consultas. CRUD completo.
 * O valor_total é calculado automaticamente no ConsultaService.
 */
@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    private final ConsultaService service;

    public ConsultaController(ConsultaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Consulta> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Consulta buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/consultas -> registra a consulta a partir de um agendamento.
    // Basta enviar o id do agendamento (ex: { "agendamento": { "idAgendamento": 1 } });
    // o service copia paciente/dentista/procedimento e calcula o valor total.
    @PostMapping
    public ResponseEntity<Consulta> criar(@RequestBody Consulta consulta) {
        Consulta criada = service.criar(consulta);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public Consulta atualizar(@PathVariable Integer id, @RequestBody Consulta consulta) {
        return service.atualizar(id, consulta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
