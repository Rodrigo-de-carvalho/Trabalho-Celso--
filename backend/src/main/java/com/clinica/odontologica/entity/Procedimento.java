package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Entidade que representa a tabela "procedimento".
 *
 * É o serviço odontológico oferecido (ex: Limpeza, Restauração, Canal),
 * com seu valor base e o tempo estimado de duração em minutos.
 */
@Entity
@Table(name = "procedimento")
public class Procedimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_procedimento")
    private Integer idProcedimento;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    // BigDecimal é o tipo certo para DINHEIRO (evita erros de arredondamento do double).
    @Column(name = "valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    // Tempo estimado em minutos.
    @Column(name = "tempo_estimado")
    private Integer tempoEstimado;

    // ---- Getters e Setters ----

    public Integer getIdProcedimento() {
        return idProcedimento;
    }

    public void setIdProcedimento(Integer idProcedimento) {
        this.idProcedimento = idProcedimento;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Integer getTempoEstimado() {
        return tempoEstimado;
    }

    public void setTempoEstimado(Integer tempoEstimado) {
        this.tempoEstimado = tempoEstimado;
    }
}
