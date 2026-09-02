package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Entidade que representa a tabela "plano_odontologico" do banco.
 *
 * Uma Entity é uma classe Java que "espelha" uma tabela: cada objeto desta classe
 * vira uma linha na tabela, e cada atributo vira uma coluna.
 */
// @Entity marca esta classe como uma entidade JPA (o Hibernate vai mapeá-la para uma tabela).
@Entity
// @Table diz exatamente qual o nome da tabela no banco (igual ao schema.sql).
@Table(name = "plano_odontologico")
public class PlanoOdontologico {

    // @Id marca o atributo que é a CHAVE PRIMÁRIA (identificador único da linha).
    @Id
    // @GeneratedValue + IDENTITY = o banco gera o id sozinho (AUTO_INCREMENT do MySQL).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // @Column liga o atributo Java à coluna do banco (aqui, "id_plano").
    @Column(name = "id_plano")
    private Integer idPlano;

    // nullable = false significa que é obrigatório (NOT NULL no banco).
    @Column(name = "nome_plano", nullable = false, length = 100)
    private String nomePlano;

    @Column(name = "operadora", length = 100)
    private String operadora;

    // Percentual de desconto que o plano dá (ex: 20.00 = 20%). Usado no cálculo da consulta.
    @Column(name = "desconto_percentual", precision = 5, scale = 2)
    private BigDecimal descontoPercentual;

    // columnDefinition = "TEXT" garante que no banco essa coluna seja do tipo TEXT (texto longo).
    @Column(name = "cobertura", columnDefinition = "TEXT")
    private String cobertura;

    // ---- Getters e Setters ----
    // São os métodos que permitem LER (get) e ALTERAR (set) cada atributo.
    // Sem Lombok, escrevemos todos na mão para deixar o código explícito.

    public Integer getIdPlano() {
        return idPlano;
    }

    public void setIdPlano(Integer idPlano) {
        this.idPlano = idPlano;
    }

    public String getNomePlano() {
        return nomePlano;
    }

    public void setNomePlano(String nomePlano) {
        this.nomePlano = nomePlano;
    }

    public String getOperadora() {
        return operadora;
    }

    public void setOperadora(String operadora) {
        this.operadora = operadora;
    }

    public BigDecimal getDescontoPercentual() {
        return descontoPercentual;
    }

    public void setDescontoPercentual(BigDecimal descontoPercentual) {
        this.descontoPercentual = descontoPercentual;
    }

    public String getCobertura() {
        return cobertura;
    }

    public void setCobertura(String cobertura) {
        this.cobertura = cobertura;
    }
}
