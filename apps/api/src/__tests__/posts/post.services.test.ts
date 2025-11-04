import { postService } from "../../modules/post/post.service";
import postRepository from "../../modules/post/post.repository";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";

// 1. Mock do post.repository.ts
// Isso garante que o teste da lógica de negócio (Service) não toque no banco de dados real.
jest.mock("../../modules/post/post.repository", () => ({
  // Simula as funções do repository com funções mockadas
  findAllPost: jest.fn(),
  findPostById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deletePost: jest.fn(),
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
  eventDate: new Date().toISOString(),
  eventFinishDate: new Date().toISOString(),
  location: "Auditório Principal",
  author: { id: MOCK_AUTHOR_ID },
};

describe("PostService", () => {
  // Limpa o estado dos mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================
  // Testes para getAllPosts
  // =====================================
  describe("getAllPosts", () => {
    it("deve retornar uma lista de postagens do repositório", async () => {
      // Simula que o repository encontrou posts
      (postRepository.findAllPost as jest.Mock).mockResolvedValue([mockPost]);

      const posts = await postService.getAllPosts();

      expect(posts).toEqual([mockPost]);
      expect(postRepository.findAllPost).toHaveBeenCalledTimes(1);
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
      };
      // Simula a criação bem-sucedida
      (postRepository.create as jest.Mock).mockResolvedValue(mockPost);

      const result = await postService.createPost(data);

      expect(result).toEqual(mockPost);
      expect(postRepository.create).toHaveBeenCalledWith(data, MOCK_AUTHOR_ID);
    });

    it("deve criar um post EVENTO com sucesso quando todos os campos obrigatórios estão presentes", async () => {
      (postRepository.create as jest.Mock).mockResolvedValue({
        ...mockPost,
        ...mockEventPostData,
      });

      const result = await postService.createPost(mockEventPostData);

      expect(result.type).toBe("EVENT");
      expect(postRepository.create).toHaveBeenCalledTimes(1);
    });

    it("deve lançar ApiError 404 se o objeto author ou seu id estiver faltando", async () => {
      // Teste 1: Author está faltando
      const data1 = { title: "a", content: "b", type: "GENERAL" };
      await expect(postService.createPost(data1)).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Author da postagem não encontrado"),
      );
      // Teste 2: Author existe mas o id está faltando
      const data2 = {
        title: "a",
        content: "b",
        type: "GENERAL",
        author: {},
      };
      await expect(postService.createPost(data2)).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Author da postagem não encontrado"),
      );
      expect(postRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar ApiError 400 se for um EVENTO e eventDate, eventFinishDate ou location estiver faltando", async () => {
      // Caso 1: eventDate faltando
      const invalidData1 = { ...mockEventPostData, eventDate: undefined };
      await expect(postService.createPost(invalidData1)).rejects.toThrow(
        new ApiError(
          HttpStatus.BAD_REQUEST,
          "Data de inicio, Data de terminó e Localização do evento são obrigatórios em postagens do tipo evento",
        ),
      );

      // Caso 2: location faltando
      const invalidData2 = { ...mockEventPostData, location: undefined };
      await expect(postService.createPost(invalidData2)).rejects.toThrow(
        new ApiError(
          HttpStatus.BAD_REQUEST,
          "Data de inicio, Data de terminó e Localização do evento são obrigatórios em postagens do tipo evento",
        ),
      );

      expect(postRepository.create).not.toHaveBeenCalled();
    });
  });

  // =====================================
  // Testes para updatePost
  // =====================================
  describe("updatePost", () => {
    const updateData = { content: "Conteúdo Atualizado" };
    const OTHER_USER_ID = "other-user-uuid-999";

    it("deve atualizar o post com sucesso se o usuário for o autor", async () => {
      // Simula que o post foi encontrado e pertence ao usuário
      (postRepository.findPostById as jest.Mock).mockResolvedValue(mockPost);
      const updatedPostMock = { ...mockPost, ...updateData };
      (postRepository.update as jest.Mock).mockResolvedValue(updatedPostMock);

      const result = await postService.updatePost(
        MOCK_POST_ID,
        MOCK_AUTHOR_ID,
        updateData,
      );

      expect(result.content).toBe(updateData.content);
      expect(postRepository.update).toHaveBeenCalledWith(
        MOCK_POST_ID,
        updateData,
      );
    });

    it("deve lançar ApiError 404 se a postagem não for encontrada", async () => {
      // Simula que o postRepository.findPostById retornou null
      (postRepository.findPostById as jest.Mock).mockResolvedValue(null);

      await expect(
        postService.updatePost(MOCK_POST_ID, MOCK_AUTHOR_ID, updateData),
      ).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada"),
      );
      expect(postRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar ApiError 403 se o usuário não for o autor da postagem", async () => {
      // Simula que o post foi encontrado, mas pertence a outro usuário
      (postRepository.findPostById as jest.Mock).mockResolvedValue(mockPost);

      await expect(
        postService.updatePost(MOCK_POST_ID, OTHER_USER_ID, updateData),
      ).rejects.toThrow(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Você não tem permissão para atualizar esta postagem",
        ),
      );
      expect(postRepository.update).not.toHaveBeenCalled();
    });
  });

  // =====================================
  // Testes para deletePost
  // =====================================
  describe("deletePost", () => {
    const OTHER_USER_ID = "other-user-uuid-999";

    it("deve deletar o post com sucesso se o usuário for o autor", async () => {
      // Simula que o post foi encontrado
      (postRepository.findPostById as jest.Mock).mockResolvedValue(mockPost);
      // Simula que a exclusão foi bem-sucedida
      (postRepository.deletePost as jest.Mock).mockResolvedValue(undefined);

      await postService.deletePost(MOCK_POST_ID, MOCK_AUTHOR_ID);

      expect(postRepository.deletePost).toHaveBeenCalledWith(MOCK_POST_ID);
    });

    it("deve lançar ApiError 404 se a postagem não for encontrada", async () => {
      // Simula que o postRepository.findPostById retornou null
      (postRepository.findPostById as jest.Mock).mockResolvedValue(null);

      await expect(
        postService.deletePost(MOCK_POST_ID, MOCK_AUTHOR_ID),
      ).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada"),
      );
      expect(postRepository.deletePost).not.toHaveBeenCalled();
    });

    it("deve lançar ApiError 403 se o usuário não for o autor da postagem", async () => {
      // Simula que o post foi encontrado, mas pertence a outro usuário
      (postRepository.findPostById as jest.Mock).mockResolvedValue(mockPost);

      await expect(
        postService.deletePost(MOCK_POST_ID, OTHER_USER_ID),
      ).rejects.toThrow(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Você não tem permissão para excluir esta postagem",
        ),
      );
      expect(postRepository.deletePost).not.toHaveBeenCalled();
    });
  });
});
