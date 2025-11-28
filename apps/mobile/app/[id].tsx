// ARQUIVO: apps/mobile/app/(DashBoard)/group/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import BackGroundComp from '@/components/BackGroundComp';

export default function GroupProfileScreen() {
    const { id } = useLocalSearchParams(); // Pega o ID da URL
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    return (
        <BackGroundComp>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.text, { color: theme.text }]}>
                    Perfil do Grupo (ID: {id})
                </Text>
                <Text style={[styles.subtext, { color: theme.gray }]}>
                    Esta página será implementada na Issue de Perfil.
                </Text>
            </View>
        </BackGroundComp>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtext: {
        fontSize: 16,
    }
});