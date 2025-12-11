//Card visual de um membro (Foto, Nome, Cargo, Botão de Remover).
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/constants/Theme';
import { IGroupMember } from '@/libs/interfaces/IMember';

interface MemberCardProps {
    member: IGroupMember;
    isAdminView: boolean; // Se quem está vendo é admin
    onRemove: (id: string, name: string) => void;
}

export default function MemberCard({ member, isAdminView, onRemove }: MemberCardProps) {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    return (
        <View style={[styles.container, { borderBottomColor: theme.gray + '20' }]}>
            <View style={styles.leftContent}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: theme.gray + '30' }]}>
                    {member.user.avatarUrl ? (
                        <Image source={{ uri: member.user.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="person" size={20} color={theme.text} />
                    )}
                </View>

                {/* Textos */}
                <View>
                    <Text style={[styles.name, { color: theme.text }]}>{member.user.name}</Text>
                    <Text style={[styles.role, { color: member.role === 'ADMIN' ? theme.orange : theme.gray }]}>
                        {member.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                    </Text>
                </View>
            </View>

            {/* Ação de Remover (Apenas Admin vê, e não pode remover a si mesmo aqui - lógica no pai) */}
            {isAdminView && member.role !== 'ADMIN' && (
                <TouchableOpacity
                    onPress={() => onRemove(member.id, member.user.name)}
                    style={styles.removeButton}
                >
                    <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    role: {
        fontSize: 12,
    },
    removeButton: {
        padding: 8,
    }
});