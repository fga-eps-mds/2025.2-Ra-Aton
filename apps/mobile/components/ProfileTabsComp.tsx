// components/ProfileTabsComp.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Imatches } from "@/libs/interfaces/Imatches";
import { IGroup } from "@/libs/interfaces/Igroup";
import { IPost } from "@/libs/interfaces/Ipost";
import { IUserProfile } from "@/libs/interfaces/Iprofile";
import { MatchesCard } from "./MatchesCardComp";
import PostCardComp from "./PostCardComp";

type UserTabType = "matches" | "followedGroups" | "memberGroups";
type GroupTabType = "members" | "posts";

interface UserProfileTabsProps {
  type: "user";
  matches: Imatches[];
  followedGroups: IGroup[];
  memberGroups: IGroup[];
  isDarkMode: boolean;
}

interface GroupProfileTabsProps {
  type: "group";
  members: IUserProfile[];
  posts: IPost[];
  isDarkMode: boolean;
  onPressComment?: (postId: string) => void;
  onPressOptions?: (postId: string) => void;
  isAdmin?: boolean;
  onRemoveMember?: (membershipId: string) => void;
}

type ProfileTabsProps = UserProfileTabsProps | GroupProfileTabsProps;

export const ProfileTabsComp: React.FC<ProfileTabsProps> = (props) => {
  const { type, isDarkMode } = props;
  const theme = isDarkMode ? Colors.dark : Colors.light;

  if (type === "user") {
    const [activeTab, setActiveTab] = useState<UserTabType>("matches");
    const { matches, followedGroups, memberGroups } = props;

    const tabs = [
      { key: "matches" as UserTabType, label: "Partidas", count: matches.length },
      { key: "followedGroups" as UserTabType, label: "Grupos Seguidos", count: followedGroups.length },
      { key: "memberGroups" as UserTabType, label: "Grupos Participando", count: memberGroups.length },
    ];

    const renderContent = () => {
      switch (activeTab) {
        case "matches":
          return (
            <FlatList
              data={matches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MatchesCard
                  match={item}
                  onPressInfos={() => {}}
                  onPressJoinMatch={() => {}}
                  onReloadFeed={() => {}}
                  isUserSubscriped={false}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.gray }]}>
                  Nenhuma partida encontrada
                </Text>
              }
            />
          );
        case "followedGroups":
        case "memberGroups":
          const groups = activeTab === "followedGroups" ? followedGroups : memberGroups;
          return (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.groupCard, { backgroundColor: theme.input }]}>
                  <Text style={[styles.groupName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.groupDescription, { color: theme.gray }]}>
                    {item.description}
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.gray }]}>
                  Nenhum grupo encontrado
                </Text>
              }
            />
          );
      }
    };

    return (
      <View style={styles.container}>
        <View style={[styles.tabBar, { borderBottomColor: theme.gray }]}>
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
              onPress={() => setActiveTab(tab.key)}
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
        {renderContent()}
      </View>
    );
  } else {
    const [activeTab, setActiveTab] = useState<GroupTabType>("posts");
    const { members, posts, onPressComment, onPressOptions } = props;

    const tabs = [
      { key: "posts" as GroupTabType, label: "Postagens", count: posts.length },
      { key: "members" as GroupTabType, label: "Membros", count: members.length },
    ];

    const renderContent = () => {
      switch (activeTab) {
        case "posts":
          return (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PostCardComp
                  post={item}
                  onPressComment={onPressComment || (() => {})}
                  onPressOptions={onPressOptions || (() => {})}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.gray }]}>
                  Nenhuma postagem encontrada
                </Text>
              }
            />
          );
        case "members":
          return (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.memberCard, { backgroundColor: theme.input }]}>
                  <Text style={[styles.memberName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.memberUsername, { color: theme.gray }]}>
                    @{item.userName}
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.gray }]}>
                  Nenhum membro encontrado
                </Text>
              }
            />
          );
      }
    };

    return (
      <View style={styles.container}>
        <View style={[styles.tabBar, { borderBottomColor: theme.gray }]}>
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
              onPress={() => setActiveTab(tab.key)}
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
        {renderContent()}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 16,
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
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 32,
  },
  groupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  groupDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  memberUsername: {
    fontSize: 14,
    marginTop: 4,
  },
});
