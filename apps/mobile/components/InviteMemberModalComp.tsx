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
// Importe o novo serviço
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
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados para a aba de Amigos
    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState<IUserPreview[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [invitedIds, setInvitedIds] = useState<string[]>([]); // Controle visual de quem já foi convidado

    // Função para enviar por E-mail
    const handleSendEmail = async () => {
        if (!email.includes('@') || email.length < 5) {
            Alert.alert("Erro", "Digite um e-mail válido.");
            return;
        }
        setLoading(true);
        try {
            await sendInvite({ groupId, targetEmail: email });
            Alert.alert("Sucesso", `Convite enviado para ${email}`);
            setEmail('');
            onClose();
        } catch (error: any) {
            Alert.alert("Erro", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar usuários (Debounce manual simples ou busca no botão)
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

    // Função para convidar usuário da lista
    const handleInviteUser = async (userId: string) => {
        try {
            await sendInvite({ groupId, targetUserId: userId });
            setInvitedIds(prev => [...prev, userId]); // Marca como convidado visualmente
        } catch (error: any) {
            Alert.alert("Erro", error.message);
        }
    };

    // Limpa estados ao fechar
    useEffect(() => {
        if (!visible) {
            setEmail('');
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
                            // --- ABA DE E-MAIL ---
                            <View>
                                <Text style={[styles.label, { color: theme.text }]}>E-mail do usuário</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.gray, backgroundColor: theme.input }]}
                                    placeholder="exemplo@email.com"
                                    placeholderTextColor={theme.gray}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <View style={{ marginTop: 20 }}>
                                    {loading ? (
                                        <ActivityIndicator color={theme.orange} />
                                    ) : (
                                        <PrimaryButton onPress={handleSendEmail}>Enviar Convite</PrimaryButton>
                                    )}
                                </View>
                            </View>
                        ) : (
                            // --- ABA DE AMIGOS / BUSCA ---
                            <View style={{ flex: 1 }}>
                                <View style={styles.searchRow}>
                                    <TextInput
                                        style={[styles.searchInput, { color: theme.text, borderColor: theme.gray, backgroundColor: theme.input }]}
                                        placeholder="Nome ou username..."
                                        placeholderTextColor={theme.gray}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        onSubmitEditing={handleSearch} // Busca ao dar Enter
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
        height: '60%', // Altura fixa para o modal
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
    friendsContainer: {
        flex: 1,
        justifyContent: 'center'
    }
});