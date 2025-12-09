import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { api_route } from "@/libs/auth/api";
import { IPost } from "@/libs/interfaces/Ipost";
import { useUser } from "@/libs/storage/UserContext";

export const useMyPosts = () => {
  const { user } = useUser();
  const [myPosts, setMyPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMyPosts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await api_route.get("/posts", {
        params: { limit: 50, page: 1 } 
      });

      const allPosts: IPost[] = response.data.data || [];
      const userPosts = allPosts.filter(post => post.authorId === user.id);
      
      setMyPosts(userPosts);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar seus posts.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  const handleDeletePost = async (postId: string) => {
    try {
      await api_route.delete(`/posts/${postId}`);
      setMyPosts(prev => prev.filter(p => p.id !== postId));
      Alert.alert("Sucesso", "Post deletado com sucesso.");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível deletar o post.");
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMyPosts();
  };

  return {
    myPosts,
    isLoading,
    isRefreshing,
    onRefresh,
    handleDeletePost,
    refetch: fetchMyPosts
  };
};