package com.clinica.odontologica.exception;

/**
 * Exceção usada quando o usuário pede um registro que NÃO existe no banco
 * (ex: buscar o paciente de id 999 que nunca foi cadastrado).
 *
 * Mais adiante, o nosso "tratador de erros" (GlobalExceptionHandler) vai capturar
 * esta exceção e devolver para o frontend o status HTTP 404 (Not Found / Não encontrado).
 */
// Estende RuntimeException para ser uma exceção "não checada" (não obriga try/catch).
public class RecursoNaoEncontradoException extends RuntimeException {

    // Recebe a mensagem explicando o que não foi encontrado e repassa para a classe pai.
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
