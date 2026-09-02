package com.clinica.odontologica.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * "Tratador global de erros" da aplicação.
 *
 * A ideia é centralizar AQUI o tratamento dos erros. Assim, quando qualquer parte
 * do código lançar uma exceção, este arquivo captura, escolhe o status HTTP correto
 * (400, 404, 409...) e devolve um JSON claro para o frontend, em vez de uma página
 * de erro genérica e confusa.
 */
// @RestControllerAdvice avisa o Spring que esta classe "vigia" todos os controllers
// e cuida das exceções que eles lançarem.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // @ExceptionHandler diz: "quando acontecer ESTA exceção, execute ESTE método".
    // Aqui tratamos o caso de registro não encontrado -> status 404 (Not Found).
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> tratarNaoEncontrado(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErroResposta(ex.getMessage()));
    }

    // Trata conflitos (CPF/CRO/e-mail duplicado, horário ocupado) -> status 409 (Conflict).
    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResposta> tratarConflito(ConflitoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErroResposta(ex.getMessage()));
    }

    // Trata dados inválidos segundo nossas regras de negócio -> status 400 (Bad Request).
    @ExceptionHandler(RequisicaoInvalidaException.class)
    public ResponseEntity<ErroResposta> tratarRequisicaoInvalida(RequisicaoInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErroResposta(ex.getMessage()));
    }

    // Rede de segurança: qualquer outro erro inesperado cai aqui -> status 500.
    // Evita que o usuário veja um "stack trace" gigante; mostra uma mensagem amigável.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> tratarErroGenerico(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResposta("Ocorreu um erro inesperado: " + ex.getMessage()));
    }
}
