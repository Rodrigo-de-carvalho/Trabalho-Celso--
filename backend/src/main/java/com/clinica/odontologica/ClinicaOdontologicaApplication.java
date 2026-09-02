package com.clinica.odontologica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal do projeto — é o "ponto de partida" da aplicação.
 *
 * Quando rodamos "mvn spring-boot:run", o Java procura o método main() abaixo
 * e começa a execução por aqui.
 */
// @SpringBootApplication é uma anotação que junta 3 outras em uma só:
//  - @Configuration (permite definir configurações)
//  - @EnableAutoConfiguration (o Spring configura sozinho boa parte das coisas)
//  - @ComponentScan (faz o Spring varrer este pacote procurando nossas classes
//    @RestController, @Service, @Repository, etc. e registrá-las automaticamente)
@SpringBootApplication
public class ClinicaOdontologicaApplication {

    // Método main: é por aqui que TODO programa Java começa a rodar.
    public static void main(String[] args) {
        // Esta linha "liga" o Spring Boot: sobe o servidor web, conecta no banco
        // e deixa a API pronta para receber requisições na porta 8080.
        SpringApplication.run(ClinicaOdontologicaApplication.class, args);
    }
}
