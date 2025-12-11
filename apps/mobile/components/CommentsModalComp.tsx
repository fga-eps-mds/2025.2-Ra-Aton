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
  TouchableOpacity,
  // Alert removido
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import SpacerComp from "./SpacerComp";
import PrimaryButton from "./PrimaryButton";
import { Fonts } from "@/constants/Fonts";
import { Icomment } from "@/libs/interfaces/Icomments";
import { Ionicons } from "@expo/vector-icons";

interface CommentsModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId?: string;
  comments?: Icomment[];
  isLoading?: boolean;
  onSendComment?: (content: string) => void;
  isAuthor?: boolean;
  onDeleteComment?: (commentId: string) => void;
}

const CommentsModalComp: React.FC<CommentsModalProps> = ({
  isVisible,
  onClose,
  comments,
  isLoading = false,
  onSendComment,
  isAuthor = false,
  onDeleteComment
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [newComment, setNewComment] = useState("");

  if (!isVisible) {
    return null;
  }

  const displayComments: Icomment[] =
    comments && comments.length > 0 ? comments : [];

  const handlePostComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    if (onSendComment) {
      onSendComment(trimmed);
    }
    setNewComment("");
  };

  const renderComment = ({ item }: { item: Icomment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentTextContainer}>
        <Text style={[styles.commentAuthor, { color: theme.text }]}>
          {item.author?.userName ?? "Usuário desconhecido"}
        </Text>
        <Text style={[styles.commentText, { color: theme.text }]}>
          {item.content}
        </Text>
      </View>

      {isAuthor && onDeleteComment && (
        <TouchableOpacity
          onPress={() => onDeleteComment(item.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable
            style={[styles.modalContainer, { backgroundColor: theme.input }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.text }]}>
                Comentários
              </Text>
              <TouchableOpacity onPress={onClose} style={{ position: 'absolute', right: 0, top: 0 }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={theme.orange} />
            ) : (
              <FlatList
                data={displayComments}
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
    height: "85%",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "100%",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  commentTextContainer: {
    flex: 1,
    marginLeft: 5,
    marginRight: 10,
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 16,
  },
  commentText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
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
    fontSize: 24,
    maxHeight: 100,
  },
});

export default CommentsModalComp;