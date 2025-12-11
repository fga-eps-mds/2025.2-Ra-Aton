# 📱 Backend - Implementação de Perfil de Usuário e Grupo

## 📋 Visão Geral

Esta documentação descreve todos os passos necessários para implementar os endpoints de perfil de usuário e grupo no backend, baseado nas necessidades do frontend já implementado.

## 🎯 Requisitos do Frontend

O frontend espera os seguintes endpoints:

### Perfil de Usuário
- **GET** `/api/v1/profile/user/:userName` - Buscar perfil completo de usuário
- **POST** `/api/v1/users/:userId/follow` - Seguir um usuário
- **DELETE** `/api/v1/users/:userId/unfollow` - Deixar de seguir um usuário

### Perfil de Grupo
- **GET** `/api/v1/profile/group/:groupName` - Buscar perfil completo de grupo
- **POST** `/api/v1/groups/:groupId/follow` - Seguir um grupo (✅ já existe)
- **DELETE** `/api/v1/groups/:groupId/unfollow` - Deixar de seguir um grupo (✅ já existe)

---

## 🗄️ 1. ATUALIZAÇÃO DO SCHEMA PRISMA

### ✅ TODO: Adicionar campos de imagem e bio ao User

**Arquivo:** `/apps/api/prisma/schema.prisma`

```prisma
model User {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique
  userName     String       @unique
  profileType  ProfileType?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  passwordHash String
  notificationsAllowed Boolean @default(true)

  // ✅ NOVOS CAMPOS PARA PERFIL
  bio              String?  // Bio do usuário
  profileImageUrl  String?  // URL da imagem de perfil no Cloudinary
  bannerImageUrl   String?  // URL do banner no Cloudinary
  profileImageId   String?  // Public ID do Cloudinary (para deletar)
  bannerImageId    String?  // Public ID do Cloudinary (para deletar)

  // Relationships
  subscription PlayerSubscription[]
  posts           Post[]
  matchs          Match[]
  Attendance      Attendance[]
  Report          Report[]
  PostLike        PostLike[]
  Comment         Comment[]
  joinRequests    GroupJoinRequest[]
  GroupMembership GroupMembership[]
  notifyTokens    UsersNotifyTokens[]
  followedGroups GroupFollow[]
  notifications Notification[]
  
  // ✅ NOVO: Relação de seguidores (usuários que seguem este usuário)
  followers UserFollow[] @relation("UserFollowers")
  // ✅ NOVO: Relação de seguindo (usuários que este usuário segue)
  following UserFollow[] @relation("UserFollowing")
}
```

### ✅ TODO: Adicionar campos de imagem e bio ao Group

```prisma
model Group {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  sports      String[]
  groupType   GroupType @default(AMATEUR)

  acceptingNewMembers Boolean             @default(false)
  verificationRequest Boolean             @default(false)
  verificationStatus  VerificationStatus?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ✅ NOVOS CAMPOS PARA PERFIL
  bio         String?  // Bio do grupo
  logoUrl     String?  // URL do logo no Cloudinary
  bannerUrl   String?  // URL do banner no Cloudinary
  logoId      String?  // Public ID do Cloudinary
  bannerId    String?  // Public ID do Cloudinary

  // relationsships
  joinRequests GroupJoinRequest[]
  posts        Post[]
  memberships  GroupMembership[]
  followers    GroupFollow[]
}
```

### ✅ TODO: Criar modelo UserFollow para seguir usuários

