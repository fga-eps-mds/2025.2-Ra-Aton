import {
  listPostsSchema,
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  postIdParamSchema,
} from "../../modules/post/post.validation"; 

describe("PostValidation", () => {
  describe("listPostsSchema", () => {
    it("deve validar com sucesso usando valores padrão", () => {
      const input = { query: {}, body: {} };
      const result = listPostsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.limit).toBe(10);
        expect(result.data.query.page).toBe(1);
      }
    });

    it("deve validar com sucesso fornecendo valores válidos", () => {
      const input = {
        query: { limit: "20", page: "2" },
        body: { userId: "123e4567-e89b-12d3-a456-426614174000" },
      };
      const result = listPostsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.limit).toBe(20);
        expect(result.data.query.page).toBe(2);
        expect(result.data.body?.userId).toBe("123e4567-e89b-12d3-a456-426614174000");
      }
    });

    it("deve falhar se limit for maior que 50", () => {
      const input = { query: { limit: "51" } };
      const result = listPostsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se limit não for positivo", () => {
      const input = { query: { limit: "0" } };
      const result = listPostsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se userId for um UUID inválido", () => {
      const input = { body: { userId: "invalid-uuid" } };
      const result = listPostsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("createPostSchema", () => {
    it("deve validar e transformar dados corretamente (caminho feliz)", () => {
      const input = {
        body: {
          title: "Novo Evento",
          type: "event", 
          content: "Descrição do evento",
          eventDate: "2023-12-25",
          eventFinishDate: new Date("2023-12-26").getTime(),
          location: "São Paulo",
        },
      };
      const result = createPostSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.type).toBe("EVENT");
        expect(result.data.body.eventDate).toBeInstanceOf(Date);
        expect(result.data.body.eventFinishDate).toBeInstanceOf(Date);
      }
    });

    it("deve aceitar objeto Date diretamente", () => {
        const date = new Date();
        const input = {
          body: {
            title: "Teste Data",
            type: "GENERAL",
            eventDate: date,
          },
        };
        const result = createPostSchema.safeParse(input);
  
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.body.eventDate).toEqual(date);
        }
    });

    it("deve falhar se o título for muito curto", () => {
      const input = { body: { title: "A", type: "GENERAL" } };
      const result = createPostSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Título precisa ter no mínimo 2 carcteres");
      }
    });

    it("deve falhar se o tipo for inválido", () => {
      const input = { body: { title: "Teste", type: "INVALID_TYPE" } };
      const result = createPostSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Tipo de postagem inválido");
      }
    });

    it("deve falhar se a descrição for muito curta", () => {
      const input = { body: { title: "Teste", type: "GENERAL", content: "A" } };
      const result = createPostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se a localização for string vazia", () => {
      const input = { body: { title: "Teste", type: "GENERAL", location: "" } };
      const result = createPostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se eventDate for inválida", () => {
      const input = { body: { title: "Teste", type: "GENERAL", eventDate: "data-invalida" } };
      const result = createPostSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected date, received Date");
      }
    });

    it("deve falhar se eventFinishDate for inválida", () => {
      const input = { body: { title: "Teste", type: "GENERAL", eventFinishDate: "data-invalida" } };
      const result = createPostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updatePostSchema", () => {
    it("deve permitir atualização parcial", () => {
      const input = {
        body: {
          title: "Título Atualizado",
        },
      };
      const result = updatePostSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve validar e transformar tipo se fornecido", () => {
      const input = { body: { type: "general" } };
      const result = updatePostSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.type).toBe("GENERAL");
      }
    });

    it("deve validar datas no update se fornecidas como string ou number", () => {
        const input = { 
            body: { 
                eventDate: "2023-01-01", 
                eventFinishDate: 1700000000000 
            } 
        };
        const result = updatePostSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.body.eventDate).toBeInstanceOf(Date);
            expect(result.data.body.eventFinishDate).toBeInstanceOf(Date);
        }
    });

    it("deve aceitar objeto Date diretamente no update", () => {
        const date = new Date();
        const input = { body: { eventDate: date } };
        const result = updatePostSchema.safeParse(input);
        expect(result.success).toBe(true);
    });

    it("deve falhar se titulo for curto no update", () => {
      const input = { body: { title: "A" } };
      const result = updatePostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se tipo for inválido no update", () => {
      const input = { body: { type: "WRONG" } };
      const result = updatePostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se eventDate for inválida no update", () => {
      const input = { body: { eventDate: "abc" } };
      const result = updatePostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve falhar se eventFinishDate for inválida no update", () => {
        const input = { body: { eventFinishDate: "abc" } };
        const result = updatePostSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

    it("deve falhar se location for vazia no update", () => {
      const input = { body: { location: "" } };
      const result = updatePostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("deletePostSchema", () => {
    it("deve validar id UUID corretamente", () => {
      const input = { params: { id: "123e4567-e89b-12d3-a456-426614174000" } };
      const result = deletePostSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve falhar com UUID inválido", () => {
      const input = { params: { id: "123" } };
      const result = deletePostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("postIdParamSchema", () => {
    it("deve validar id UUID corretamente", () => {
      const input = { params: { id: "123e4567-e89b-12d3-a456-426614174000" } };
      const result = postIdParamSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve falhar com UUID inválido", () => {
      const input = { params: { id: "xyz" } };
      const result = postIdParamSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});