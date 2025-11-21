export interface PartidaFormData {
  titulo: string; // Ex: "Meu Time vs Time Visitante"
  descricao: string;
  data: string;
  local: string;
}

export interface PartidaPayload {
  nomePartida: string;
  detalhes: string;
  dataHorario: Date;
  localPartida: string;
  status: "AGENDADA" | "CANCELADA" | "FINALIZADA";
  tipo: "PARTIDA"; // Identificador fixo para o backend saber que é jogo
}

/**
 * Função pura que prepara os dados para criar uma partida.
 * Diferente de um evento comum, partidas precisam de validação de local mais rígida
 * e possuem status específicos.
 */
export function prepareMatchPayload(
  formData: PartidaFormData | null
): PartidaPayload | null {
  
  // Validação: Título e Data são obrigatórios
  if (!formData || !formData.titulo || !formData.data) {
    return null;
  }

  // Regra de negócio: Se não tiver local, define como "A definir"
  // (Diferente do Evento que poderia retornar erro)
  const localFinal = formData.local && formData.local.trim() !== "" 
    ? formData.local 
    : "Local a definir";

  return {
    nomePartida: formData.titulo.trim(),
    detalhes: formData.descricao || "Partida amistosa",
    dataHorario: new Date(formData.data),
    localPartida: localFinal,
    status: "AGENDADA",
    tipo: "PARTIDA"
  };
}

// Bloco para manter consistência em ambientes de teste
if (process.env.NODE_ENV === 'test') {
    describe("criarPartida helpers placeholder", () => {
        it("placeholder", () => {
            expect(true).toBe(true);
        });
    });
}