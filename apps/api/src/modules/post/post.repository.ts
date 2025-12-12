import { prisma } from "../../database/prisma.client";
import { Post, Prisma } from "@prisma/client";

export const postRepository = {
  checkIfUserLikedPost: async (userId: string, postId: string) => {
    return await prisma.postLike.findFirst({
      where: { userId, postId },
    });
  },

  // REMOVIDO: A tipagem de retorno explícita que causava conflito.
  // Deixamos o TS inferir o retorno correto.
  findAll: async (
    limit: number,
    offset: number,
    userId: string,
  ) => {
    // Busca a página de posts e o total em uma única transação
    // REMOVIDO: : [Post[], number] -> Deixa o Prisma inferir que 'posts' inclui 'author'
    const [posts, totalCount] = await prisma.$transaction([
      prisma.post.findMany({
        include: {
          author: {
            select: {
              id: true,
              userName: true,
              profileImageUrl: true, // Pegamos a URL do banco
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              groupType: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.post.count(),
    ]);

    // Se não houver posts, retorna cedo
    if (!posts || posts.length === 0) {
      return { posts: [], totalCount };
    }

    // Verifica quais posts foram curtidos pelo usuário
    const postIds = posts.map((p) => p.id);
    const likes = await prisma.postLike.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });

    const likedSet = new Set(likes.map((l) => l.postId));

    // Verifica quais posts foram marcados com "Eu vou"
    const attendances = await prisma.attendance.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });

    const attendanceSet = new Set(attendances.map((a) => a.postId));

    // Mapeamento final
    const postsWithLike = posts.map((post) => ({
      ...post,
      // O PULO DO GATO: Mapear 'profileImageUrl' (Banco) para 'profilePicture' (Front)
      author: {
        ...post.author,
        profilePicture: post.author.profileImageUrl, 
      },
      userLiked: likedSet.has(post.id),
      userGoing: attendanceSet.has(post.id),
    }));

    return {
      posts: postsWithLike,
      totalCount,
    };
  },

  findById: async (id: string) => {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                userName: true,
                // Sugestão: adicione profileImageUrl aqui também se quiser foto nos comentários
                profileImageUrl: true, 
              },
            },
          },
        },
      },
    });
  },

  create: async (
    data: Prisma.PostCreateInput,
    authorId: string,
    groupId: string,
  ): Promise<Post> => {
    return prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        eventDate: data.eventDate ?? null,
        eventFinishDate: data.eventFinishDate ?? null,
        location: data.location ?? null,
        author: {
          connect: {
            id: authorId,
          },
        },
        group: {
          connect: {
            id: groupId,
          },
        },
      },
      include: {
        author: true,
        group: true,
      },
    });
  },

  update: async (id: string, data: Prisma.PostUpdateInput): Promise<Post> => {
    return prisma.post.update({
      where: { id },
      data,
    });
  },

  deletePost: async (id: string): Promise<void> => {
    await prisma.post.delete({ where: { id } });
  },

  deleteComment: async (id: string): Promise<void> => {
    await prisma.comment.delete({ where: { id } });
  },
};