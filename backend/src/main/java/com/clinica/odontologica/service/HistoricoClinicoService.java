package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.HistoricoClinico;
import com.clinica.odontologica.entity.Paciente;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.exception.RequisicaoInvalidaException;
import com.clinica.odontologica.repository.HistoricoClinicoRepository;
import com.clinica.odontologica.repository.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service do Histórico Clínico.
 *
 * Regra de negócio: todo histórico precisa estar vinculado a um paciente existente.
 */
@Service
public class HistoricoClinicoService {

    private final HistoricoClinicoRepository historicoRepository;
    private final PacienteRepository pacienteRepository;

    public HistoricoClinicoService(HistoricoClinicoRepository historicoRepository,
                                   PacienteRepository pacienteRepository) {
        this.historicoRepository = historicoRepository;
        this.pacienteRepository = pacienteRepository;
    }

    public List<HistoricoClinico> listarTodos() {
        return historicoRepository.findAll();
    }

    public HistoricoClinico buscarPorId(Integer id) {
        return historicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Histórico clínico não encontrado com id " + id));
    }

    // Lista todos os históricos de um paciente específico (usado na tela de Histórico).
    public List<HistoricoClinico> listarPorPaciente(Integer idPaciente) {
        return historicoRepository.findByPacienteIdPaciente(idPaciente);
    }

    public HistoricoClinico criar(HistoricoClinico historico) {
        resolverPaciente(historico);
        return historicoRepository.save(historico);
    }

    public HistoricoClinico atualizar(Integer id, HistoricoClinico historico) {
        buscarPorId(id);
        resolverPaciente(historico);
        historico.setIdHistorico(id);
        return historicoRepository.save(historico);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        historicoRepository.deleteById(id);
    }

    // ---------------- REGRAS DE NEGÓCIO ----------------

    // Confirma que o paciente informado existe e carrega o objeto completo.
    private void resolverPaciente(HistoricoClinico historico) {
        if (historico.getPaciente() == null || historico.getPaciente().getIdPaciente() == null) {
            throw new RequisicaoInvalidaException(
                    "É obrigatório informar o paciente do histórico clínico.");
        }
        Paciente paciente = pacienteRepository
                .findById(historico.getPaciente().getIdPaciente())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Paciente não encontrado com id "
                                + historico.getPaciente().getIdPaciente()));
        historico.setPaciente(paciente);
    }
}