```prisma
// ✅ NOVO MODELO: Permite que usuários sigam outros usuários
model UserFollow {
  id String @id @default(uuid())

  followerId String
  follower User @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)

  followingId String
  following User @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

### ✅ TODO: Executar migration

```bash
cd apps/api
pnpm prisma migrate dev --name add_profile_fields_and_user_follow
pnpm prisma generate
```

---

## 📁 2. CRIAR MÓDULO DE PERFIL

### ✅ TODO: Criar estrutura de diretórios

```bash
mkdir -p apps/api/src/modules/profile
cd apps/api/src/modules/profile
touch profile.controller.ts profile.service.ts profile.repository.ts profile.routes.ts
```

---

## 🔧 3. IMPLEMENTAR PROFILE REPOSITORY

### ✅ TODO: Criar profile.repository.ts

**Arquivo:** `/apps/api/src/modules/profile/profile.repository.ts`

```typescript
import prisma from "../../database/prismaClient";

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
```

---

## 🎯 4. IMPLEMENTAR PROFILE SERVICE

### ✅ TODO: Criar profile.service.ts

**Arquivo:** `/apps/api/src/modules/profile/profile.service.ts`

```typescript
import profileRepository from "./profile.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

class ProfileService {
  /**
   * Busca perfil completo de um usuário
   */
  async getUserProfile(userName: string, authUserId?: string) {
    const profile = await profileRepository.findUserProfileByUserName(userName, authUserId);
    
    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // Buscar dados das abas (sem paginação por enquanto, máximo 50 itens cada)
    const [matchesData, followedGroupsData, memberGroupsData] = await Promise.all([
      profileRepository.findUserMatches(profile.id, 50, 0),
      profileRepository.findUserFollowedGroups(profile.id, 50, 0),
      profileRepository.findUserMemberGroups(profile.id, 50, 0),
    ]);

    return {
      profile: {
        id: profile.id,
        userName: profile.userName,
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        profilePicture: profile.profileImageUrl,
        bannerImage: profile.bannerImageUrl,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        groupsCount: profile.groupsCount,
        matchesCount: profile.matchesCount,
        isFollowing: profile.isFollowing,
        isOwner: profile.isOwner,
      },
      tabs: {
        matches: matchesData.matches,
        followedGroups: followedGroupsData.groups,
        memberGroups: memberGroupsData.groups,
      },
    };
  }

  /**
   * Busca perfil completo de um grupo
   */
  async getGroupProfile(groupName: string, authUserId?: string) {
    const profile = await profileRepository.findGroupProfileByName(groupName, authUserId);
    
    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado");
    }

    // Buscar dados das abas (sem paginação por enquanto, máximo 50 itens cada)
    const [membersData, postsData] = await Promise.all([
      profileRepository.findGroupMembers(profile.id, 50, 0),
      profileRepository.findGroupPosts(profile.id, 50, 0),
    ]);

    return {
      profile,
      tabs: {
        members: membersData.members,
        posts: postsData.posts,
      },
    };
  }
}

export default new ProfileService();
```

---

## 🎮 5. IMPLEMENTAR PROFILE CONTROLLER

### ✅ TODO: Criar profile.controller.ts

**Arquivo:** `/apps/api/src/modules/profile/profile.controller.ts`

```typescript
import { Request, Response } from "express";
import profileService from "./profile.service";
import httpStatus from "http-status";

class ProfileController {
  /**
   * GET /api/v1/profile/user/:userName
   * Busca perfil completo de um usuário
   */
  async getUserProfile(req: Request, res: Response) {
    const { userName } = req.params;
    const authUserId = (req as any).user?.id; // Se autenticado

    const profileData = await profileService.getUserProfile(userName, authUserId);

    return res.status(httpStatus.OK).json(profileData);
  }

  /**
   * GET /api/v1/profile/group/:groupName
   * Busca perfil completo de um grupo
   */
  async getGroupProfile(req: Request, res: Response) {
    const { groupName } = req.params;
    const authUserId = (req as any).user?.id; // Se autenticado

    const profileData = await profileService.getGroupProfile(groupName, authUserId);

    return res.status(httpStatus.OK).json(profileData);
  }
}

export default new ProfileController();
```

---

## 🛣️ 6. CRIAR ROTAS DE PERFIL

### ✅ TODO: Criar profile.routes.ts

**Arquivo:** `/apps/api/src/modules/profile/profile.routes.ts`

```typescript
import { Router } from "express";
import profileController from "./profile.controller";
import catchAsync from "../../utils/catchAsync";
import { optionalAuth } from "../../middlewares/auth";

