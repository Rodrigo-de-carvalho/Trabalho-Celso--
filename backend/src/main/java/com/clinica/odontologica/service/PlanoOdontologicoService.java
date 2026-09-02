package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.PlanoOdontologico;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.repository.PlanoOdontologicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service do Plano Odontológico.
 *
 * O Service é a camada que guarda as REGRAS DE NEGÓCIO. O Controller (que recebe
 * as requisições) chama o Service, e o Service usa o Repository para falar com o banco.
 * Assim cada camada tem uma responsabilidade clara.
 */
// @Service avisa o Spring que esta classe é um "serviço" e pode ser injetada em outras classes.
@Service
public class PlanoOdontologicoService {

    // O Service precisa do Repository para acessar o banco. Guardamos ele aqui.
    private final PlanoOdontologicoRepository repository;

    // Injeção por construtor: o Spring entrega automaticamente uma instância do Repository.
    public PlanoOdontologicoService(PlanoOdontologicoRepository repository) {
        this.repository = repository;
    }

    // Lista todos os planos cadastrados.
    public List<PlanoOdontologico> listarTodos() {
        return repository.findAll();
    }

    // Busca um plano pelo id; se não existir, lança erro 404 (não encontrado).
    public PlanoOdontologico buscarPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Plano odontológico não encontrado com id " + id));
    }

    // Cria um novo plano no banco.
    public PlanoOdontologico criar(PlanoOdontologico plano) {
        return repository.save(plano);
    }

    // Atualiza um plano existente: primeiro confirma que ele existe, depois salva por cima.
    public PlanoOdontologico atualizar(Integer id, PlanoOdontologico plano) {
        buscarPorId(id);            // garante que o id existe (senão dá 404)
        plano.setIdPlano(id);       // força o id correto para o save() ATUALIZAR (e não criar outro)
        return repository.save(plano);
    }

    // Apaga um plano pelo id (confirma que existe antes, para dar erro claro se não existir).
    public void deletar(Integer id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
