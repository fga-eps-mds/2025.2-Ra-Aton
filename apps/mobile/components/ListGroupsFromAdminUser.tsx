import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTheme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useUser } from '@/libs/storage/UserContext';
import { api_route } from '@/libs/auth/api';

/**
 * exemplo de retorno da API:
 * [
  {
    "id": "b047da07-5755-4fdb-883c-e7f2bada119a",
    "userId": "2a9268c5-fa53-4812-aefb-3a6b0375a614",
    "groupId": "9cf83447-339d-4438-8f86-65fb7e35f367",
    "role": "ADMIN",
    "isCreator": true,
    "createdAt": "2025-11-29T04:08:32.868Z",
    "user": {
      "id": "2a9268c5-fa53-4812-aefb-3a6b0375a614",
      "userName": "abcd",
      "email": "abcd@gmail.com"
    },
    "group": {
      "id": "9cf83447-339d-4438-8f86-65fb7e35f367",
      "name": "novo grp",
      "groupType": "AMATEUR"
    }
  },
  {
    "id": "ef80e98e-21a5-44e2-9b88-3ecd0f81028b",
    "userId": "2a9268c5-fa53-4812-aefb-3a6b0375a614",
    "groupId": "91a1fb63-2b44-46b8-bc59-4bed091fe9d4",
    "role": "ADMIN",
    "isCreator": true,
    "createdAt": "2025-11-29T04:10:55.827Z",
    "user": {
      "id": "2a9268c5-fa53-4812-aefb-3a6b0375a614",
      "userName": "abcd",
      "email": "abcd@gmail.com"
    },
    "group": {
      "id": "91a1fb63-2b44-46b8-bc59-4bed091fe9d4",
      "name": "novo grp novo",
      "groupType": "AMATEUR"
    }
  }
]
 */

interface GroupMembership {
  id: string;
  userId: string;
  groupId: string;
  role: 'ADMIN' | 'MEMBER';
  isCreator: boolean;
  createdAt: string;
  user: {
    id: string;
    userName: string;
    email: string;
  };
  group: Group;
}

interface Group {
  id: string;
  name: string;
  groupType: 'AMATEUR' | 'ATHLETIC';
}

interface ListGroupsFromAdminUserProps {
  onSelect: (groupId: string) => void;
  selectedGroupId?: string | null;
}

const ListGroupsFromAdminUser: React.FC<ListGroupsFromAdminUserProps> = ({
  onSelect,
  selectedGroupId,
}) => {
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.id) {
        setError('Usuário não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api_route.get(`/member/admin/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        // Mapeia a resposta para extrair apenas os grupos
        const memberships: GroupMembership[] = response.data || [];
        const extractedGroups = memberships.map((membership) => membership.group);
        
        setGroups(extractedGroups);

        // Auto-seleciona o primeiro grupo se houver e nenhum estiver selecionado
        if (extractedGroups.length > 0 && !selectedGroupId) {
          onSelect(extractedGroups[0].id);
        }
      } catch (err: any) {
        console.error('Erro ao buscar grupos do admin:', err);
        setError(
          err?.response?.data?.message ||
            'Erro ao carregar grupos. Tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?.id]);

  const handleSelectGroup = (groupId: string) => {
    console.log('Grupo selecionado - ID:', groupId);
    onSelect(groupId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.orange || '#FF6B35'} />
        <Text style={styles.loadingText}>Carregando grupos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Você não é administrador de nenhum grupo ainda.
        </Text>
      </View>
    );
  }

  console.log('Grupos do admin carregados:', groups);
  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          console.log('Renderizando grupo:', item.name, item.id);
          return (
            <TouchableOpacity
              style={[
                styles.groupCard,
                selectedGroupId === item.id && styles.groupCardSelected,
              ]}
              onPress={() => handleSelectGroup(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.groupName,
                  selectedGroupId === item.id && styles.groupNameSelected,
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default ListGroupsFromAdminUser;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginVertical: 10,
    },
    listContent: {
      paddingHorizontal: 5,
    },
    groupCard: {
      backgroundColor: theme.groupcards || '#f0f0f0',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 6,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    groupCardSelected: {
      backgroundColor: theme.primary || '#ff3c00ff',
      borderColor: theme.primaryDark || '#b35400ff',
      transform: [{ scale: 1.05 }],
    },
    groupName: {
      fontSize: 16,
      fontFamily: Fonts.otherFonts.dongleBold,
      color: '#1a1a1aff',
      fontWeight: '600',
      marginBottom: 4,
    },
    groupNameSelected: {
      color: '#FFFFFF',
    },
    groupType: {
      fontSize: 12,
      fontFamily: Fonts.otherFonts.dongleLight,
      color: theme.textSecondary || '#353535ff',
      fontWeight: '400',
    },
    groupTypeSelected: {
      color: '#ffffffff',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: theme.text,
      fontFamily: Fonts.mainFont.dongleRegular,
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.error || '#ffebee',
      borderRadius: 8,
      marginVertical: 10,
    },
    errorText: {
      fontSize: 14,
      color: theme.errorText || '#c62828',
      fontFamily: Fonts.mainFont.dongleRegular,
      textAlign: 'center',
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card || '#f5f5f5',
      borderRadius: 8,
      marginVertical: 10,
    },
    emptyText: {
      fontSize: 14,
      color: theme.textSecondary || '#666',
      fontFamily: Fonts.mainFont.dongleRegular,
      textAlign: 'center',
    },
  });