package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Paciente;
import com.clinica.odontologica.service.PacienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos Pacientes.
 * Expõe o CRUD completo e também uma busca por nome/CPF.
 */
@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    // GET /api/pacientes -> lista todos os pacientes.
    @GetMapping
    public List<Paciente> listar() {
        return service.listarTodos();
    }

    // GET /api/pacientes/buscar?termo=joao -> busca por nome OU CPF.
    // @RequestParam pega o valor que vem depois do "?" na URL (termo=joao).
    @GetMapping("/buscar")
    public List<Paciente> buscar(@RequestParam String termo) {
        return service.buscar(termo);
    }

    // GET /api/pacientes/5 -> busca um paciente específico.
    @GetMapping("/{id}")
    public Paciente buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/pacientes -> cadastra um novo paciente (retorna 201 CREATED).
    @PostMapping
    public ResponseEntity<Paciente> criar(@RequestBody Paciente paciente) {
        Paciente criado = service.criar(paciente);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // PUT /api/pacientes/5 -> atualiza o paciente de id 5.
    @PutMapping("/{id}")
    public Paciente atualizar(@PathVariable Integer id, @RequestBody Paciente paciente) {
        return service.atualizar(id, paciente);
    }

    // DELETE /api/pacientes/5 -> apaga o paciente de id 5 (retorna 204 No Content).
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
