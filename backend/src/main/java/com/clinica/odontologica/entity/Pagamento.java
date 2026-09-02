package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade que representa a tabela "pagamento".
 *
 * Registra como o paciente pagou por uma consulta (dinheiro, pix, cartão...),
 * o valor pago e em quantas parcelas.
 */
@Entity
@Table(name = "pagamento")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagamento")
    private Integer idPagamento;

    // Todo pagamento está ligado a UMA consulta (obrigatório).
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_consulta")
    private Consulta consulta;

    // No banco é um ENUM: Dinheiro, Cartão Débito, Cartão Crédito, Pix, Boleto.
    @Column(name = "forma_pagamento", nullable = false)
    private String formaPagamento;

    @Column(name = "valor_pago", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorPago;

    // Preenchido pelo banco (DEFAULT CURRENT_TIMESTAMP).
    @Column(name = "data_pagamento", insertable = false, updatable = false)
    private LocalDateTime dataPagamento;

    // Número de parcelas (padrão 1 = à vista).
    @Column(name = "parcelas")
    private Integer parcelas;

    @Column(name = "descricao", length = 100)
    private String descricao;

    // ---- Getters e Setters ----

    public Integer getIdPagamento() {
        return idPagamento;
    }

    public void setIdPagamento(Integer idPagamento) {
        this.idPagamento = idPagamento;
    }

    public Consulta getConsulta() {
        return consulta;
    }

    public void setConsulta(Consulta consulta) {
        this.consulta = consulta;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public BigDecimal getValorPago() {
        return valorPago;
    }

    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDateTime dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public Integer getParcelas() {
        return parcelas;
    }

    public void setParcelas(Integer parcelas) {
        this.parcelas = parcelas;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}
