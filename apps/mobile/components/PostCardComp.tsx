import React from "react";
import { View, Text, StyleSheet, Platform, Image } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import ProfileThumbnailComp from "./ProfileThumbnailComp";
import SpacerComp from "./SpacerComp";
import LikeButtonComp from "./LikeButtonComp";
import CommentButtonComp from "./CommentButtonComp";
import ImGoingButtonComp from "./ImGoingButtonComp";
import OptionsButtonComp from "./OptionsButtonComp";
import { IPost } from "@/libs/interfaces/Ipost"; 

interface PostCardProps {
  post: IPost; 
  onPressComment: (postId: string) => void;
  onPressOptions: (postId: string) => void;
}

const PostCardComp: React.FC<PostCardProps> = ({
  post,
  onPressComment,
  onPressOptions,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.input }]}>
      {/* Header do Post */}
      <View style={styles.header}>
        <ProfileThumbnailComp size={50} imageUrl={undefined} />
        <SpacerComp width={20} />
        <View>
          <Text style={[styles.authorName, { color: theme.text }]}> 
            {post.username}
          </Text>
          <Text style={[styles.authorId, { color: theme.text }]}>
            {post.nickname}
          </Text>
        </View>                        
        <View style={{ flex: 1 }} />
        <OptionsButtonComp onPress={() => onPressOptions(post.id)} />
      </View>

      <SpacerComp height={10} />

      {/* Conteúdo do Post */}
      <Text style={[styles.contentText, { color: theme.text }]}>
        {post.content ?? post.title ?? ""}
      </Text>

      {/* NOVO: Seção da Imagem (Renderização Condicional) */}
      <SpacerComp height={15} />

      {/* Barra de Ações */}
      <View style={styles.actionsBar}>
        <LikeButtonComp onLike={handleLike} initialLiked={post.userLiked ?? false} />
        <SpacerComp width={15} />
        <CommentButtonComp onPress={() => onPressComment(post.id)} />
        <SpacerComp width={100} />
        {/* // TODO: Mostrar "Eu Vou" apenas se for um evento (ex: post.type === 'event') */}
        <ImGoingButtonComp
          onToggleGoing={handleGoing}
          initialGoing={post.userGoing ?? false}
        >
        </ImGoingButtonComp>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  authorId: {
    fontSize: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 22,
  },
  // NOVO: Estilo para a imagem
  postImage: {
    width: "100%",
    aspectRatio: 16 / 9, // Proporção comum
    borderRadius: 10,
    backgroundColor: Colors.light.gray, // Placeholder
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray,
  },
});

export default PostCardComp;
