package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Procedimento;
import com.clinica.odontologica.service.ProcedimentoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos Procedimentos. CRUD completo.
 */
@RestController
@RequestMapping("/api/procedimentos")
public class ProcedimentoController {

    private final ProcedimentoService service;

    public ProcedimentoController(ProcedimentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Procedimento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Procedimento buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Procedimento> criar(@RequestBody Procedimento procedimento) {
        Procedimento criado = service.criar(procedimento);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Procedimento atualizar(@PathVariable Integer id, @RequestBody Procedimento procedimento) {
        return service.atualizar(id, procedimento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
