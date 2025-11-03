import { prisma } from "../database/prisma.client";

export const feedService = {
  async getFeed(userId: string | null, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, userName: true } },
        _count: { select: { comments: true, likes: true, attendances: true } },
      },
    });

    const postIds = posts.map((p) => p.id);

    let likedMap = new Map<string, boolean>();
    let attendingMap = new Map<string, boolean>();

    if (userId) {
      const likes = await prisma.postLike.findMany({
        where: { userId, postId: { in: postIds } },
      });
      likes.forEach((l) => likedMap.set(l.postId, true));

      const attends = await prisma.attendance.findMany({
        where: { userId, postId: { in: postIds } },
      });
      attends.forEach((a) => attendingMap.set(a.postId, true));
    }

    const dto = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      type: p.type,
      author: p.author,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      eventDate: p.eventDate,
      eventFinishDate: p.eventFinishDate,
      location: p.location,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      attendancesCount: p._count.attendances,
      likedByUser: likedMap.get(p.id) ?? false,
      attendingByUser: attendingMap.get(p.id) ?? false,
    }));

    return { page, limit, items: dto };
  },
};
