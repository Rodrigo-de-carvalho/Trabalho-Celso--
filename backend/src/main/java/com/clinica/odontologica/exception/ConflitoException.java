package com.clinica.odontologica.exception;

/**
 * Exceção usada quando a operação fere uma regra de unicidade ou conflito de dados,
 * por exemplo:
 *   - tentar cadastrar um paciente com um CPF que já existe;
 *   - tentar cadastrar um dentista com um CRO já usado;
 *   - tentar agendar um horário que o dentista já tem ocupado.
 *
 * O GlobalExceptionHandler vai capturar esta exceção e devolver o status
 * HTTP 409 (Conflict / Conflito), que é o código certo para "isso conflita
 * com algo que já existe".
 */
public class ConflitoException extends RuntimeException {

    // Guarda a mensagem clara que será mostrada para o usuário no frontend.
    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
