import { ApiError } from "../../utils/ApiError";
import profileRepository from "./profile.repository";

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
}

export default new ProfileService();