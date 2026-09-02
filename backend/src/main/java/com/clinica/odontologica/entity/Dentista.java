package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa a tabela "dentista".
 *
 * É o profissional que atende os pacientes. O CRO é o registro no Conselho
 * Regional de Odontologia e, por isso, deve ser único.
 */
@Entity
@Table(name = "dentista")
public class Dentista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dentista")
    private Integer idDentista;

    @Column(name = "nome_completo", nullable = false, length = 100)
    private String nomeCompleto;

    // CRO único: dois dentistas não podem ter o mesmo registro profissional.
    @Column(name = "cro", nullable = false, unique = true, length = 20)
    private String cro;

    @Column(name = "especialidade", length = 100)
    private String especialidade;

    @Column(name = "telefone", nullable = false, length = 15)
    private String telefone;

    // E-mail obrigatório e único para o dentista.
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // Preenchido automaticamente pelo banco (DEFAULT CURRENT_TIMESTAMP).
    @Column(name = "data_contratacao", insertable = false, updatable = false)
    private LocalDateTime dataContratacao;

    // ---- Getters e Setters ----

    public Integer getIdDentista() {
        return idDentista;
    }

    public void setIdDentista(Integer idDentista) {
        this.idDentista = idDentista;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCro() {
        return cro;
    }

    public void setCro(String cro) {
        this.cro = cro;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getDataContratacao() {
        return dataContratacao;
    }

    public void setDataContratacao(LocalDateTime dataContratacao) {
        this.dataContratacao = dataContratacao;
    }
}
