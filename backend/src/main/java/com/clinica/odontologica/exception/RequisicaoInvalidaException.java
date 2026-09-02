package com.clinica.odontologica.exception;

/**
 * Exceção usada quando os dados enviados são inválidos do ponto de vista das
 * regras de negócio (ex: um valor que deveria ser positivo veio negativo, ou
 * faltou informar um campo obrigatório de uma regra específica).
 *
 * O GlobalExceptionHandler vai capturar esta exceção e devolver o status
 * HTTP 400 (Bad Request / Requisição inválida).
 */
public class RequisicaoInvalidaException extends RuntimeException {

    public RequisicaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
