export interface Group {
  name: string;
}

export interface Solicitacao {
  id: string;
  madeBy: "USER" | "GROUP";
  status: "PENDING" | "APPROVED" | "REJECTED";
  group: Group;
}

export interface SolicitacoesOrganizadas {
  enviadasPendentes: Solicitacao[];
  enviadasRespondidas: Solicitacao[];
  recebidasPendentes: Solicitacao[];
  recebidasRespondidas: Solicitacao[];
}

export function organizarSolicitacoes(
  lista: Solicitacao[] | null | undefined
): SolicitacoesOrganizadas {
  // Inicializa estrutura vazia para segurança
  const resultadoVazio: SolicitacoesOrganizadas = {
    enviadasPendentes: [],
    enviadasRespondidas: [],
    recebidasPendentes: [],
    recebidasRespondidas: [],
  };

  if (!lista || lista.length === 0) {
    return resultadoVazio;
  }

  // 1. Separa por origem (Quem fez o convite?)
  const enviadas = lista.filter((s) => s.madeBy === "USER");
  const recebidas = lista.filter((s) => s.madeBy === "GROUP");

  // 2. Sub-classifica as Enviadas
  const enviadasPendentes = enviadas.filter((s) => s.status === "PENDING");
  const enviadasRespondidas = enviadas.filter(
    (s) => s.status === "APPROVED" || s.status === "REJECTED"
  );

  // 3. Sub-classifica as Recebidas
  const recebidasPendentes = recebidas.filter((s) => s.status === "PENDING");
  const recebidasRespondidas = recebidas.filter(
    (s) => s.status === "APPROVED" || s.status === "REJECTED"
  );

  return {
    enviadasPendentes,
    enviadasRespondidas,
    recebidasPendentes,
    recebidasRespondidas,
  };
}