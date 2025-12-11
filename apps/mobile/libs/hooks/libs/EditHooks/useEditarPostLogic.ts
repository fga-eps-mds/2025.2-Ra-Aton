import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api_route } from "@/libs/auth/api";
import { IPost } from "@/libs/interfaces/Ipost";

export const useEditarPostLogic = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [loading, setLoading] = useState(false);
    const [postId, setPostId] = useState<string | null>(null);

    const [formsData, setFormData] = useState({
        titulo: "",
        descricao: "",
    });
    
    const [formError, setFormError] = useState("");

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
        type: 'default' as 'default' | 'danger',
        onConfirm: undefined as (() => void) | undefined
    });

    const showAlert = (title: string, message: string, onConfirm?: () => void) => {
        setAlertConfig({ visible: true, title, message, onConfirm, type: 'default' });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        if (params.postData && typeof params.postData === 'string') {
            try {
                const post: IPost = JSON.parse(params.postData);
                setPostId(post.id);
                setFormData({
                    titulo: post.title || "",
                    descricao: post.content || "",
                });
            } catch (error) {
                console.error("Erro ao fazer parse do post:", error);
                showAlert("Erro", "Dados do post inválidos.", () => router.back());
            }
        }
    }, [params.postData]);

    const handleUpdate = async () => {
        if (!postId) return;

        if (!formsData.titulo) {
            showAlert("Erro", "O título é obrigatório.");
            return;
        }

        setLoading(true);
        setFormError("");

        try {
            await api_route.patch(`/posts/${postId}`, {
                title: formsData.titulo,
                content: formsData.descricao,
            });

            showAlert("Sucesso", "Post atualizado com sucesso!", () => router.back());
            
        } catch (error: any) {
            console.error("Erro ao atualizar post:", error);
            const msg = error?.response?.data?.message || "Não foi possível atualizar o post.";
            setFormError(msg);
            showAlert("Erro", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const isDisabled = loading || !formsData.titulo;

    return {
        formsData,
        setFormData,
        formError,
        loading,
        isDisabled,
        alertConfig, 
        closeAlert,  
        handleUpdate,
        handleCancel
    };
};