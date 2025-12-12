import { ApiError } from "../../utils/ApiError";
import profileRepository from "./profile.repository";
import cloudinary from "../../config/cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProfileService {
    // Busca o perfil de um usuário pelo userName
    async fetchUserProfile(userName: string, authUserId?: string) {
        const profile = await profileRepository.findUserProfileByUserName(userName, authUserId);
        if (!profile) {
            throw new ApiError(404, "Perfil de usuário não encontrado");
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

    // Busca o perfil de um grupo pelo groupName
    async fetchGroupProfile(groupName: string, authUserId?: string) {
        const profile = await profileRepository.findGroupProfileByName(groupName, authUserId);
        if (!profile) {
            throw new ApiError(404, "Perfil de grupo não encontrado");
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

    // Atualiza imagens do grupo (logo e banner)
    async updateGroupImages(
        groupId: string,
        authUserId: string,
        logoFile?: Express.Multer.File,
        bannerFile?: Express.Multer.File
    ) {
        // Verificar se o grupo existe
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                memberships: {
                    where: {
                        userId: authUserId,
                        OR: [
                            { isCreator: true },
                            { role: "ADMIN" }
                        ]
                    }
                }
            }
        });

        if (!group) {
            throw new ApiError(404, "Grupo não encontrado");
        }

        // Verificar se o usuário é admin ou criador
        if (group.memberships.length === 0) {
            throw new ApiError(403, "Você não tem permissão para editar este grupo");
        }

        const updateData: any = {};

        // Upload do logo
        if (logoFile) {
            // Deletar logo antigo se existir
            if (group.logoId) {
                try {
                    await cloudinary.uploader.destroy(group.logoId);
                } catch (error) {
                    console.error("Erro ao deletar logo antigo:", error);
                }
            }

            // Upload do novo logo
            const logoResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "groups/logos",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(logoFile.buffer);
            });

            updateData.logoUrl = logoResult.secure_url;
            updateData.logoId = logoResult.public_id;
        }

        // Upload do banner
        if (bannerFile) {
            // Deletar banner antigo se existir
            if (group.bannerId) {
                try {
                    await cloudinary.uploader.destroy(group.bannerId);
                } catch (error) {
                    console.error("Erro ao deletar banner antigo:", error);
                }
            }

            // Upload do novo banner
            const bannerResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "groups/banners",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(bannerFile.buffer);
            });

            updateData.bannerUrl = bannerResult.secure_url;
            updateData.bannerId = bannerResult.public_id;
        }

        // Atualizar no banco de dados
        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: updateData,
            select: {
                id: true,
                name: true,
                logoUrl: true,
                bannerUrl: true,
            }
        });

        return {
            message: "Imagens atualizadas com sucesso",
            group: updatedGroup
        };
    }

    // Atualiza imagens do usuário (perfil e banner)
    async updateUserImages(
        userId: string,
        authUserId: string,
        profileFile?: Express.Multer.File,
        bannerFile?: Express.Multer.File
    ) {
        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "Usuário não encontrado");
        }

        // Verificar se é o próprio usuário
        if (userId !== authUserId) {
            throw new ApiError(403, "Você só pode editar seu próprio perfil");
        }

        const updateData: any = {};

        // Upload da imagem de perfil
        if (profileFile) {
            // Deletar imagem antiga se existir
            if (user.profileImageId) {
                try {
                    await cloudinary.uploader.destroy(user.profileImageId);
                } catch (error) {
                    console.error("Erro ao deletar imagem de perfil antiga:", error);
                }
            }

            // Upload da nova imagem de perfil
            const profileResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "users/profiles",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(profileFile.buffer);
            });

            updateData.profileImageUrl = profileResult.secure_url;
            updateData.profileImageId = profileResult.public_id;
        }

        // Upload do banner
        if (bannerFile) {
            // Deletar banner antigo se existir
            if (user.bannerImageId) {
                try {
                    await cloudinary.uploader.destroy(user.bannerImageId);
                } catch (error) {
                    console.error("Erro ao deletar banner antigo:", error);
                }
            }

            // Upload do novo banner
            const bannerResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "users/banners",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(bannerFile.buffer);
            });

            updateData.bannerImageUrl = bannerResult.secure_url;
            updateData.bannerImageId = bannerResult.public_id;
        }

        // Atualizar no banco de dados
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                userName: true,
                name: true,
                profileImageUrl: true,
                bannerImageUrl: true,
            }
        });

        return {
            message: "Imagens atualizadas com sucesso",
            user: updatedUser
        };
    }
}

export default new ProfileService();