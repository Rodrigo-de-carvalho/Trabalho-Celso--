// ============================================================
//  conferir-configuracao.ts — Checagem do .env na inicialização
// ============================================================
// O sistema depende de algumas variáveis de ambiente para funcionar com
// segurança. Se faltar alguma, é melhor a aplicação nem subir e avisar
// exatamente o que fazer, em vez de quebrar depois com um erro confuso.

/** Confere as configurações obrigatórias. Lança erro se algo estiver faltando. */
export function conferirConfiguracao(): void {
  const faltando: string[] = []

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    faltando.push('JWT_SECRET (segredo usado para assinar os tokens de login)')
  }

  if (faltando.length > 0) {
    throw new Error(
      'Configuração incompleta. Falta definir no arquivo backend/.env:\n' +
        faltando.map((f) => '  - ' + f).join('\n') +
        '\n\nDica: copie o arquivo de exemplo com "cp .env.example .env" e ajuste os valores.'
    )
  }

  // Aviso (não impede de rodar): o segredo de exemplo não deve ir para produção.
  if (process.env.JWT_SECRET === 'troque-este-segredo-em-producao') {
    console.warn(
      '[AVISO] O JWT_SECRET ainda é o valor de exemplo. Troque-o antes de publicar o sistema.'
    )
  }
}
