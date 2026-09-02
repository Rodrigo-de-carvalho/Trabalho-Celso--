package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Agendamento;
import com.clinica.odontologica.entity.Dentista;
import com.clinica.odontologica.entity.Paciente;
import com.clinica.odontologica.entity.Procedimento;
import com.clinica.odontologica.exception.ConflitoException;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.exception.RequisicaoInvalidaException;
import com.clinica.odontologica.repository.AgendamentoRepository;
import com.clinica.odontologica.repository.DentistaRepository;
import com.clinica.odontologica.repository.PacienteRepository;
import com.clinica.odontologica.repository.ProcedimentoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service do Agendamento.
 *
 * Regras de negócio principais:
 *  - paciente, dentista e procedimento informados precisam existir de verdade;
 *  - um mesmo dentista NÃO pode ter dois agendamentos na mesma data/hora
 *    (senão ele estaria em dois lugares ao mesmo tempo).
 */
@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final DentistaRepository dentistaRepository;
    private final ProcedimentoRepository procedimentoRepository;

    // Precisamos de vários repositories para validar as "peças" do agendamento.
    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              PacienteRepository pacienteRepository,
                              DentistaRepository dentistaRepository,
                              ProcedimentoRepository procedimentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.pacienteRepository = pacienteRepository;
        this.dentistaRepository = dentistaRepository;
        this.procedimentoRepository = procedimentoRepository;
    }

    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    public Agendamento buscarPorId(Integer id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Agendamento não encontrado com id " + id));
    }

    // Cria um agendamento aplicando todas as regras de negócio.
    public Agendamento criar(Agendamento agendamento) {
        resolverRelacionamentos(agendamento);   // confirma que paciente/dentista/procedimento existem
        definirStatusPadrao(agendamento);        // se não veio status, assume "Agendado"
        validarHorarioLivre(agendamento, null);  // impede horário ocupado pelo mesmo dentista
        return agendamentoRepository.save(agendamento);
    }

    // Atualiza um agendamento existente.
    public Agendamento atualizar(Integer id, Agendamento agendamento) {
        buscarPorId(id);
        resolverRelacionamentos(agendamento);
        definirStatusPadrao(agendamento);
        validarHorarioLivre(agendamento, id);    // na edição, ignora o próprio agendamento
        agendamento.setIdAgendamento(id);
        return agendamentoRepository.save(agendamento);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        agendamentoRepository.deleteById(id);
    }

    // ---------------- REGRAS DE NEGÓCIO ----------------

    // Garante que o paciente, o dentista e o procedimento informados existem no banco.
    // O frontend manda só os ids (ex: { "paciente": { "idPaciente": 1 } }); aqui buscamos
    // os objetos completos para o relacionamento ficar correto.
    private void resolverRelacionamentos(Agendamento ag) {
        if (ag.getPaciente() == null || ag.getPaciente().getIdPaciente() == null) {
            throw new RequisicaoInvalidaException("É obrigatório informar o paciente do agendamento.");
        }
        if (ag.getDentista() == null || ag.getDentista().getIdDentista() == null) {
            throw new RequisicaoInvalidaException("É obrigatório informar o dentista do agendamento.");
        }
        if (ag.getProcedimento() == null || ag.getProcedimento().getIdProcedimento() == null) {
            throw new RequisicaoInvalidaException("É obrigatório informar o procedimento do agendamento.");
        }

        Paciente paciente = pacienteRepository.findById(ag.getPaciente().getIdPaciente())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Paciente não encontrado com id " + ag.getPaciente().getIdPaciente()));
        Dentista dentista = dentistaRepository.findById(ag.getDentista().getIdDentista())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Dentista não encontrado com id " + ag.getDentista().getIdDentista()));
        Procedimento procedimento = procedimentoRepository.findById(ag.getProcedimento().getIdProcedimento())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Procedimento não encontrado com id " + ag.getProcedimento().getIdProcedimento()));

        ag.setPaciente(paciente);
        ag.setDentista(dentista);
        ag.setProcedimento(procedimento);
    }

    // Se o status não foi enviado, começamos com "Agendado" (igual ao DEFAULT do banco).
    private void definirStatusPadrao(Agendamento ag) {
        if (ag.getStatus() == null || ag.getStatus().isBlank()) {
            ag.setStatus("Agendado");
        }
    }

    // Coração da regra: verifica se o dentista já tem outro agendamento NESTE mesmo horário.
    // O parâmetro "idIgnorar" serve para, na edição, não comparar o agendamento com ele mesmo.
    private void validarHorarioLivre(Agendamento ag, Integer idIgnorar) {
        boolean ocupado;
        if (idIgnorar == null) {
            ocupado = agendamentoRepository.existsByDentistaIdDentistaAndDataHora(
                    ag.getDentista().getIdDentista(), ag.getDataHora());
        } else {
            ocupado = agendamentoRepository.existsByDentistaIdDentistaAndDataHoraAndIdAgendamentoNot(
                    ag.getDentista().getIdDentista(), ag.getDataHora(), idIgnorar);
        }
        if (ocupado) {
            throw new ConflitoException(
                    "Este dentista já possui um agendamento nesta data e horário. Escolha outro horário.");
        }
    }
}
