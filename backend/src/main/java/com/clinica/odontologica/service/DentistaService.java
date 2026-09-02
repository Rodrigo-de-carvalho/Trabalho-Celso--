package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Dentista;
import com.clinica.odontologica.exception.ConflitoException;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.repository.DentistaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service do Dentista.
 *
 * Regra de negócio principal: CRO e e-mail precisam ser ÚNICOS.
 */
@Service
public class DentistaService {

    private final DentistaRepository repository;

    public DentistaService(DentistaRepository repository) {
        this.repository = repository;
    }

    public List<Dentista> listarTodos() {
        return repository.findAll();
    }

    public Dentista buscarPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Dentista não encontrado com id " + id));
    }

    // Cria um dentista, validando CRO e e-mail únicos antes de salvar.
    public Dentista criar(Dentista dentista) {
        validarUnicidadeParaCriacao(dentista);
        return repository.save(dentista);
    }

    // Atualiza um dentista existente.
    public Dentista atualizar(Integer id, Dentista dentista) {
        buscarPorId(id);
        validarUnicidadeParaEdicao(dentista, id);
        dentista.setIdDentista(id);
        return repository.save(dentista);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        repository.deleteById(id);
    }

    // ---------------- REGRAS DE NEGÓCIO ----------------

    // Na criação: ninguém pode ter CRO ou e-mail repetido.
    private void validarUnicidadeParaCriacao(Dentista d) {
        if (repository.existsByCro(d.getCro())) {
            throw new ConflitoException("Já existe um dentista cadastrado com este CRO.");
        }
        if (repository.existsByEmail(d.getEmail())) {
            throw new ConflitoException("Já existe um dentista cadastrado com este e-mail.");
        }
    }

    // Na edição: ignoramos o próprio dentista (ele pode manter o próprio CRO/e-mail).
    private void validarUnicidadeParaEdicao(Dentista d, Integer id) {
        if (repository.existsByCroAndIdDentistaNot(d.getCro(), id)) {
            throw new ConflitoException("Já existe OUTRO dentista cadastrado com este CRO.");
        }
        if (repository.existsByEmailAndIdDentistaNot(d.getEmail(), id)) {
            throw new ConflitoException("Já existe OUTRO dentista cadastrado com este e-mail.");
        }
    }
}
