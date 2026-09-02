package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entidade que representa a tabela "agenda".
 *
 * Representa um bloco de horário de trabalho de um dentista em um dia
 * (das X às Y horas) e se aquele horário está disponível ou não.
 */
@Entity
@Table(name = "agenda")
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agenda")
    private Integer idAgenda;

    // O horário pertence a UM dentista (obrigatório).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_dentista")
    private Dentista dentista;

    // LocalDate = só a data (tipo DATE no banco).
    @Column(name = "data", nullable = false)
    private LocalDate data;

    // LocalTime = só a hora (tipo TIME no banco).
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    // true = horário livre; false = horário ocupado. No banco é BOOLEAN (padrão TRUE).
    @Column(name = "disponivel")
    private Boolean disponivel;

    // ---- Getters e Setters ----

    public Integer getIdAgenda() {
        return idAgenda;
    }

    public void setIdAgenda(Integer idAgenda) {
        this.idAgenda = idAgenda;
    }

    public Dentista getDentista() {
        return dentista;
    }

    public void setDentista(Dentista dentista) {
        this.dentista = dentista;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(LocalTime horaFim) {
        this.horaFim = horaFim;
    }

    public Boolean getDisponivel() {
        return disponivel;
    }

    public void setDisponivel(Boolean disponivel) {
        this.disponivel = disponivel;
    }
}
