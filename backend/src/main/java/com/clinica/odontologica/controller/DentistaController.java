package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Dentista;
import com.clinica.odontologica.service.DentistaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos Dentistas. CRUD completo da entidade Dentista.
 */
@RestController
@RequestMapping("/api/dentistas")
public class DentistaController {

    private final DentistaService service;

    public DentistaController(DentistaService service) {
        this.service = service;
    }

    // GET /api/dentistas -> lista todos.
    @GetMapping
    public List<Dentista> listar() {
        return service.listarTodos();
    }

    // GET /api/dentistas/5 -> busca por id.
    @GetMapping("/{id}")
    public Dentista buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/dentistas -> cadastra (valida CRO e e-mail únicos no service).
    @PostMapping
    public ResponseEntity<Dentista> criar(@RequestBody Dentista dentista) {
        Dentista criado = service.criar(dentista);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // PUT /api/dentistas/5 -> atualiza.
    @PutMapping("/{id}")
    public Dentista atualizar(@PathVariable Integer id, @RequestBody Dentista dentista) {
        return service.atualizar(id, dentista);
    }

    // DELETE /api/dentistas/5 -> apaga.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
