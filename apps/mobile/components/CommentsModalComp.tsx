import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import SpacerComp from "./SpacerComp";
import PrimaryButton from "./PrimaryButton";
import { Fonts } from "@/constants/Fonts";

interface Comment {
  id: string;
  author: string;
  text: string;
  // TODO: Adicionar avatarUrl, timestamp
}

interface CommentsModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string | null;
}

// Dados Falsos (Mock)
const MOCK_COMMENTS: Comment[] = [
  { id: "1", author: "Usuário A", text: "Que legal!" },
  { id: "2", author: "Usuário B", text: "Vamos participar!" },
];

const CommentsModalComp: React.FC<CommentsModalProps> = ({
  isVisible,
  onClose,
  postId,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [newComment, setNewComment] = useState("");

  // TODO: Criar requisição na pasta libs/comments (CA5)
  // Substituir MOCK_COMMENTS por:
  // const { data: comments, isLoading, error } = useComments(postId);
  const isLoading = false;
  const comments = MOCK_COMMENTS;

  // TODO: Criar requisição (mutation) para postar comentário (CA5)
  const handlePostComment = () => {
    if (!newComment.trim()) return;
    console.log(`Postando comentário no Post ${postId}: ${newComment}`);
    // await postCommentMutation(postId, newComment);
    setNewComment("");
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      {/* TODO: Adicionar ProfileThumbnailComp aqui */}
      <View style={styles.commentTextContainer}>
        <Text style={[styles.commentAuthor, { color: theme.text }]}>
          {item.author}
        </Text>
        <Text style={[styles.commentText, { color: theme.text }]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide" // Sobe da base
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
          {/* Previne que o clique no conteúdo feche o modal */}
          <Pressable
            style={[styles.modalContainer, { backgroundColor: theme.input }]}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              Comentários
            </Text>

            {/* Seção de Leitura */}
            {isLoading ? (
              <ActivityIndicator size="large" color={theme.orange} />
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                style={styles.list}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.gray }]}>
                    Seja o primeiro a comentar!
                  </Text>
                }
              />
            )}

            <SpacerComp height={10} />

            {/* Seção de Escrita */}
            <View style={styles.writeContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.gray,
                    fontFamily: Fonts.mainFont.dongleRegular,
                  },
                ]}
                placeholder="Escreva um comentário..."
                placeholderTextColor={theme.gray}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <SpacerComp width={20} />
              <PrimaryButton
                onPress={handlePostComment}
                style={{
                  width: 100,
                  height: 50,
                  paddingHorizontal: 5,
                  flex: 1,
                }}
              >
                Enviar
              </PrimaryButton>
            </View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  safeArea: {
    width: "100%",
    maxHeight: "85%", // O modal não ocupa a tela inteira
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  list: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray, // Cor sutil
  },
  commentTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 16,
  },
  commentText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 18,
  },
  writeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 24, // Ajuste para Dongle
    maxHeight: 100, // Limite para multiline
  },
});

export default CommentsModalComp;
