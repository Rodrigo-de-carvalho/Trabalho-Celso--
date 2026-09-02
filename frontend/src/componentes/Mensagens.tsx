// ============================================================
//  Mensagens.tsx — Avisos de erro e de sucesso
// ============================================================
// Componentzinho usado por todas as telas para mostrar o retorno de uma
// operação sempre do mesmo jeito.

export function Erro({ texto }: { texto: string }) {
  if (!texto) return null
  // role="alert" faz o leitor de tela anunciar o aviso assim que ele aparece
  // (acessibilidade).
  return (
    <div className="aviso-erro" role="alert">
      {texto}
    </div>
  )
}

export function Sucesso({ texto }: { texto: string }) {
  if (!texto) return null
  return (
    <div className="aviso-sucesso" role="status">
      {texto}
    </div>
  )
}
