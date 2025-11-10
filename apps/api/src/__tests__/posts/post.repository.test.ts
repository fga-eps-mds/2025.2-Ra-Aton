import postRepository from "../../modules/post/post.repository"; 
import { PostType } from "@prisma/client"; 
import { prismaMock } from "../prisma-mock";

// Dados mockados
const AUTHOR_ID = "auth-uuid-123";
const GROUP_ID = "group-uuid-456";
const POST_ID = "post-uuid-789";
const COMMENT_ID = "comment-uuid-000";

const mockPost = {
  id: POST_ID,
  title: "Test Post",
  content: "Conteúdo do teste",
  type: PostType.GENERAL,
  authorId: AUTHOR_ID,
  groupId: GROUP_ID,
  eventDate: null,
  eventFinishDate: null,
  location: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PostRepository", () => {
  // Limpa o estado dos mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================
  // Testes para findAllPost
  // =====================================
  describe("findAllPost", () => {
    it("deve retornar todos os posts ordenados por data de criação", async () => {
      // Arrange
      const mockPostsList = [mockPost];
      prismaMock.post.findMany.mockResolvedValue(mockPostsList as any);

      // Act
      const result = await postRepository.findAllPost();

      // Assert
      expect(result).toEqual(mockPostsList);
      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
      expect(prismaMock.post.findMany).toHaveBeenCalledTimes(1);
    });
  });

  // =====================================
  // Testes para findPostById
  // =====================================
  describe("findPostById", () => {
    it("deve retornar um post pelo ID", async () => {
      // Arrange
      prismaMock.post.findUnique.mockResolvedValue(mockPost as any);

      // Act
      const result = await postRepository.findPostById(POST_ID);

      // Assert
      expect(result).toEqual(mockPost);
      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: POST_ID },
      });
    });

    it("deve retornar null se o post não for encontrado", async () => {
      // Arrange
      prismaMock.post.findUnique.mockResolvedValue(null);

      // Act
      const result = await postRepository.findPostById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  // =====================================
  // Testes para create
  // =====================================
  describe("create", () => {
    it("deve criar um novo post e retornar o objeto criado", async () => {
      // Arrange
      const createData = {
        title: "New Post",
        content: "Content",
        type: PostType.GENERAL,
      } as any; // Usamos 'any' para simular a entrada Prisma.PostCreateInput

      // Simula a resposta completa do Prisma, incluindo as relações
      const mockCreatedPost = {
        ...mockPost,
        ...createData,
        author: { id: AUTHOR_ID },
        group: { id: GROUP_ID },
      };
      prismaMock.post.create.mockResolvedValue(mockCreatedPost as any);

      // Act
      const result = await postRepository.create(
        createData,
        AUTHOR_ID,
        GROUP_ID,
      );

      // Assert
      expect(result).toEqual(mockCreatedPost);
      expect(prismaMock.post.create).toHaveBeenCalledWith({
        data: {
          title: createData.title,
          content: createData.content,
          type: createData.type,
          eventDate: null,
          eventFinishDate: null,
          location: null,
          author: { connect: { id: AUTHOR_ID } },
          group: { connect: { id: GROUP_ID } },
        },
        include: { author: true, group: true },
      });
    });
  });

  // =====================================
  // Testes para update
  // =====================================
  describe("update", () => {
    it("deve atualizar um post e retornar o objeto atualizado", async () => {
      // Arrange
      const updatePayload = { content: "Updated Content" };
      const updatedPost = { ...mockPost, ...updatePayload };
      prismaMock.post.update.mockResolvedValue(updatedPost as any);

      // Act
      const result = await postRepository.update(POST_ID, updatePayload);

      // Assert
      expect(result.content).toBe(updatePayload.content);
      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: POST_ID },
        data: updatePayload,
      });
    });
  });

  // =====================================
  // Testes para deletePost
  // =====================================
  describe("deletePost", () => {
    it("deve chamar prisma.post.delete para excluir um post", async () => {
      // Arrange
      // O mockResolvedValue deve ser o objeto deletado ou 'undefined' se o método for 'void'
      prismaMock.post.delete.mockResolvedValue(mockPost as any);

      // Act
      await postRepository.deletePost(POST_ID);

      // Assert
      expect(prismaMock.post.delete).toHaveBeenCalledWith({
        where: { id: POST_ID },
      });
    });
  });

  // =====================================
  // Testes para deleteComment
  // =====================================
  describe("deleteComment", () => {
    it("deve chamar prisma.comment.delete para excluir um comentário", async () => {
      // Arrange
      // Assumindo um mock semelhante para Comment
      const mockComment = { id: COMMENT_ID, content: "Test Comment" };
      (prismaMock.comment.delete as jest.Mock).mockResolvedValue(
        mockComment as any,
      );

      // Act
      await postRepository.deleteComment(COMMENT_ID);

      // Assert
      expect(prismaMock.comment.delete).toHaveBeenCalledWith({
        where: { id: COMMENT_ID },
      });
    });
  });
});