const router = Router();

/**
 * GET /api/v1/profile/user/:userName
 * Busca perfil completo de um usuário
 * Auth opcional - se autenticado, mostra se está seguindo
 */
router.get(
  "/user/:userName",
  optionalAuth, // Middleware que permite acesso com ou sem token
  catchAsync(profileController.getUserProfile)
);

/**
 * GET /api/v1/profile/group/:groupName
 * Busca perfil completo de um grupo
 * Auth opcional - se autenticado, mostra se está seguindo/é membro
 */
router.get(
  "/group/:groupName",
  optionalAuth,
  catchAsync(profileController.getGroupProfile)
);

export default router;
```

---

## 🔐 7. CRIAR MIDDLEWARE DE AUTH OPCIONAL

### ✅ TODO: Adicionar optionalAuth ao auth middleware

**Arquivo:** `/apps/api/src/middlewares/auth.ts`

```typescript
// Adicionar ao arquivo existente:

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

/**
 * Middleware de autenticação opcional
 * Não bloqueia se o token não existir, apenas o adiciona se existir
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        (req as any).user = { id: decoded.id, userName: decoded.userName };
      } catch (error) {
        // Token inválido, mas não bloqueia a requisição
        console.log("Token inválido em optionalAuth, continuando sem autenticação");
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

---

## 🔗 8. REGISTRAR ROTAS NO APP

### ✅ TODO: Adicionar rotas de perfil ao app.ts

**Arquivo:** `/apps/api/src/app.ts`

```typescript
// Adicionar import
import profileRoutes from "./modules/profile/profile.routes";

// Adicionar rota (junto com as outras rotas)
app.use("/api/v1/profile", profileRoutes);
```

---

## 👥 9. IMPLEMENTAR FOLLOW/UNFOLLOW DE USUÁRIOS

### ✅ TODO: Criar userFollow.repository.ts

**Arquivo:** `/apps/api/src/modules/follow/userFollow.repository.ts`

```typescript
import prisma from "../../database/prismaClient";

class UserFollowRepository {
  async createFollow(followerId: string, followingId: string) {
    return await prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async deleteFollow(followerId: string, followingId: string) {
    return await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findFollow(followerId: string, followingId: string) {
    return await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }
}

export default new UserFollowRepository();
```

### ✅ TODO: Atualizar follow.service.ts

**Arquivo:** `/apps/api/src/modules/follow/follow.service.ts`

```typescript
// Adicionar ao serviço existente:

import userFollowRepository from "./userFollow.repository";
import userRepository from "../user/user.repository";

// ... código existente ...

/**
 * Seguir um usuário
 */
async followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Você não pode seguir a si mesmo");
  }

  const userToFollow = await userRepository.findById(followingId);
  if (!userToFollow) {
    throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
  }

  const existingFollow = await userFollowRepository.findFollow(followerId, followingId);
  if (existingFollow) {
    throw new ApiError(httpStatus.CONFLICT, "Você já está seguindo este usuário");
  }

  await userFollowRepository.createFollow(followerId, followingId);
}

/**
 * Deixar de seguir um usuário
 */
async unfollowUser(followerId: string, followingId: string) {
  const existingFollow = await userFollowRepository.findFollow(followerId, followingId);
  if (!existingFollow) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Você não está seguindo este usuário");
  }

  await userFollowRepository.deleteFollow(followerId, followingId);
}
```

### ✅ TODO: Atualizar follow.controller.ts

**Arquivo:** `/apps/api/src/modules/follow/follow.controller.ts`

```typescript
// Adicionar ao controller existente:

/**
 * POST /api/v1/users/:userId/follow
 * Seguir um usuário
 */
async followUser(req: Request, res: Response) {
  const { userId } = req.params;
  const followerId = (req as any).user!.id;

  await followService.followUser(followerId, userId);

  return res.status(httpStatus.OK).json({
    message: "Usuário seguido com sucesso",
  });
}

