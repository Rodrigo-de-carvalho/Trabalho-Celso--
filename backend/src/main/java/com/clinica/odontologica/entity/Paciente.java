package com.clinica.odontologica.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que representa a tabela "paciente".
 *
 * É o cliente da clínica. Guarda dados pessoais, de contato e (opcionalmente)
 * o plano odontológico que ele possui.
 */
@Entity
@Table(name = "paciente")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Integer idPaciente;

    @Column(name = "nome_completo", nullable = false, length = 100)
    private String nomeCompleto;

    // LocalDate = só a data (sem horário). Combina com o tipo DATE do banco.
    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    // unique = true garante que NÃO existam dois pacientes com o mesmo CPF no banco.
    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "rg", unique = true, length = 12)
    private String rg;

    // No banco é um ENUM ('Masculino', 'Feminino', 'Prefiro não dizer').
    // Guardamos como texto (String) para ficar simples de enviar pelo frontend.
    @Column(name = "sexo")
    private String sexo;

    @Column(name = "telefone", nullable = false, length = 15)
    private String telefone;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "endereco", length = 100)
    private String endereco;

    // CHAR(2) no banco (ex: "SP", "RJ").
    @Column(name = "estado", length = 2)
    private String estado;

    @Column(name = "cidade", length = 50)
    private String cidade;

    @Column(name = "cep", length = 8)
    private String cep;

    // @ManyToOne: VÁRIOS pacientes podem ter o MESMO plano (o lado "muitos").
    // @JoinColumn diz qual coluna do banco guarda a chave estrangeira (id_plano).
    // É opcional (nullable) porque um paciente pode não ter plano nenhum (particular).
    @ManyToOne
    @JoinColumn(name = "id_plano")
    private PlanoOdontologico plano;

    @Column(name = "numero_carteirinha", length = 30)
    private String numeroCarteirinha;

    @Column(name = "data_validade_plano")
    private LocalDate dataValidadePlano;

    // Data/hora em que o paciente foi cadastrado. insertable/updatable = false porque
    // quem preenche esse campo é o PRÓPRIO BANCO (DEFAULT CURRENT_TIMESTAMP do schema.sql),
    // então o Java só LÊ esse valor, nunca tenta gravá-lo.
    @Column(name = "data_cadastro", insertable = false, updatable = false)
    private LocalDateTime dataCadastro;

    // ---- Getters e Setters ----

    public Integer getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(Integer idPaciente) {
        this.idPaciente = idPaciente;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
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

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public PlanoOdontologico getPlano() {
        return plano;
    }

    public void setPlano(PlanoOdontologico plano) {
        this.plano = plano;
    }

    public String getNumeroCarteirinha() {
        return numeroCarteirinha;
    }

    public void setNumeroCarteirinha(String numeroCarteirinha) {
        this.numeroCarteirinha = numeroCarteirinha;
    }

    public LocalDate getDataValidadePlano() {
        return dataValidadePlano;
    }

    public void setDataValidadePlano(LocalDate dataValidadePlano) {
        this.dataValidadePlano = dataValidadePlano;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }
}
