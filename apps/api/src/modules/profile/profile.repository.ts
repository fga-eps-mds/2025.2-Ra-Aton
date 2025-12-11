import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProfileRepository {
  /**
   * Busca perfil completo de um usuário pelo userName
   */
  async findUserProfileByUserName(userName: string, authUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { userName },
      select: {
        id: true,
        userName: true,
        name: true,
        email: true,
        bio: true,
        profileImageUrl: true,
        bannerImageUrl: true,
        profileType: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            GroupMembership: true,
            subscription: true,
          },
        },
      },
    });

    if (!user) return null;

    // Verifica se o usuário autenticado está seguindo este perfil
    let isFollowing = false;
    if (authUserId && authUserId !== user.id) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: authUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      groupsCount: user._count.GroupMembership,
      matchesCount: user._count.subscription,
      isFollowing,
      isOwner: authUserId === user.id,
    };
  }

  /**
   * Busca perfil completo de um grupo pelo nome
   */
  async findGroupProfileByName(groupName: string, authUserId?: string) {
    const group = await prisma.group.findUnique({
      where: { name: groupName },
      select: {
        id: true,
        name: true,
        description: true,
        bio: true,
        logoUrl: true,
        bannerUrl: true,
        groupType: true,
        sports: true,
        createdAt: true,
        updatedAt: true,
        acceptingNewMembers: true,
        _count: {
          select: {
            followers: true,
            memberships: true,
            posts: true,
          },
        },
        memberships: {
          where: { isCreator: true },
          select: {
            userId: true,
          },
          take: 1,
        },
      },
    });

    if (!group) return null;

    // Verifica se o usuário autenticado está seguindo este grupo
    let isFollowing = false;
    let isMember = false;
    let isLeader = false;

    if (authUserId) {
      const follow = await prisma.groupFollow.findUnique({
        where: {
          userId_groupId: {
            userId: authUserId,
            groupId: group.id,
          },
        },
      });
      isFollowing = !!follow;

      const membership = await prisma.groupMembership.findUnique({
        where: {
          userId_groupId: {
            userId: authUserId,
            groupId: group.id,
          },
        },
      });

      isMember = !!membership;
      isLeader = membership?.isCreator || membership?.role === "ADMIN";
    }

    const leaderId = group.memberships[0]?.userId || null;

    return {
      id: group.id,
      name: group.name,
      description: group.description || "",
      bio: group.bio,
      logoUrl: group.logoUrl,
      bannerUrl: group.bannerUrl,
      type: group.groupType,
      sport: group.sports[0] || undefined,
      leaderId,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      membersCount: group._count.memberships,
      postsCount: group._count.posts,
      followersCount: group._count.followers,
      isFollowing,
      isMember,
      isLeader,
    };
  }

  /**
   * Busca partidas em que o usuário está inscrito
   */
  async findUserMatches(userId: string, limit: number, offset: number) {
    const matches = await prisma.playerSubscription.findMany({
      where: { userId },
      select: {
        match: {
          select: {
            id: true,
            title: true,
            description: true,
            authorId: true,
            MatchDate: true,
            MatchStatus: true,
            location: true,
            maxPlayers: true,
            teamNameA: true,
            teamNameB: true,
            createdAt: true,
            players: {
              select: {
                id: true,
                team: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    userName: true,
                  },
                },
              },
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = await prisma.playerSubscription.count({
      where: { userId },
    });

    // Transformar para o formato esperado pelo frontend
    const formattedMatches = matches.map((sub) => {
      const match = sub.match;
      const teamAPlayers = match.players.filter((p) => p.team === "A");
      const teamBPlayers = match.players.filter((p) => p.team === "B");

      return {
        id: match.id,
        title: match.title,
        description: match.description,
        authorId: match.authorId,
        matchDate: match.MatchDate.toISOString(),
        MatchStatus: match.MatchStatus,
        location: match.location,
        maxPlayers: match.maxPlayers,
        teamNameA: match.teamNameA || "TIME_A",
        teamNameB: match.teamNameB || "TIME_B",
        createdAt: match.createdAt.toISOString(),
        isSubscriptionOpen: match.MatchStatus === "EM_BREVE",
        spots: {
          totalMax: match.maxPlayers,
          totalFilled: match.players.length,
        },
        teamA: {
          name: match.teamNameA || "TIME_A",
          max: Math.floor(match.maxPlayers / 2),
          filled: teamAPlayers.length,
          isOpen: teamAPlayers.length < Math.floor(match.maxPlayers / 2) ? 1 : 0,
          players: teamAPlayers.map((p) => ({
            id: p.user.id,
            name: p.user.name,
            userName: p.user.userName,
          })),
        },
        teamB: {
          name: match.teamNameB || "TIME_B",
          max: Math.ceil(match.maxPlayers / 2),
          filled: teamBPlayers.length,
          isOpen: teamBPlayers.length < Math.ceil(match.maxPlayers / 2) ? 1 : 0,
          players: teamBPlayers.map((p) => ({
            id: p.user.id,
            name: p.user.name,
            userName: p.user.userName,
          })),
        },
      };
    });

    return { matches: formattedMatches, totalCount };
  }

  /**
   * Busca grupos que o usuário segue
   */
  async findUserFollowedGroups(userId: string, limit: number, offset: number) {
    const follows = await prisma.groupFollow.findMany({
      where: { userId },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            groupType: true,
            sports: true,
            logoUrl: true,
            bannerUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = await prisma.groupFollow.count({
      where: { userId },
    });

    const groups = follows.map((f) => ({
      id: f.group.id,
      name: f.group.name,
      description: f.group.description,
      type: f.group.groupType,
      sport: f.group.sports[0],
      logoUrl: f.group.logoUrl,
      bannerUrl: f.group.bannerUrl,
      createdAt: f.group.createdAt.toISOString(),
      updatedAt: f.group.updatedAt.toISOString(),
    }));

    return { groups, totalCount };
  }

  /**
   * Busca grupos em que o usuário é membro
   */
  async findUserMemberGroups(userId: string, limit: number, offset: number) {
    const memberships = await prisma.groupMembership.findMany({
      where: { userId },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            groupType: true,
            sports: true,
            logoUrl: true,
            bannerUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = await prisma.groupMembership.count({
      where: { userId },
    });

    const groups = memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      type: m.group.groupType,
      sport: m.group.sports[0],
      logoUrl: m.group.logoUrl,
      bannerUrl: m.group.bannerUrl,
      createdAt: m.group.createdAt.toISOString(),
      updatedAt: m.group.updatedAt.toISOString(),
    }));

    return { groups, totalCount };
  }

  /**
   * Busca membros de um grupo
   */
  async findGroupMembers(groupId: string, limit: number, offset: number) {
    const memberships = await prisma.groupMembership.findMany({
      where: { groupId },
      select: {
        user: {
          select: {
            id: true,
            userName: true,
            name: true,
            email: true,
            bio: true,
            profileImageUrl: true,
            bannerImageUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "asc",
      },
    });

    const totalCount = await prisma.groupMembership.count({
      where: { groupId },
    });

    const members = memberships.map((m) => ({
      id: m.user.id,
      userName: m.user.userName,
      name: m.user.name,
      email: m.user.email,
      bio: m.user.bio,
      profilePicture: m.user.profileImageUrl,
      bannerImage: m.user.bannerImageUrl,
      createdAt: m.user.createdAt.toISOString(),
      updatedAt: m.user.updatedAt.toISOString(),
    }));

    return { members, totalCount };
  }

  /**
   * Busca posts de um grupo
   */
  async findGroupPosts(groupId: string, limit: number, offset: number) {
    const posts = await prisma.post.findMany({
      where: { groupId },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        authorId: true,
        groupId: true,
        createdAt: true,
        updatedAt: true,
        eventDate: true,
        eventFinishDate: true,
        location: true,
        likesCount: true,
        commentsCount: true,
        attendancesCount: true,
        author: {
          select: {
            id: true,
            userName: true,
            name: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = await prisma.post.count({
      where: { groupId },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      author: {
        userName: post.author.userName,
        id: post.author.id,
      },
      authorId: post.authorId,
      group: null,
      groupId: post.groupId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      eventDate: post.eventDate?.toISOString() || null,
      eventFinishDate: post.eventFinishDate?.toISOString() || null,
      location: post.location,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      attendancesCount: post.attendancesCount,
    }));

    return { posts: formattedPosts, totalCount };
  }
}

export default new ProfileRepository();
