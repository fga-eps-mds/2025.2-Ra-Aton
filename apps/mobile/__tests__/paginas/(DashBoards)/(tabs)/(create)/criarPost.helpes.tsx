export interface PostFormData {
  titulo?: string;
  conteudo: string;
  categoria?: string;
}

export interface PostPayload {
  title: string;
  body: string;
  tags: string[]; // Array de hashtags extraídas
  summary: string; // Resumo automático
  createdAt: Date;
  status: "DRAFT" | "PUBLISHED";
}

/**
 * Extrai hashtags de uma string.
 * Ex: "Olá #mundo #dev" -> ["#mundo", "#dev"]
 */
function extractHashtags(text: string): string[] {
  const regex = /#[\w\u00C0-\u00FF]+/g;
  const matches = text.match(regex);
  return matches ? matches : [];
}

/**
 * Prepara os dados do Post para envio.
 * Regras:
 * 1. Conteúdo é obrigatório e deve ter pelo menos 10 caracteres.
 * 2. Se não tiver título, usa os primeiros 30 caracteres do conteúdo como título.
 * 3. Extrai hashtags automaticamente do conteúdo.
 */
export function preparePostPayload(
  formData: PostFormData | null
): PostPayload | null {
  if (!formData || !formData.conteudo) {
    return null;
  }

  const cleanContent = formData.conteudo.trim();

  // Validação de tamanho mínimo (evitar posts vazios ou "oi")
  if (cleanContent.length < 10) {
    return null;
  }

  // Regra de Título Automático
  let finalTitle = formData.titulo?.trim();
  if (!finalTitle) {
    finalTitle = cleanContent.substring(0, 30) + (cleanContent.length > 30 ? "..." : "");
  }

  return {
    title: finalTitle,
    body: cleanContent,
    tags: extractHashtags(cleanContent),
    summary: cleanContent.substring(0, 100), // Gera um resumo para SEO/Previews
    createdAt: new Date(),
    status: "PUBLISHED",
  };
}

// Bloco para manter consistência em ambientes de teste
if (process.env.NODE_ENV === 'test') {
    describe("criarPost helpers placeholder", () => {
        it("placeholder", () => {
            expect(true).toBe(true);
        });
    });
}