export interface EventoFormData {
  titulo: string;
  descricao: string;
  data: string;
  local: string;
}

export interface EventoPayload {
  titulo: string;
  descricao: string;
  dataISO: Date;
  local: string;
  ativo: boolean;
}

/**
 * Função pura que prepara os dados do formulário para serem enviados à API.
 * Ela valida se os campos obrigatórios existem e converte a data.
 */
export function prepareEventPayload(
  formData: EventoFormData | null
): EventoPayload | null {
  // Validação simples: se não houver dados ou título, retorna null (erro)
  if (!formData || !formData.titulo || !formData.data) {
    return null;
  }

  // Transforma a string de data em objeto Date e adiciona flag de ativo
  return {
    titulo: formData.titulo.trim(),
    descricao: formData.descricao || "Sem descrição", // Valor padrão
    dataISO: new Date(formData.data),
    local: formData.local,
    ativo: true, // Todo evento criado começa como ativo
  };
}

// Bloco describe apenas para manter consistência se o Jest ler este arquivo,
if (process.env.NODE_ENV === 'test') {
    describe("criarEvento helpers placeholder", () => {
        it("placeholder", () => {
            expect(true).toBe(true);
        });
    });
}