package com.clinica.odontologica.exception;

/**
 * Classe simples que representa o "corpo" (JSON) devolvido quando acontece um erro.
 *
 * Em vez de devolver uma página de erro feia do servidor, devolvemos um JSON
 * organizado e fácil do frontend ler, no formato:
 * {
 *   "mensagem": "Já existe um paciente cadastrado com este CPF."
 * }
 *
 * O código HTTP (404, 409, 400...) já vai separado, no cabeçalho da resposta.
 */
public class ErroResposta {

    // Mensagem clara explicando o problema para o usuário.
    private String mensagem;

    // Construtor: recebe a mensagem que será mostrada na tela.
    public ErroResposta(String mensagem) {
        this.mensagem = mensagem;
    }

    // Getter: o Spring usa este método para transformar o objeto em JSON.
    public String getMensagem() {
        return mensagem;
    }
}
