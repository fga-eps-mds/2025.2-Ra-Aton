// ARQUIVO: apps/mobile/app/perfilGrupo.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORTAÇÃO CORRIGIDA
import { Ionicons } from '@expo/vector-icons';

import BackGroundComp from '@/components/BackGroundComp';
import { useTheme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';

export default function GroupProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    return (
        <BackGroundComp>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            Perfil do Grupo
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.gray }]}>
                            ID: {id}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </BackGroundComp>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, padding: 20 },
    backButton: { padding: 10, alignSelf: 'flex-start' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold' },
    subtitle: { fontSize: 16, marginTop: 8 }
});