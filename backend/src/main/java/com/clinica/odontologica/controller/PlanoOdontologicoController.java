package com.clinica.odontologica.controller;

import com.clinica.odontologica.entity.PlanoOdontologico;
import com.clinica.odontologica.service.PlanoOdontologicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos Planos Odontológicos.
 *
 * O Controller é a "porta de entrada" da API: ele recebe as requisições HTTP do
 * frontend (GET, POST, PUT, DELETE), chama o Service para fazer o trabalho e
 * devolve a resposta em JSON.
 */
// @RestController = este é um controller REST; tudo que ele retornar vira JSON automaticamente.
@RestController
// @RequestMapping define o "endereço base" de todos os endpoints desta classe.
@RequestMapping("/api/planos")
public class PlanoOdontologicoController {

    private final PlanoOdontologicoService service;

    // O Spring injeta o Service automaticamente pelo construtor.
    public PlanoOdontologicoController(PlanoOdontologicoService service) {
        this.service = service;
    }

    // @GetMapping (sem caminho) -> responde a GET /api/planos. Lista todos os planos.
    @GetMapping
    public List<PlanoOdontologico> listar() {
        return service.listarTodos();
    }

    // @GetMapping("/{id}") -> GET /api/planos/5. @PathVariable pega o "5" da URL.
    @GetMapping("/{id}")
    public PlanoOdontologico buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    // @PostMapping -> POST /api/planos. @RequestBody transforma o JSON recebido em objeto Java.
    // Retornamos status 201 (CREATED) para indicar que um recurso novo foi criado.
    @PostMapping
    public ResponseEntity<PlanoOdontologico> criar(@RequestBody PlanoOdontologico plano) {
        PlanoOdontologico criado = service.criar(plano);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // @PutMapping("/{id}") -> PUT /api/planos/5. Atualiza o plano de id 5.
    @PutMapping("/{id}")
    public PlanoOdontologico atualizar(@PathVariable Integer id, @RequestBody PlanoOdontologico plano) {
        return service.atualizar(id, plano);
    }

    // @DeleteMapping("/{id}") -> DELETE /api/planos/5. Status 204 (No Content) = apagado com sucesso.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
