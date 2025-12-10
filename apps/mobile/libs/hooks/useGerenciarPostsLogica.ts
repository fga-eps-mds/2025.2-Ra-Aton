import { useState } from 'react';
import { useRouter } from "expo-router";
import { useMyPosts } from '@/libs/hooks/useMyPosts';
import { getComments } from '@/libs/auth/handleComments';
import { api_route } from '@/libs/auth/api';
import { IPost } from '@/libs/interfaces/Ipost';
import { Icomment } from '@/libs/interfaces/Icomments';

export const useGerenciarPostsLogic = () => {
    const router = useRouter();
    const { myPosts, isLoading, isRefreshing, onRefresh, handleDeletePost } = useMyPosts();
    
    const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [postComments, setPostComments] = useState<Icomment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
        type: 'default' as 'default' | 'danger',
        onConfirm: undefined as (() => void) | undefined
    });

    const showAlert = (title: string, message: string, onConfirm?: () => void, type: 'default' | 'danger' = 'default') => {
        setAlertConfig({ visible: true, title, message, onConfirm, type });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const openActionMenu = (post: IPost) => {
        setSelectedPost(post);
        setMenuVisible(true);
    };

    const handleEditPost = (post: IPost) => {
        setMenuVisible(false);
        const params = { postData: JSON.stringify(post) };
        
        if (post.type === "EVENT") {
            router.push({ pathname: "/(DashBoard)/(tabs)/(edit)/editEvento", params });
        } else {
            router.push({ pathname: "/(DashBoard)/(tabs)/(edit)/editarPost", params });
        }
    };

    const confirmDeletePost = (postId: string) => {
        setMenuVisible(false);
        showAlert(
            "Deletar Post",
            "Tem certeza? Isso apagará todas as interações.",
            () => handleDeletePost(postId),
            'danger'
        );
    };

    const handleOpenManageComments = async (post: IPost) => {
        setSelectedPost(post);
        setCommentsModalVisible(true);
        setLoadingComments(true);

        //* filtrando os comentários 
        try {
            const data = await getComments(post.id);
            
            const filteredData = Array.isArray(data) 
                ? data.filter(c => c.postId === post.id) 
                : [];
            
            setPostComments(filteredData);
        } catch (error) {
            console.error(error);
            showAlert("Erro", "Falha ao carregar comentários.");
        } finally {
            setLoadingComments(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!selectedPost) return;

        const deleteAction = async () => {
            try {
                await api_route.delete(`/posts/${selectedPost.id}/comments/${commentId}`);
                setPostComments(prev => prev.filter(c => c.id !== commentId));
            } catch (error) {
                console.error(error);
                setTimeout(() => showAlert("Erro", "Não foi possível deletar o comentário."), 300);
            }
        };

        showAlert(
            "Deletar Comentário",
            "Deseja realmente apagar este comentário?",
            deleteAction,
            'danger'
        );
    };

    return {
        myPosts,
        selectedPost,
        postComments,
        isLoading,
        isRefreshing,
        menuVisible,
        commentsModalVisible,
        loadingComments,
        alertConfig,
        onRefresh,
        setMenuVisible,
        setCommentsModalVisible,
        closeAlert,
        openActionMenu,
        handleEditPost,
        confirmDeletePost,
        handleOpenManageComments,
        handleDeleteComment
    };
};