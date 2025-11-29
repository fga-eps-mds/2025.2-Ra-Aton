import { postRepository } from "../../modules/post/post.repository";
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
  author: { id: AUTHOR_ID, userName: "user-test" },
  group: { id: GROUP_ID, name: "Group Test", groupType: "PUBLIC" },
};

describe("PostRepository", () => {
  // Limpa o estado dos mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================
  // Testes para findAll
  // =====================================
  describe("findAll", () => {
    const limit = 10;
    const offset = 0;
    const userId = AUTHOR_ID;
    const expectedFindManyArgs = {
      include: {
        author: { select: { id: true, userName: true } },
        group: { select: { id: true, name: true, groupType: true } },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    };
    const expectedCountArgs = {};

    it("deve retornar posts paginados com a contagem total e indicar se o usuário curtiu/vai", async () => {
      // Arrange
      const mockPostsList = [mockPost];
      (prismaMock.post.findMany as jest.Mock).mockReturnValue(
        expectedFindManyArgs,
      );
      (prismaMock.post.count as jest.Mock).mockReturnValue(expectedCountArgs);

      // 2. Mock do resultado final da transação: [posts_list, total_count]
      (prismaMock.$transaction as jest.Mock).mockResolvedValue([
        mockPostsList,
        mockPostsList.length,
      ] as any);

      // Mock da consulta de likes/attendances
      prismaMock.postLike.findMany.mockResolvedValue([
        { postId: POST_ID }, // Usuário curtiu
      ] as any);
      prismaMock.attendance.findMany.mockResolvedValue([
        { postId: POST_ID }, // Usuário vai
      ] as any);

      const expectedPost = { ...mockPost, userLiked: true, userGoing: true };
      const expectedResult = {
        posts: [expectedPost],
        totalCount: mockPostsList.length,
      };

      // Act
      const result = await postRepository.findAll(limit, offset, userId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.$transaction).toHaveBeenCalledWith([
        expectedFindManyArgs,
        expectedCountArgs,
      ]);

      // Verifica as chamadas de likes/attendances
      expect(prismaMock.postLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, postId: { in: [POST_ID] } },
        }),
      );
      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, postId: { in: [POST_ID] } },
        }),
      );
    });

    it("deve retornar lista vazia e totalCount se não houver posts", async () => {
      // Arrange
      (prismaMock.$transaction as jest.Mock).mockResolvedValue([[], 0] as any);

      // Act
      const result = await postRepository.findAll(limit, offset, userId);

      // Assert
      expect(result).toEqual({ posts: [], totalCount: 0 });
      expect(prismaMock.postLike.findMany).not.toHaveBeenCalled();
      expect(prismaMock.attendance.findMany).not.toHaveBeenCalled();
    });
  });

  // =====================================
  // Testes para findById
  // =====================================
  describe("findById", () => {
    it("deve retornar um post pelo ID (com comentários inclusos)", async () => {
      // Arrange
      const mockPostWithComments = { ...mockPost, comments: [] };
      prismaMock.post.findUnique.mockResolvedValue(mockPostWithComments as any);

      // Act
      const result = await postRepository.findById(POST_ID);

      // Assert
      expect(result).toEqual(mockPostWithComments);
      expect(prismaMock.post.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: POST_ID },
          include: { comments: expect.any(Object) },
        }),
      );
    });

    it("deve retornar null se o post não for encontrado", async () => {
      // Arrange
      prismaMock.post.findUnique.mockResolvedValue(null);

      // Act
      const result = await postRepository.findById("non-existent-id");

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
        eventDate: null,
        eventFinishDate: null,
        location: null,
      } as any;

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
