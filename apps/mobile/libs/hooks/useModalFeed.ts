import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { Icomment } from "@/libs/interfaces/Icomments";
import { IPost } from "@/libs/interfaces/Ipost";
import { getComments, postComment } from "@/libs/auth/handleComments";
import { handleReport } from "@/libs/auth/handleReport";

interface UseFeedModalsProps {
  user: any;
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
}

export const useFeedModals = ({ user, setPosts }: UseFeedModalsProps) => {
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [comments, setComments] = useState<Icomment[]>([]);
  const [isLoadingComments, setIsloadingComments] = useState(false);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      setIsloadingComments(true);
      const data = await getComments(postId);
      
      const filterComments = Array.isArray(data) 
        ? data.filter(c => c.postId === postId) 
        : [];
      
      setComments(filterComments);
    } catch (err) {
      console.log("Erro ao carregar os comentários", err);
      setComments([]);
    } finally {
      setIsloadingComments(false);
    }
  }, []);

  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
    setIsCommentsVisible(true);
    fetchComments(postId);
  };

  const handleCloseComments = () => {
    setIsCommentsVisible(false);
    setSelectedPostId(null);
  };

  const handleOpenOptions = (postId: string) => {
    setSelectedPostId(postId);
    setIsOptionsVisible(true);
  };

  const handleCloseOptions = () => {
    setIsOptionsVisible(false);
    setSelectedPostId(null);
    setComments([]);
  };

  const handleCloseInfoModel = () => {
    setIsOptionsVisible(false);
  };

  const handleStartReportFlow = () => {
    if (!selectedPostId) return;
    setIsOptionsVisible(false);
    setIsReportModalVisible(true);
  };

  const handleCloseModals = () => {
    setIsOptionsVisible(false);
    setIsCommentsVisible(false);
    setIsReportModalVisible(false);
    setSelectedPostId(null);
  };

  const handleSubmitReport = async (reason: string) => {
    if (!selectedPostId || !user?.id) {
      handleCloseModals();
      return;
    }

    try {
      await handleReport({
        postId: selectedPostId,
        reporterId: user.id,
        reason,
        type: "post",
      });

      Alert.alert(
        "Denúncia Enviada",
        "Sua denúncia foi registrada e será analisada pela moderação."
      );
    } catch (error: any) {
      console.error("Falha ao reportar:", error?.message);
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível enviar sua denúncia."
      );
    } finally {
      handleCloseModals();
    }
  };

  const openModalInfos = () => {
    setIsOptionsVisible(false);
    setShowModal(true);
  };

  const closeModalInfos = () => {
    setShowModal(false);
    handleCloseModals();
  };

  const handlePostComment = async (content: string) => {
    if (!selectedPostId || !user?.id) return;

    try {
      const newComment = await postComment({
        postId: selectedPostId,
        authorId: user.id,
        content,
      });

      setComments((prev) => [newComment, ...prev]);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          String(post.id) === selectedPostId
            ? { ...post, commentsCount: (post.commentsCount ?? 0) + 1 }
            : post
        )
      );
    } catch (err) {
      console.log("Erro ao enviar comentário:", err);
    }
  };

  return {
    isOptionsVisible,
    isCommentsVisible,
    isReportModalVisible,
    showModal,
    selectedPostId,
    comments,
    isLoadingComments,
    handleOpenComments,
    handleCloseComments,
    handleOpenOptions,
    handleCloseInfoModel,
    handleStartReportFlow,
    handleCloseModals,
    handleSubmitReport,
    openModalInfos,
    closeModalInfos,
    handlePostComment,
  };
};