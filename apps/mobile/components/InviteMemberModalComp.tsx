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

type InviteTab = 'EMAIL' | 'FRIENDS';

export default function InviteMemberModal({ visible, onClose, groupId }: InviteModalProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [activeTab, setActiveTab] = useState<InviteTab>('EMAIL');
  
  // Estados do E-mail
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  // REFINAMENTO: Estado para controlar a mensagem de erro visual
  const [emailError, setEmailError] = useState<string | null>(null);

  // Estados da Busca (Amigos)
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<IUserPreview[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  // REFINAMENTO: Regex para validação de e-mail robusta
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendEmail = async () => {
    // 1. Limpa erros anteriores
    setEmailError(null);

    // 2. Validação visual imediata
    if (!email) {
      setEmailError("O campo de e-mail não pode estar vazio.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Digite um endereço de e-mail válido (ex: nome@email.com).");
      return;
    }

    setLoading(true);
    try {
      await sendInvite({ groupId, targetEmail: email });
      
      // Sucesso
      Alert.alert(
        "Convite Enviado! 📧", 
        `Um convite foi enviado para ${email}.`,
        [{ text: "OK", onPress: () => {
            setEmail('');
            onClose();
        }}]
      );
    } catch (error: any) {
      // 3. Tratamento de Erro vindo do Backend (ex: Usuário não existe)
      const msg = error.message || "";
      
      // Se o erro for sobre usuário não encontrado, mostramos no input
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("encontrado")) {
        setEmailError("Nenhum usuário encontrado com este e-mail na plataforma.");
      } else if (msg.toLowerCase().includes("already")) {
        setEmailError("Este usuário já é membro ou já foi convidado.");
      } else {
        // Erros genéricos de servidor ainda vão para o Alert
        Alert.alert("Erro no envio", msg);
      }
    } finally {
      setLoading(false);
    }
  };

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
    try {
      await sendInvite({ groupId, targetUserId: userId });
      setInvitedIds(prev => [...prev, userId]);
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  // Limpa estados ao fechar ou trocar de aba
  useEffect(() => {
    if (!visible) {
      setEmail('');
      setEmailError(null); // Limpa erro ao fechar
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

          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'EMAIL' && { borderBottomColor: theme.orange }]}
              onPress={() => setActiveTab('EMAIL')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'EMAIL' ? theme.orange : theme.gray }]}>Por E-mail</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'FRIENDS' && { borderBottomColor: theme.orange }]}
              onPress={() => setActiveTab('FRIENDS')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'FRIENDS' ? theme.orange : theme.gray }]}>Buscar Usuários</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {activeTab === 'EMAIL' ? (
              <View>
                <Text style={[styles.label, { color: theme.text }]}>E-mail do usuário</Text>
                
                {/* REFINAMENTO: Input com feedback visual */}
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: theme.text, 
                      backgroundColor: theme.input,
                      // Muda a cor da borda se tiver erro
                      borderColor: emailError ? '#ff4d4d' : theme.gray 
                    }
                  ]}
                  placeholder="exemplo@email.com"
                  placeholderTextColor={theme.gray}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(null); // Limpa erro ao digitar
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                
                {/* REFINAMENTO: Mensagem de erro abaixo do input */}
                {emailError && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={14} /> {emailError}
                  </Text>
                )}

                <View style={{ marginTop: 20 }}>
                  {loading ? (
                    <ActivityIndicator color={theme.orange} />
                  ) : (
                    <PrimaryButton onPress={handleSendEmail}>Enviar Convite</PrimaryButton>
                  )}
                </View>
              </View>
            ) : (
              // --- ABA DE AMIGOS ---
              <View style={{ flex: 1 }}>
                <View style={styles.searchRow}>
                  <TextInput
                    style={[styles.searchInput, { color: theme.text, borderColor: theme.gray, backgroundColor: theme.input }]}
                    placeholder="Nome ou username..."
                    placeholderTextColor={theme.gray}
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
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
                        {searchText ? "Nenhum usuário encontrado." : "Busque por nome."}
                      </Text>
                    )}
                    renderItem={({ item }) => {
                      const isInvited = invitedIds.includes(item.id);
                      return (
                        <View style={[styles.userItem, { borderBottomColor: theme.gray + '20' }]}>
                          <View style={styles.userInfo}>
                            <View style={[styles.avatar, { backgroundColor: theme.gray + '30' }]}>
                              {item.avatarUrl ? (
                                <Image source={{ uri: item.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                              ) : (
                                <Ionicons name="person" size={18} color={theme.text} />
                              )}
                            </View>
                            <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                          </View>

                          <TouchableOpacity 
                            style={[
                              styles.inviteBtn, 
                              { backgroundColor: isInvited ? theme.gray : theme.orange }
                            ]}
                            disabled={isInvited}
                            onPress={() => handleInviteUser(item.id)}
                          >
                            <Text style={styles.inviteBtnText}>
                              {isInvited ? "Enviado" : "Convidar"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            )}
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