package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Agendamento;
import com.clinica.odontologica.entity.Consulta;
import com.clinica.odontologica.entity.Paciente;
import com.clinica.odontologica.entity.Procedimento;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.exception.RequisicaoInvalidaException;
import com.clinica.odontologica.repository.AgendamentoRepository;
import com.clinica.odontologica.repository.ConsultaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service da Consulta.
 *
 * Regra de negócio principal deste service:
 * o valor_total da consulta é CALCULADO automaticamente a partir do valor do
 * procedimento, aplicando o desconto do plano odontológico do paciente (se houver).
 *
 * Para simplificar, a consulta é criada a partir de um AGENDAMENTO: pegamos o
 * paciente, o dentista e o procedimento direto do agendamento (assim os dados
 * ficam sempre consistentes com o que foi marcado).
 */
@Service
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final AgendamentoRepository agendamentoRepository;

    public ConsultaService(ConsultaRepository consultaRepository,
                           AgendamentoRepository agendamentoRepository) {
        this.consultaRepository = consultaRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    public List<Consulta> listarTodos() {
        return consultaRepository.findAll();
    }

    public Consulta buscarPorId(Integer id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Consulta não encontrada com id " + id));
    }

    // Cria uma consulta a partir de um agendamento e calcula o valor total.
    public Consulta criar(Consulta consulta) {
        prepararConsulta(consulta);   // busca o agendamento, copia os dados e calcula o valor
        return consultaRepository.save(consulta);
    }

    // Atualiza uma consulta existente (recalcula o valor por garantia).
    public Consulta atualizar(Integer id, Consulta consulta) {
        buscarPorId(id);
        prepararConsulta(consulta);
        consulta.setIdConsulta(id);
        return consultaRepository.save(consulta);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        consultaRepository.deleteById(id);
    }

    // ---------------- REGRAS DE NEGÓCIO ----------------

    // Prepara a consulta antes de salvar:
    // 1) confirma que o agendamento existe;
    // 2) copia paciente, dentista e procedimento do agendamento;
    // 3) calcula o valor_total com o desconto do plano.
    private void prepararConsulta(Consulta consulta) {
        if (consulta.getAgendamento() == null || consulta.getAgendamento().getIdAgendamento() == null) {
            throw new RequisicaoInvalidaException(
                    "É obrigatório informar o agendamento que originou a consulta.");
        }

        // Busca o agendamento completo no banco.
        Agendamento agendamento = agendamentoRepository
                .findById(consulta.getAgendamento().getIdAgendamento())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Agendamento não encontrado com id "
                                + consulta.getAgendamento().getIdAgendamento()));

        // Copiamos as "peças" do agendamento para a consulta (mantém tudo consistente).
        consulta.setAgendamento(agendamento);
        consulta.setPaciente(agendamento.getPaciente());
        consulta.setDentista(agendamento.getDentista());
        consulta.setProcedimento(agendamento.getProcedimento());

        // Se não informaram a data/hora de realização, usamos o momento atual.
        if (consulta.getDataHoraRealizacao() == null) {
            consulta.setDataHoraRealizacao(LocalDateTime.now());
        }

        // Calcula o valor final aplicando o desconto do plano.
        BigDecimal valorFinal = calcularValorTotal(
                agendamento.getProcedimento(), agendamento.getPaciente());
        consulta.setValorTotal(valorFinal);
    }

    // Cálculo do valor total:
    //   valorFinal = valorDoProcedimento - (valorDoProcedimento * desconto% / 100)
    // Se o paciente não tem plano (ou o plano não dá desconto), paga o valor cheio.
    private BigDecimal calcularValorTotal(Procedimento procedimento, Paciente paciente) {
        BigDecimal valorBase = procedimento.getValor();

        // Desconto começa em zero (paciente particular).
        BigDecimal descontoPercentual = BigDecimal.ZERO;
        if (paciente.getPlano() != null && paciente.getPlano().getDescontoPercentual() != null) {
            descontoPercentual = paciente.getPlano().getDescontoPercentual();
        }

        // Calcula quanto vale o desconto em reais e subtrai do valor base.
        BigDecimal valorDoDesconto = valorBase
                .multiply(descontoPercentual)
                .divide(BigDecimal.valueOf(100));
        BigDecimal valorFinal = valorBase.subtract(valorDoDesconto);

        // Arredonda para 2 casas decimais (centavos).
        return valorFinal.setScale(2, RoundingMode.HALF_UP);
    }
}
