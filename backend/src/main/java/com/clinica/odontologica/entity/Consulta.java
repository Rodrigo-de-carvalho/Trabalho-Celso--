package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade que representa a tabela "consulta".
 *
 * É o atendimento que REALMENTE aconteceu (diferente do agendamento, que é a marcação).
 * Guarda o valor_total já calculado (procedimento - desconto do plano do paciente).
 */
@Entity
@Table(name = "consulta")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Integer idConsulta;

    // A consulta nasce de um agendamento (obrigatório).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_agendamento")
    private Agendamento agendamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_dentista")
    private Dentista dentista;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_procedimento")
    private Procedimento procedimento;

    // Data e hora em que a consulta foi realizada de fato.
    @Column(name = "data_hora_realizacao", nullable = false)
    private LocalDateTime dataHoraRealizacao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // Valor final da consulta. É CALCULADO pelo service (não vem direto do usuário):
    // valor do procedimento menos o desconto do plano odontológico do paciente.
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    // ---- Getters e Setters ----

    public Integer getIdConsulta() {
        return idConsulta;
    }

    public void setIdConsulta(Integer idConsulta) {
        this.idConsulta = idConsulta;
    }

    public Agendamento getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(Agendamento agendamento) {
        this.agendamento = agendamento;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Dentista getDentista() {
        return dentista;
    }

    public void setDentista(Dentista dentista) {
        this.dentista = dentista;
    }

    public Procedimento getProcedimento() {
        return procedimento;
    }

    public void setProcedimento(Procedimento procedimento) {
        this.procedimento = procedimento;
    }

    public LocalDateTime getDataHoraRealizacao() {
        return dataHoraRealizacao;
    }

    public void setDataHoraRealizacao(LocalDateTime dataHoraRealizacao) {
        this.dataHoraRealizacao = dataHoraRealizacao;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
}
