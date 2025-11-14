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
    <View style={[styles.card, { backgroundColor: theme.input }]}>
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
  )
}

// ... (Estilos permanecem os mesmos)
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 4,
  },
  eventBox: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  socialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eventButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  eventButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
})