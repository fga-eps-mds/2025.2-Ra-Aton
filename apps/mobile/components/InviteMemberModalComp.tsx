import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, FlatList, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/constants/Theme';
import PrimaryButton from './PrimaryButton';
import { sendInvite } from '@/libs/groupMembership/sendInvite';
import { searchUsers, IUserPreview } from '@/libs/user/searchUsers';

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
}


export default function InviteMemberModal({ visible, onClose, groupId }: InviteModalProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;



  // Estados da Busca (Amigos)
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<IUserPreview[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const [invitingIds, setInvitingIds] = useState<string[]>([]); // Loading state



  // Funções de busca (mantidas igual, focando no refinamento do e-mail)
  const handleSearch = async () => {
    if (searchText.length < 2) return;
    setSearchLoading(true);
    try {
      const results = await searchUsers(searchText);
      setUsers(results);
    } catch (error) {
      console.log(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInviteUser = async (userId: string) => {
    setInvitingIds(prev => [...prev, userId]);
    try {
      await sendInvite({ groupId, targetUserId: userId });
      setInvitedIds(prev => [...prev, userId]); // Marca como sucesso
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("already")) {
        setInvitedIds(prev => [...prev, userId]); // Marca como enviado se já for
        Alert.alert("Aviso", "Usuário já convidado.");
      } else {
        Alert.alert("Erro", msg);
      }
    } finally {
      setInvitingIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Limpa estados ao fechar ou trocar de aba
  useEffect(() => {
    if (searchText.length < 2) {
      setUsers([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      handleSearch(); // Chama a sua função de busca existente
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setUsers([]);
      setInvitedIds([]);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: theme.background }]}>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Convidar Membros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={{ flex: 1 }}>
              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.searchInput, { color: theme.text, borderColor: theme.gray, backgroundColor: theme.input }]}
                  placeholder="Nome ou username..."
                  placeholderTextColor={theme.gray}
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={handleSearch}
                  autoFocus={true}
                />
                <TouchableOpacity onPress={handleSearch} style={[styles.searchBtn, { backgroundColor: theme.orange }]}>
                  <Ionicons name="search" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {searchLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={theme.orange} />
              ) : (
                <FlatList
                  data={users}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  ListEmptyComponent={() => (
                    <Text style={{ color: theme.gray, textAlign: 'center', marginTop: 20 }}>
                      {searchText.length < 2 ? "Digite para buscar." : "Nenhum usuário encontrado."}
                    </Text>
                  )}
                  renderItem={({ item }) => {
                    const isInvited = invitedIds.includes(item.id);
                    return (
                      <View style={[styles.userItem, { borderBottomColor: theme.gray + '20' }]}>
                        <View style={styles.userInfo}>
                          <View style={[styles.avatar, { backgroundColor: theme.gray + '30' }]}>
                            {item.profilePicture ? (
                              <Image source={{ uri: item.profilePicture }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Ionicons name="person" size={18} color={theme.text} />
                            )}
                          </View>
                          <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.inviteBtn,
                            { backgroundColor: invitedIds.includes(item.id) ? theme.gray : theme.orange }
                          ]}
                          disabled={invitedIds.includes(item.id) || invitingIds.includes(item.id)}
                          onPress={() => handleInviteUser(item.id)}
                        >
                          {invitingIds.includes(item.id) ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Text style={styles.inviteBtnText}>
                              {invitedIds.includes(item.id) ? "Enviado" : "Convidar"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  // REFINAMENTO: Estilo do texto de erro
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  // Estilos da Busca
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  searchBtn: {
    width: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  inviteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  inviteBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});