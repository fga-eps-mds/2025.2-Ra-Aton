import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/constants/Theme';
import { IGroupMember } from '@/libs/interfaces/IMember';

interface MemberCardProps {
    member: IGroupMember;
    isAdminView: boolean; 
    onRemove: (id: string, name: string) => void;
    onPress?: () => void;   
}

export default function MemberCard({ member, isAdminView, onRemove, onPress }: MemberCardProps) {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    return (
        <TouchableOpacity 
            style={[styles.container, { borderBottomColor: theme.gray + '20' }]}
            onPress={onPress} 
            activeOpacity={0.7}
            disabled={!onPress} 
        >
            <View style={styles.leftContent}>
                <View style={[styles.avatar, { backgroundColor: theme.gray + '30' }]}>
                    {member.user.avatarUrl ? (
                        <Image source={{ uri: member.user.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="person" size={20} color={theme.text} />
                    )}
                </View>

                <View>
                    <Text style={[styles.name, { color: theme.text }]}>{member.user.name}</Text>
                    <Text style={[styles.role, { color: member.role === 'ADMIN' ? theme.orange : theme.gray }]}>
                        {member.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                    </Text>
                </View>
            </View>

            {isAdminView && member.role !== 'ADMIN' && (
                <TouchableOpacity
                    onPress={() => onRemove(member.id, member.user.name)}
                    style={styles.removeButton}
                >
                    <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
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