package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.Pagamento;
import com.clinica.odontologica.service.PagamentoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos Pagamentos. CRUD completo.
 * Cada pagamento é vinculado a uma consulta (ver PagamentoService).
 */
@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private final PagamentoService service;

    public PagamentoController(PagamentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pagamento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Pagamento buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // POST /api/pagamentos -> registra um pagamento de uma consulta
    // (ex: { "consulta": { "idConsulta": 1 }, "formaPagamento": "Pix", "valorPago": 150.00 }).
    @PostMapping
    public ResponseEntity<Pagamento> criar(@RequestBody Pagamento pagamento) {
        Pagamento criado = service.criar(pagamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Pagamento atualizar(@PathVariable Integer id, @RequestBody Pagamento pagamento) {
        return service.atualizar(id, pagamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
