import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Imatches } from "@/libs/interfaces/Imatches";
import { IGroup } from "@/libs/interfaces/Igroup";
import { IPost } from "@/libs/interfaces/Ipost";
import { IUserProfile } from "@/libs/interfaces/Iprofile";
import { MatchesCard } from "./MatchesCardComp";
import PostCardComp from "./PostCardComp";
import MemberCard from "./MemberCardComp";

type UserTabType = "matches" | "followedGroups" | "memberGroups";
type GroupTabType = "posts" | "members";

interface BaseProfileTabsProps {
  isDarkMode: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  onReload?: () => void;
  isLoading?: boolean;
}

interface UserProfileTabsProps extends BaseProfileTabsProps {
  type: "user";
  matches: Imatches[];
  followedGroups: IGroup[];
  memberGroups: IGroup[];
  currentUserId?: string;
  onPressMatchInfos?: (match: Imatches) => void;
  onPressJoinMatch?: (match: Imatches) => void;
  onPressGroup?: (groupName: string) => void;
}

interface GroupProfileTabsProps extends BaseProfileTabsProps {
  type: "group";
  members: IUserProfile[];
  posts: IPost[];
  onPressComment?: (postId: string) => void;
  onPressOptions?: (postId: string) => void;
  onPressMember?: (userName: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onRemoveMember?: (membershipId: string) => void;
}

type ProfileTabsProps = UserProfileTabsProps | GroupProfileTabsProps;

export const ProfileTabsComp: React.FC<ProfileTabsProps> = (props) => {
  const { type, isDarkMode, ListHeaderComponent, onReload, isLoading } = props;
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [activeTabUser, setActiveTabUser] = useState<UserTabType>("matches");
  const [activeTabGroup, setActiveTabGroup] = useState<GroupTabType>("posts");

  const activeTab = type === "user" ? activeTabUser : activeTabGroup;
  const setActiveTab = type === "user" ? setActiveTabUser : setActiveTabGroup;

  const checkIsSubscribed = (match: Imatches, userId?: string) => {
    if (!userId) return false;
    const inTeamA = match.teamA?.players?.some((p) => p.id === userId);
    const inTeamB = match.teamB?.players?.some((p) => p.id === userId);
    return !!(inTeamA || inTeamB);
  };

  const renderItemContent = (tab: string, item: any) => {
    if (type === "user") {
      const userProps = props as UserProfileTabsProps;
      switch (tab) {
        case "matches":
          return (
            <MatchesCard
              match={item}
              onPressInfos={() => userProps.onPressMatchInfos?.(item)}
              onPressJoinMatch={() => userProps.onPressJoinMatch?.(item)}
              onReloadFeed={async () => {
                if (onReload) onReload();
              }}
              isUserSubscriped={checkIsSubscribed(item, userProps.currentUserId)}
            />
          );
        case "followedGroups":
        case "memberGroups":
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.input }]}
              onPress={() => userProps.onPressGroup?.(item.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.gray }]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          );
      }
    } else {
      const groupProps = props as GroupProfileTabsProps;
      switch (tab) {
        case "posts":
          return (
            <PostCardComp
              post={item}
              onPressComment={groupProps.onPressComment || (() => {})}
              onPressOptions={groupProps.onPressOptions || (() => {})}
            />
          );
        case "members":
          return (
            <MemberCard
              member={{
                id: item.id,
                userId: item.id,
                groupId: "",
                role: item.isOwner ? 'ADMIN' : 'MEMBER',
                joinedAt: "",
                user: {
                  id: item.id,
                  name: item.name,
                  email: item.email || "",
                  avatarUrl: item.profilePicture,
                  username: item.userName
                }
              }}
              isAdminView={!!groupProps.isAdmin}
              onRemove={(id) => groupProps.onRemoveMember && groupProps.onRemoveMember(id)}
            />
          );
      }
    }
    return null;
  };

  let tabs: { key: string; label: string; count: number }[] = [];
  let dataToRender: any[] = [];

  if (type === "user") {
    const p = props as UserProfileTabsProps;
    tabs = [
      { key: "matches", label: "Partidas", count: p.matches.length },
      { key: "followedGroups", label: "Seguindo", count: p.followedGroups.length },
      { key: "memberGroups", label: "Membro", count: p.memberGroups.length },
    ];
    
    if (activeTab === "matches") dataToRender = p.matches;
    else if (activeTab === "followedGroups") dataToRender = p.followedGroups;
    else dataToRender = p.memberGroups;
  } else {
    const p = props as GroupProfileTabsProps;
    tabs = [
      { key: "posts", label: "Posts", count: p.posts.length },
      { key: "members", label: "Membros", count: p.members.length },
    ];
    
    if (activeTab === "posts") dataToRender = p.posts;
    else dataToRender = p.members;
  }

  const RenderHeader = () => (
    <View>
      {ListHeaderComponent}
      <View
        style={[
          styles.tabBar,
          { borderBottomColor: theme.gray, backgroundColor: theme.background },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomColor: theme.orange,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? theme.text : theme.gray,
                  fontWeight: activeTab === tab.key ? "bold" : "normal",
                },
              ]}
            >
              {tab.label}
            </Text>
            <Text style={[styles.tabCount, { color: theme.gray }]}>
              {tab.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      data={dataToRender}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => renderItemContent(activeTab as string, item)}
      ListHeaderComponent={<RenderHeader />}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.gray }]}>
          Nada encontrado nesta aba.
        </Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={isLoading || false}
          onRefresh={onReload}
          tintColor={theme.orange}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
  },
  tabCount: {
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 20,
    paddingHorizontal: 10, // Apenas o padding lateral leve
    gap: 15,               // Espaçamento entre os itens
    paddingBottom: 50,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 32,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});