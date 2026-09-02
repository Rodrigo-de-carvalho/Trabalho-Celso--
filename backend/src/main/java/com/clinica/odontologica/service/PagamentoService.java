package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Consulta;
import com.clinica.odontologica.entity.Pagamento;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.exception.RequisicaoInvalidaException;
import com.clinica.odontologica.repository.ConsultaRepository;
import com.clinica.odontologica.repository.PagamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service do Pagamento.
 *
 * Regras de negócio:
 *  - todo pagamento precisa estar ligado a uma consulta que exista;
 *  - o valor pago deve ser maior que zero;
 *  - se não informarem as parcelas, assumimos 1 (à vista).
 */
@Service
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final ConsultaRepository consultaRepository;

    public PagamentoService(PagamentoRepository pagamentoRepository,
                            ConsultaRepository consultaRepository) {
        this.pagamentoRepository = pagamentoRepository;
        this.consultaRepository = consultaRepository;
    }

    public List<Pagamento> listarTodos() {
        return pagamentoRepository.findAll();
    }

    public Pagamento buscarPorId(Integer id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Pagamento não encontrado com id " + id));
    }

    public Pagamento criar(Pagamento pagamento) {
        prepararPagamento(pagamento);
        return pagamentoRepository.save(pagamento);
    }

    public Pagamento atualizar(Integer id, Pagamento pagamento) {
        buscarPorId(id);
        prepararPagamento(pagamento);
        pagamento.setIdPagamento(id);
        return pagamentoRepository.save(pagamento);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        pagamentoRepository.deleteById(id);
    }

    // ---------------- REGRAS DE NEGÓCIO ----------------

    // Valida e prepara o pagamento antes de salvar.
    private void prepararPagamento(Pagamento pagamento) {
        if (pagamento.getConsulta() == null || pagamento.getConsulta().getIdConsulta() == null) {
            throw new RequisicaoInvalidaException(
                    "É obrigatório informar a consulta que está sendo paga.");
        }

        // Confirma que a consulta existe e carrega o objeto completo.
        Consulta consulta = consultaRepository
                .findById(pagamento.getConsulta().getIdConsulta())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Consulta não encontrada com id "
                                + pagamento.getConsulta().getIdConsulta()));
        pagamento.setConsulta(consulta);

        // O valor pago precisa ser positivo (não faz sentido pagar zero ou negativo).
        if (pagamento.getValorPago() == null
                || pagamento.getValorPago().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RequisicaoInvalidaException("O valor pago deve ser maior que zero.");
        }

        // Parcelas padrão = 1 (pagamento à vista).
        if (pagamento.getParcelas() == null || pagamento.getParcelas() < 1) {
            pagamento.setParcelas(1);
        }
    }
}