/**
 * DELETE /api/v1/users/:userId/unfollow
 * Deixar de seguir um usuário
 */
async unfollowUser(req: Request, res: Response) {
  const { userId } = req.params;
  const followerId = (req as any).user!.id;

  await followService.unfollowUser(followerId, userId);

  return res.status(httpStatus.OK).json({
    message: "Você deixou de seguir este usuário",
  });
}
```

### ✅ TODO: Adicionar rotas de follow de usuário

**Arquivo:** `/apps/api/src/modules/user/user.routes.ts`

```typescript
// Adicionar imports
import followController from "../follow/follow.controller";
import { auth } from "../../middlewares/auth";

// Adicionar rotas no final do arquivo:

/**
 * POST /api/v1/users/:userId/follow
 * Seguir um usuário
 */
router.post(
  "/:userId/follow",
  auth,
  catchAsync(followController.followUser)
);

/**
 * DELETE /api/v1/users/:userId/unfollow
 * Deixar de seguir um usuário
 */
router.delete(
  "/:userId/unfollow",
  auth,
  catchAsync(followController.unfollowUser)
);
```

---

## 📖 10. DOCUMENTAÇÃO DOS ENDPOINTS

### GET `/api/v1/profile/user/:userName`

Busca perfil completo de um usuário com todas as abas.

**Headers (opcional):**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "userName": "joaosilva",
    "name": "João Silva",
    "email": "joao@email.com",
    "bio": "Desenvolvedor apaixonado por futebol",
    "profilePicture": "https://res.cloudinary.com/...",
    "bannerImage": "https://res.cloudinary.com/...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "followersCount": 150,
    "followingCount": 80,
    "groupsCount": 5,
    "matchesCount": 23,
    "isFollowing": false,
    "isOwner": false
  },
  "tabs": {
    "matches": [
      {
        "id": "uuid",
        "title": "Pelada de Sexta",
        "description": "Futebol no campo da UnB",
        "matchDate": "2025-12-15T18:00:00.000Z",
        "location": "UnB - FGA",
        // ... outros campos de Match
      }
    ],
    "followedGroups": [
      {
        "id": "uuid",
        "name": "Futsal UnB",
        "description": "Grupo de futsal da universidade",
        "type": "ATHLETIC",
        "sport": "Futsal"
      }
    ],
    "memberGroups": [
      {
        "id": "uuid",
        "name": "Basket FGA",
        "description": "Basquete na FGA",
        "type": "AMATEUR",
        "sport": "Basquete"
      }
    ]
  }
}
```

### GET `/api/v1/profile/group/:groupName`

Busca perfil completo de um grupo com todas as abas.

**Headers (opcional):**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "Futsal UnB",
    "description": "Grupo oficial de futsal da UnB",
    "bio": "Praticamos futsal todas as terças e quintas",
    "logoUrl": "https://res.cloudinary.com/...",
    "bannerUrl": "https://res.cloudinary.com/...",
    "type": "ATHLETIC",
    "sport": "Futsal",
    "leaderId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "membersCount": 45,
    "postsCount": 120,
    "followersCount": 200,
    "isFollowing": false,
    "isMember": false,
    "isLeader": false
  },
  "tabs": {
    "members": [
      {
        "id": "uuid",
        "userName": "joaosilva",
        "name": "João Silva",
        "email": "joao@email.com",
        "bio": "Desenvolvedor e atleta",
        "profilePicture": "https://res.cloudinary.com/...",
        "bannerImage": null
      }
    ],
    "posts": [
      {
        "id": "uuid",
        "title": "Treino de Sábado",
        "content": "Treino confirmado para sábado às 14h",
        "type": "EVENT",
        "eventDate": "2025-12-14T14:00:00.000Z",
        "location": "Ginásio da UnB",
        "likesCount": 15,
        "commentsCount": 3,
        "attendancesCount": 22
      }
    ]
  }
}
```

### POST `/api/v1/users/:userId/follow`

Seguir um usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Usuário seguido com sucesso"
}
```

