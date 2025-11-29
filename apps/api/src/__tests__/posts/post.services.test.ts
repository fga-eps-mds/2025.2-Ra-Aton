import { postService } from "../../modules/post/post.service";
import { postRepository } from "../../modules/post/post.repository";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";

// 1. Mock do post.repository.ts
jest.mock("../../modules/post/post.repository", () => ({
  postRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deletePost: jest.fn(),
  },
}));

// Definição de dados mockados para reuso
const MOCK_AUTHOR_ID = "author-uuid-123";
const MOCK_POST_ID = "post-uuid-456";
const GROUP_ID = "group-id";
const mockGroup = { id: GROUP_ID, name: "Pesadelo" };

const mockPost = {
  id: MOCK_POST_ID,
  title: "Post Teste",
  content: "Conteúdo do post",
  type: "GENERAL",
  authorId: MOCK_AUTHOR_ID,
  group: mockGroup,
  groupId: GROUP_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  eventDate: null,
  eventFinishDate: null,
  location: null,
};

const mockEventPostData = {
  title: "Evento Teste",
  content: "Detalhes do evento",
  type: "EVENT",
  group: mockGroup,
  groupId: GROUP_ID,
  eventDate: "2026-11-20T21:30:00.000Z",
  eventFinishDate: "2027-11-20T21:30:00.000Z",
  location: "Auditório Principal",
  author: { id: MOCK_AUTHOR_ID },
};

// Mapeamento dos mocks para fácil acesso e tipagem
const mockFindAll = postRepository.findAll as jest.Mock;
const mockFindById = postRepository.findById as jest.Mock;
const mockCreate = postRepository.create as jest.Mock;
const mockUpdate = postRepository.update as jest.Mock;
const mockDeletePost = postRepository.deletePost as jest.Mock;

