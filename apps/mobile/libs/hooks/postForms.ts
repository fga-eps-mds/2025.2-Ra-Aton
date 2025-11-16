import { useState } from 'react';
import { Alert } from 'react-native';
import { useUser } from '@/libs/storage/UserContext';
import { useRouter } from 'expo-router';
import { createPost } from '@/libs/criar/createPost';

export const postForms = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const [formsData, setFormData] = useState({
    titulo: '',
    descricao: '',

  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!user) {
        Alert.alert('Erro', 'Usuário não encontrado, faça login novamente.');
        router.replace('/(Auth)/login');
        return;
      }

      // Campos Obrigatórios
      if (!formsData.titulo) {
        Alert.alert('Erro', 'Preencha os campos obrigatórios: Título');
        return;
      }

      // Envia ao backend
      const result = await createPost({
        title: formsData.titulo,
        type: 'GENERAL',
        content: formsData.descricao,
        token: user.token,
      });

      if (result.error){              // Quando a requisição vai errada por exemplo sem descrição ativa aq
        throw new Error(result.error);
      }  

      Alert.alert('Sucesso', 'Post criado com sucesso!');
      console.log('Post criado:', result);
      
      // Limpa formulário
      setFormData({
        titulo: '',
        descricao: '',
      });
      
      // Redireciona
      router.replace('/(DashBoard)/(tabs)/Home');
    } catch (error: any) {
      Alert.alert('Erro ao criar post', error?.message || 'Tente novamente');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const comebackPage = () => {
    router.push('/(DashBoard)/(tabs)/NovoPost');
  };

  const isDisabled = loading || !formsData.titulo;

  return {
    formsData,
    setFormData,
    loading,
    isDisabled,
    handleSubmit,
    comebackPage,
  };
};