### DELETE `/api/v1/users/:userId/unfollow`

Deixar de seguir um usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Você deixou de seguir este usuário"
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Schema e Database
- [ ] Adicionar campos `bio`, `profileImageUrl`, `bannerImageUrl`, etc. ao modelo `User`
- [ ] Adicionar campos `bio`, `logoUrl`, `bannerUrl` ao modelo `Group`
- [ ] Criar modelo `UserFollow`
- [ ] Executar migration
- [ ] Executar `prisma generate`

### Módulo Profile
- [ ] Criar estrutura de diretórios
- [ ] Implementar `profile.repository.ts`
- [ ] Implementar `profile.service.ts`
- [ ] Implementar `profile.controller.ts`
- [ ] Implementar `profile.routes.ts`

### Middleware
- [ ] Adicionar `optionalAuth` ao auth middleware

### Follow de Usuários
- [ ] Criar `userFollow.repository.ts`
- [ ] Atualizar `follow.service.ts`
- [ ] Atualizar `follow.controller.ts`
- [ ] Adicionar rotas em `user.routes.ts`

### Integração
- [ ] Registrar rotas de perfil no `app.ts`
- [ ] Testar todos os endpoints
- [ ] Documentar na API docs

---

## 🧪 11. TESTES

### ✅ TODO: Criar testes para os endpoints

**Arquivo:** `/apps/api/src/__tests__/profile/profile.test.ts`

```typescript
import request from "supertest";
import app from "../../app";

describe("Profile Endpoints", () => {
  let authToken: string;

  beforeAll(async () => {
    // TODO: Setup de autenticação para testes
  });

  describe("GET /api/v1/profile/user/:userName", () => {
    it("deve retornar perfil de usuário com sucesso", async () => {
      const response = await request(app)
        .get("/api/v1/profile/user/testuser")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("profile");
      expect(response.body).toHaveProperty("tabs");
      expect(response.body.tabs).toHaveProperty("matches");
      expect(response.body.tabs).toHaveProperty("followedGroups");
      expect(response.body.tabs).toHaveProperty("memberGroups");
    });

    it("deve retornar 404 para usuário inexistente", async () => {
      const response = await request(app)
        .get("/api/v1/profile/user/inexistente");

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/profile/group/:groupName", () => {
    it("deve retornar perfil de grupo com sucesso", async () => {
      const response = await request(app)
        .get("/api/v1/profile/group/testgroup")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("profile");
      expect(response.body).toHaveProperty("tabs");
      expect(response.body.tabs).toHaveProperty("members");
      expect(response.body.tabs).toHaveProperty("posts");
    });
  });

  describe("POST /api/v1/users/:userId/follow", () => {
    it("deve seguir usuário com sucesso", async () => {
      const response = await request(app)
        .post("/api/v1/users/user-id-to-follow/follow")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Usuário seguido com sucesso");
    });

    it("deve retornar erro ao tentar seguir novamente", async () => {
      const response = await request(app)
        .post("/api/v1/users/user-id-to-follow/follow")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(409);
    });
  });
});
```

---

## 🚀 PRÓXIMOS PASSOS

Após implementar todos os itens acima:

1. **Implementar Upload de Imagens** - Seguir a documentação em `IMAGE-UPLOAD-IMPLEMENTATION.md`
2. **Adicionar Paginação** - Implementar paginação nas abas do perfil
3. **Cache** - Adicionar cache Redis para perfis
4. **Otimização** - Criar índices no banco de dados
5. **Analytics** - Monitorar acessos aos perfis

---

## 📝 OBSERVAÇÕES

- Os endpoints de perfil funcionam com ou sem autenticação
- Quando autenticado, mostram informações adicionais (`isFollowing`, `isMember`, etc.)
- As contagens são calculadas automaticamente com `_count` do Prisma
- Os dados das abas são limitados a 50 itens inicialmente (implementar paginação depois)
