import { prisma } from "../../database/prisma.client";
import { Prisma, Post, Comment } from "@prisma/client";

class PostRepository {
  async findAllPost(): Promise<Post[]> {
    return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findPostById(id: string): Promise<Post | null> {
    return prisma.post.findUnique({ where: { id } });
  }

  async create(data: Prisma.PostCreateInput, authorId: string): Promise<Post> {
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
      },
      include: {
        author: true,
      },
    });
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data,
    });
  }

  async deletePost(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } });
  }

  async deleteComment(id: string): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
}

export default new PostRepository();