describe("PostService", () => {
  // Limpa o estado dos mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================
  // Testes para listPosts (Corrigido de getAllPosts)
  // =====================================
  describe("listPosts", () => {
    it("deve retornar uma lista de postagens e metadados de paginação", async () => {
      const limit = 10;
      const page = 1;
      const totalCount = 15;
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(totalCount / limit);

      const mockResponse = {
        posts: [mockPost],
        totalCount: totalCount,
      };

      mockFindAll.mockResolvedValue(mockResponse);

      const result = await postService.listPosts(limit, page, MOCK_AUTHOR_ID);

      expect(result.data).toEqual(mockResponse.posts);
      expect(result.meta).toEqual({
        page: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
      expect(mockFindAll).toHaveBeenCalledWith(limit, offset, MOCK_AUTHOR_ID);
    });
  });

  // =====================================
  // Testes para getPostById (Adicionado)
  // =====================================
  describe("getPostById", () => {
    it("deve retornar um post quando encontrado", async () => {
      mockFindById.mockResolvedValue(mockPost);

      const result = await postService.getPostById(MOCK_POST_ID);

      expect(result).toEqual(mockPost);
      expect(mockFindById).toHaveBeenCalledWith(MOCK_POST_ID);
    });

    it("deve lançar ApiError 404 quando o post não é encontrado", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(postService.getPostById(MOCK_POST_ID)).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Post não encontrado"),
      );
    });
  });

  // =====================================
  // Testes para createPost
  // =====================================
  describe("createPost", () => {
    it("deve criar um post GENERAL com sucesso e chamar o repository.create", async () => {
      const data = {
        title: "Novo Post",
        content: "Conteúdo",
        type: "GENERAL",
        author: { id: MOCK_AUTHOR_ID },
        group: mockGroup,
        groupId: GROUP_ID,
      };
      mockCreate.mockResolvedValue(mockPost);

      const result = await postService.createPost(data);

      expect(result).toEqual(mockPost);
      expect(mockCreate).toHaveBeenCalledWith(data, MOCK_AUTHOR_ID, GROUP_ID);
    });

    it("deve lançar ApiError 404 se o objeto author ou seu id estiver faltando", async () => {
      const expectedError = new ApiError(
        HttpStatus.NOT_FOUND,
        "Author da postagem não encontrado",
      );

      // Teste 1: Author está faltando
      const data1 = { title: "a", content: "b", type: "GENERAL" };
      await expect(postService.createPost(data1)).rejects.toThrow(
        expectedError,
      );

      // Teste 2: Author existe mas o id está faltando
      const data2 = {
        title: "a",
        content: "b",
        type: "GENERAL",
        author: {},
        groupId: GROUP_ID,
      };
      await expect(postService.createPost(data2)).rejects.toThrow(
        expectedError,
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    // Teste Adicionado para a nova validação
    it("deve lançar ApiError 404 se o objeto group ou groupId estiver faltando", async () => {
      const expectedError = new ApiError(
        HttpStatus.NOT_FOUND,
        "Grupo não encontrado, somente grupos podem fazer postagens",
      );

      const data1 = {
        title: "a",
        content: "b",
        type: "GENERAL",
        author: { id: MOCK_AUTHOR_ID },
      };
      await expect(postService.createPost(data1)).rejects.toThrow(
        expectedError,
      );

      // Teste 2: Group existe, mas groupId está faltando
      const data2 = {
        title: "a",
        content: "b",
        type: "GENERAL",
        author: { id: MOCK_AUTHOR_ID },
        group: mockGroup,
      };
      await expect(postService.createPost(data2)).rejects.toThrow(
        expectedError,
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("deve criar um post EVENTO com sucesso quando todos os campos obrigatórios estão presentes", async () => {
      mockCreate.mockResolvedValue({
        ...mockPost,
        ...mockEventPostData,
      });

      const result = await postService.createPost(mockEventPostData);

      expect(result.type).toBe("EVENT");
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("deve lançar ApiError 400 se for um EVENTO e eventDate, eventFinishDate ou location estiver faltando", async () => {
      const expectedError = new ApiError(
        HttpStatus.BAD_REQUEST,
        "Data de inicio, Data de termino e Localização do evento são obrigatórios em postagens do tipo evento",
      );

      // Caso 1: eventDate faltando
      const invalidData1 = { ...mockEventPostData, eventDate: undefined };
      await expect(postService.createPost(invalidData1)).rejects.toThrow(
        expectedError,
      );

      // Caso 2: location faltando
      const invalidData2 = { ...mockEventPostData, location: undefined };
      await expect(postService.createPost(invalidData2)).rejects.toThrow(
        expectedError,
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  // =====================================
  // Testes para updatePost
  // =====================================
  describe("updatePost", () => {
    const updateData = { content: "Conteúdo Atualizado" };
    const OTHER_USER_ID = "other-user-uuid-999";

    it("deve atualizar o post com sucesso se o usuário for o autor", async () => {
      // CORREÇÃO: Usar mockFindById
      mockFindById.mockResolvedValue(mockPost);
      const updatedPostMock = { ...mockPost, ...updateData };
      mockUpdate.mockResolvedValue(updatedPostMock);

      const result = await postService.updatePost(
        MOCK_POST_ID,
        MOCK_AUTHOR_ID,
        updateData,
      );

      expect(result.content).toBe(updateData.content);
      expect(mockUpdate).toHaveBeenCalledWith(MOCK_POST_ID, updateData);
    });

    it("deve lançar ApiError 404 se a postagem não for encontrada", async () => {
      // CORREÇÃO: Usar mockFindById
      mockFindById.mockResolvedValue(null);

      await expect(
        postService.updatePost(MOCK_POST_ID, MOCK_AUTHOR_ID, updateData),
      ).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada"),
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("deve lançar ApiError 403 se o usuário não for o autor da postagem", async () => {
      // CORREÇÃO: Usar mockFindById
      mockFindById.mockResolvedValue(mockPost);

      await expect(
        postService.updatePost(MOCK_POST_ID, OTHER_USER_ID, updateData),
      ).rejects.toThrow(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Você não tem permissão para atualizar esta postagem",
        ),
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // =====================================
  // Testes para deletePost
  // =====================================
  describe("deletePost", () => {
    const OTHER_USER_ID = "other-user-uuid-999";

    it("deve deletar o post com sucesso se o usuário for o autor", async () => {
      // CORREÇÃO: Usar mockFindById
      mockFindById.mockResolvedValue(mockPost);
      mockDeletePost.mockResolvedValue(undefined);

      await postService.deletePost(MOCK_POST_ID, MOCK_AUTHOR_ID);

      expect(mockDeletePost).toHaveBeenCalledWith(MOCK_POST_ID);
    });

    it("deve lançar ApiError 404 se a postagem não for encontrada", async () => {
      // CORREÇÃO: Usar mockFindById
      mockFindById.mockResolvedValue(null);

      await expect(
        postService.deletePost(MOCK_POST_ID, MOCK_AUTHOR_ID),
      ).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada"),
      );
      expect(mockDeletePost).not.toHaveBeenCalled();
    });

    it("deve lançar ApiError 403 se o usuário não for o autor da postagem", async () => {
      // CORREÇÃO: Usar mockFindById
      mockFindById.mockResolvedValue(mockPost);

      await expect(
        postService.deletePost(MOCK_POST_ID, OTHER_USER_ID),
      ).rejects.toThrow(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Você não tem permissão para excluir esta postagem",
        ),
      );
      expect(mockDeletePost).not.toHaveBeenCalled();
    });
  });
});
