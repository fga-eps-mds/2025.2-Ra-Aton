import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BackGroundComp from '@/components/BackGroundComp';
import { useTheme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';
import MemberCard from '@/components/MemberCardComp';
import InviteMemberModal from '@/components/InviteMemberModalComp';

import { getGroupMembers } from '@/libs/groupMembership/getGroupMembers';
import { removeMember } from '@/libs/groupMembership/removeMember';
import { IGroupMember } from '@/libs/interfaces/IMember';

// Simulação de contexto de usuário (Substitua pelo seu UserContext real depois)
// Por enquanto, vamos assumir que somos admin para testar a UI
const CURRENT_USER_ID = "meu-id-de-teste";

type TabOption = 'ABOUT' | 'MEMBERS';

export default function GroupProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    const [activeTab, setActiveTab] = useState<TabOption>('MEMBERS'); // Começa em membros para facilitar o teste
    const [members, setMembers] = useState<IGroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);

    // Verifica se sou admin (Lógica simplificada, idealmente viria do backend ou do objeto do grupo)
    const isAdmin = true;

    const fetchMembers = async () => {
        if (!id) return;
        try {
            const data = await getGroupMembers(id.toString());
            setMembers(data);
        } catch (error) {
            console.log("Erro ao buscar membros", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMembers();
    };

    const handleRemoveMember = async (membershipId: string) => {
        try {
            await removeMember(membershipId);
            // Atualiza a lista localmente
            setMembers(prev => prev.filter(m => m.id !== membershipId));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <BackGroundComp>
            <SafeAreaView style={styles.safeArea}>

                {/* Header Simples */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Perfil do Grupo</Text>

                    {/* Botão de Convidar (Só aparece para Admin e na aba de membros) */}
                    {isAdmin && activeTab === 'MEMBERS' && (
                        <TouchableOpacity onPress={() => setInviteModalVisible(true)}>
                            <Ionicons name="person-add" size={24} color={theme.orange} />
                        </TouchableOpacity>
                    )}
                    {!isAdmin && <View style={{ width: 24 }} />}
                </View>

                {/* Tabs de Navegação */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'ABOUT' && { borderBottomColor: theme.orange }]}
                        onPress={() => setActiveTab('ABOUT')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'ABOUT' ? theme.orange : theme.gray }]}>Sobre</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'MEMBERS' && { borderBottomColor: theme.orange }]}
                        onPress={() => setActiveTab('MEMBERS')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'MEMBERS' ? theme.orange : theme.gray }]}>Membros</Text>
                    </TouchableOpacity>
                </View>

                {/* Conteúdo das Abas */}
                <View style={styles.content}>
                    {activeTab === 'ABOUT' ? (
                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>Nome do Grupo (ID: {id})</Text>
                            <Text style={{ color: theme.gray, marginTop: 10 }}>Descrição do grupo virá aqui...</Text>
                        </ScrollView>
                    ) : (
                        /* Lista de Membros */
                        <FlatList
                            data={members}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            ListEmptyComponent={() => (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    {loading ? (
                                        <ActivityIndicator color={theme.orange} />
                                    ) : (
                                        <Text style={{ color: theme.gray }}>Nenhum membro encontrado.</Text>
                                    )}
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <MemberCard
                                    member={item}
                                    isAdminView={isAdmin}
                                    onRemove={handleRemoveMember}
                                />
                            )}
                        />
                    )}
                </View>

                {/* Modal de Convite */}
                <InviteMemberModal
                    visible={inviteModalVisible}
                    onClose={() => setInviteModalVisible(false)}
                    groupId={id?.toString() || ''}
                />

            </SafeAreaView>
        </BackGroundComp>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },

    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginTop: 10,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    }
});