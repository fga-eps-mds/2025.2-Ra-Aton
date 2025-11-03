import { prisma } from "../../database/prisma.client";
import { Prisma, Comment } from "@prisma/client";

class commentRepository {
  async findCommentById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({ where: { id } });
  }

  async deleteComment(id: string): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
}

export default new commentRepository();
