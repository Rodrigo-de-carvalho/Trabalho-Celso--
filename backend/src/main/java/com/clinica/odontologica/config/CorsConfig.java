package com.clinica.odontologica.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuração de CORS.
 *
 * CORS é uma regra de segurança dos navegadores: por padrão, uma página rodando
 * em um endereço (ex: o React em http://localhost:5173) NÃO pode chamar uma API
 * em outro endereço (nossa API em http://localhost:8080).
 *
 * Como o frontend e o backend rodam em portas diferentes durante o desenvolvimento,
 * precisamos "liberar" explicitamente o endereço do front. É isso que esta classe faz.
 */
// @Configuration avisa o Spring que esta classe contém configurações da aplicação.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Sobrescrevemos este método do Spring para adicionar nossas regras de CORS.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
                // "/**" significa: vale para TODOS os endpoints da nossa API.
                .addMapping("/**")
                // Libera as chamadas vindas do React em desenvolvimento.
                // O Create React App roda na 3000 por padrão, mas aqui mudamos a
                // porta do front para 5173 no arquivo frontend/.env (PORT=5173).
                .allowedOrigins("http://localhost:5173")
                // Permite os métodos HTTP que usamos no CRUD.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Permite qualquer cabeçalho na requisição (ex: Content-Type: application/json).
                .allowedHeaders("*");
    }
}
