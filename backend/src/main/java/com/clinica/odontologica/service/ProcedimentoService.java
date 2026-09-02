package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Procedimento;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.repository.ProcedimentoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service do Procedimento.
 * CRUD simples (não tem regra de unicidade), serve de exemplo limpo da camada de serviço.
 */
@Service
public class ProcedimentoService {

    private final ProcedimentoRepository repository;

    public ProcedimentoService(ProcedimentoRepository repository) {
        this.repository = repository;
    }

    public List<Procedimento> listarTodos() {
        return repository.findAll();
    }

    public Procedimento buscarPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Procedimento não encontrado com id " + id));
    }

    public Procedimento criar(Procedimento procedimento) {
        return repository.save(procedimento);
    }

    public Procedimento atualizar(Integer id, Procedimento procedimento) {
        buscarPorId(id);
        procedimento.setIdProcedimento(id);
        return repository.save(procedimento);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
