package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa a tabela "historico_clinico".
 *
 * Guarda informações de saúde do paciente (alergias, doenças, medicamentos)
 * que o dentista precisa saber antes de atender. Está sempre ligado a um paciente.
 */
@Entity
@Table(name = "historico_clinico")
public class HistoricoClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historico")
    private Integer idHistorico;

    // Cada registro de histórico pertence a UM paciente (obrigatório).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    // Preenchido pelo banco (DEFAULT CURRENT_TIMESTAMP).
    @Column(name = "data_registro", insertable = false, updatable = false)
    private LocalDateTime dataRegistro;

    @Column(name = "alergias", columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "doencas_sistemicas", columnDefinition = "TEXT")
    private String doencasSistemicas;

    @Column(name = "medicamentos_continuos", columnDefinition = "TEXT")
    private String medicamentosContinuos;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // ---- Getters e Setters ----

    public Integer getIdHistorico() {
        return idHistorico;
    }

    public void setIdHistorico(Integer idHistorico) {
        this.idHistorico = idHistorico;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public String getAlergias() {
        return alergias;
    }

    public void setAlergias(String alergias) {
        this.alergias = alergias;
    }

    public String getDoencasSistemicas() {
        return doencasSistemicas;
    }

    public void setDoencasSistemicas(String doencasSistemicas) {
        this.doencasSistemicas = doencasSistemicas;
    }

    public String getMedicamentosContinuos() {
        return medicamentosContinuos;
    }

    public void setMedicamentosContinuos(String medicamentosContinuos) {
        this.medicamentosContinuos = medicamentosContinuos;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
