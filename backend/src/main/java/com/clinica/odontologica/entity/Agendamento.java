package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa a tabela "agendamento".
 *
 * É a marcação de um horário: qual paciente vai ser atendido, por qual dentista,
 * para qual procedimento e em que data/hora. É o "compromisso futuro".
 */
@Entity
@Table(name = "agendamento")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agendamento")
    private Integer idAgendamento;

    // Cada agendamento pertence a UM paciente (obrigatório).
    // optional = false reforça que esta ligação não pode ficar vazia (NOT NULL).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    // Cada agendamento é com UM dentista (obrigatório).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_dentista")
    private Dentista dentista;

    // Cada agendamento é para UM procedimento (obrigatório).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_procedimento")
    private Procedimento procedimento;

    // LocalDateTime = data + hora (combina com o tipo DATETIME do banco).
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    // No banco é um ENUM. Valores possíveis: Agendado, Cancelado, Remarcado, Paciente Faltou.
    // Se vier vazio, o service coloca "Agendado" como padrão.
    @Column(name = "status")
    private String status;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // Quando o agendamento foi registrado no sistema (preenchido pelo banco).
    @Column(name = "data_agendamento", insertable = false, updatable = false)
    private LocalDateTime dataAgendamento;

    // ---- Getters e Setters ----

    public Integer getIdAgendamento() {
        return idAgendamento;
    }

    public void setIdAgendamento(Integer idAgendamento) {
        this.idAgendamento = idAgendamento;
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

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public LocalDateTime getDataAgendamento() {
        return dataAgendamento;
    }

    public void setDataAgendamento(LocalDateTime dataAgendamento) {
        this.dataAgendamento = dataAgendamento;
    }
}
