// components/PostCardComp.tsx
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import ProfileThumbnailComp from "./ProfileThumbnailComp";
import SpacerComp from "./SpacerComp";
import LikeButtonComp from "./LikeButtonComp";
import CommentButtonComp from "./CommentButtonComp";
import ImGoingButtonComp from "./ImGoingButtonComp";
import OptionsButtonComp from "./OptionsButtonComp";
import { IPost } from "@/libs/interfaces/Ipost";
import { getComments } from "@/libs/auth/handleComments";



interface PostCardProps {
  post: IPost;
  onPressComment: (postId: string) => void;
  onPressOptions: (postId: string) => void;
}

const PostCardComp: React.FC<PostCardProps> = ({ post, onPressComment, onPressOptions }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleLike = async (isLiked: boolean) => {
    console.log(`API: Curtida ${isLiked} no post ${post.id}`);
  };
  const handleGoing = async (isGoing: boolean) => {
    console.log(`API: Presença ${isGoing} no post ${post.id}`);
  };

  const isEvent = post.type === "EVENT";

  return (
    <View style={[styles.container, { backgroundColor: theme.input }]}>
      <View style={styles.header}>
        <ProfileThumbnailComp size={50} />
        <SpacerComp width={12} />
        <View>
          <Text style={[styles.authorName, { color: theme.text }]}>{post.author ?? "Autor"}</Text>
          <Text style={[styles.authorId, { color: theme.text }]}>{post.authorId ?? ""}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <OptionsButtonComp onPress={() => onPressOptions(String(post.id))} />
      </View>

      <SpacerComp height={10} />

      {post.title ? (
        <>
          <Text style={[styles.title, { color: theme.text }]}>{post.title}</Text>
          <SpacerComp height={16} />
        </>
      ) : null}

      <Text style={[styles.contentText, { color: theme.text }]}>{post.content ?? ""}</Text>

      <SpacerComp height={12} />

      <View style={styles.actionsBar}>
        <LikeButtonComp onLike={handleLike} initialLiked={post.userLiked ?? false} />
        <Text style={[styles.counter, { color: theme.text }]}> {post.likesCount ?? 0}</Text>
        <SpacerComp width={12} />
        <CommentButtonComp onPress={() => onPressComment(String(post.id))} />
        <Text style={[styles.counter, { color: theme.text }]}> {post.commentsCount ?? 0}</Text>
        <View style={{ flex: 1 }} />
        {isEvent ? (
          <ImGoingButtonComp onToggleGoing={handleGoing} initialGoing={post.userGoing ?? false} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  header: { flexDirection: "row", alignItems: "center" },
  authorName: { fontSize: 16, fontWeight: "600" },
  authorId: { fontSize: 11, opacity: 0.7 },
  title: { fontSize: 18, fontWeight: "700" },
  contentText: { fontSize: 15, lineHeight: 22 },
  eventInfo: { fontSize: 12, opacity: 0.8 },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray,
  },
  counter: { fontSize: 12, opacity: 0.8 },
});

export default PostCardComp;
