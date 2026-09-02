package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Agenda;
import com.clinica.odontologica.entity.Dentista;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.exception.RequisicaoInvalidaException;
import com.clinica.odontologica.repository.AgendaRepository;
import com.clinica.odontologica.repository.DentistaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service da Agenda (blocos de horário de trabalho dos dentistas).
 *
 * Regras de negócio:
 *  - o dentista informado precisa existir;
 *  - a hora de fim deve ser depois da hora de início;
 *  - se não informarem, o horário começa como "disponível".
 */
@Service
public class AgendaService {

    private final AgendaRepository agendaRepository;
    private final DentistaRepository dentistaRepository;

    public AgendaService(AgendaRepository agendaRepository,
                         DentistaRepository dentistaRepository) {
        this.agendaRepository = agendaRepository;
        this.dentistaRepository = dentistaRepository;
    }

    public List<Agenda> listarTodos() {
        return agendaRepository.findAll();
    }

    public Agenda buscarPorId(Integer id) {
        return agendaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Agenda não encontrada com id " + id));
    }

    // Lista os horários de um dentista específico.
    public List<Agenda> listarPorDentista(Integer idDentista) {
        return agendaRepository.findByDentistaIdDentista(idDentista);
    }

    public Agenda criar(Agenda agenda) {
        prepararAgenda(agenda);
        return agendaRepository.save(agenda);
    }

    public Agenda atualizar(Integer id, Agenda agenda) {
        buscarPorId(id);
        prepararAgenda(agenda);
        agenda.setIdAgenda(id);
        return agendaRepository.save(agenda);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        agendaRepository.deleteById(id);
    }

    // ---------------- REGRAS DE NEGÓCIO ----------------

    private void prepararAgenda(Agenda agenda) {
        if (agenda.getDentista() == null || agenda.getDentista().getIdDentista() == null) {
            throw new RequisicaoInvalidaException("É obrigatório informar o dentista da agenda.");
        }
        Dentista dentista = dentistaRepository
                .findById(agenda.getDentista().getIdDentista())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Dentista não encontrado com id "
                                + agenda.getDentista().getIdDentista()));
        agenda.setDentista(dentista);

        // A hora final tem que ser maior que a inicial.
        if (agenda.getHoraInicio() != null && agenda.getHoraFim() != null
                && !agenda.getHoraFim().isAfter(agenda.getHoraInicio())) {
            throw new RequisicaoInvalidaException(
                    "A hora de fim deve ser posterior à hora de início.");
        }

        // Por padrão, um horário novo nasce disponível.
        if (agenda.getDisponivel() == null) {
            agenda.setDisponivel(true);
        }
    }
}
