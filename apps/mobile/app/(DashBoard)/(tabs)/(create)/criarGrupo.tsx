// ARQUIVO: apps/mobile/app/(DashBoard)/(tabs)/(create)/criarGrupo.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';
import BackGroundComp from '@/components/BackGroundComp';
import PrimaryButton from '@/components/PrimaryButton';
import InputComp from '@/components/InputComp';
import { useRouter } from 'expo-router';

// Importamos apenas o nosso hook customizado (agora sem Zod)
import { useCreateGroupForm } from '@/libs/hooks/useCreateGroupForm';

export default function CriarGrupoScreen() {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;
    const router = useRouter();

    const {
        control,
        errors,
        selectedType,
        setValue,
        submitForm,
        isLoading,
        goBack
    } = useCreateGroupForm();

    return (
        //console.log(">>> TELA DE CRIAR GRUPO MONTADA!"),
        <BackGroundComp>
            {/* BOTÃO DE TESTE DE NAVEGAÇÃO */}
            <TouchableOpacity
                style={{ backgroundColor: 'red', padding: 20, marginBottom: 20 }}
                onPress={() => {
                    console.log("Botão de teste clicado");
                    router.push({ pathname: "/group/[id]", params: { id: "teste-123" } });
                }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>TESTAR REDIRECIONAMENTO AGORA</Text>
            </TouchableOpacity>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={goBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: theme.text }]}>Criar Novo Grupo</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.formContainer}>

                        {/* Campo Nome */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Nome do Grupo *</Text>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputComp
                                        placeholder="Ex: Atlética de Computação"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                        </View>

                        {/* Campo Descrição */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Descrição</Text>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            {
                                                color: theme.text,
                                                borderColor: theme.gray || '#ccc',
                                                backgroundColor: theme.input
                                            }
                                        ]}
                                        placeholder="Descreva o objetivo do grupo..."
                                        placeholderTextColor={theme.text + '80'}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value || ''}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                )}
                            />
                            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
                        </View>

                        {/* Campo Esporte */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Esporte Principal</Text>
                            <Controller
                                control={control}
                                name="sport"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputComp
                                        placeholder="Ex: Futebol"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value || ''}
                                    />
                                )}
                            />
                            {/* Se houver erro no esporte, exibe aqui */}
                            {errors.sport && <Text style={styles.errorText}>{errors.sport.message}</Text>}
                        </View>

                        {/* Seletor de Tipo */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Tipo de Grupo *</Text>
                            <View style={styles.typeSelector}>
                                <TypeButton
                                    label="Atlética"
                                    selected={selectedType === 'ATHLETIC'}
                                    onPress={() => setValue('type', 'ATHLETIC')}
                                    theme={theme}
                                />
                                <TypeButton
                                    label="Time Amador"
                                    selected={selectedType === 'AMATEUR'}
                                    onPress={() => setValue('type', 'AMATEUR')}
                                    theme={theme}
                                />
                            </View>
                            {selectedType === 'ATHLETIC' && (
                                <Text style={styles.txtFormsAthletic}>
                                    Para criar uma atlética verificada é necessário enviar documentação comprobatória ao time Aton
                                    {"\n"}
                                    {/* {"http://algo:porta"}  rodrigo: aqui a gente coloca o link do forms  */}
                                </Text>
                            )}
                            {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}
                        </View>

                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color={theme.orange} />
                            ) : (
                                <PrimaryButton
                                    onPress={submitForm}
                                >Criar Grupo</PrimaryButton>
                            )}
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BackGroundComp>
    );
}

const TypeButton = ({ label, selected, onPress, theme }: any) => (
    <TouchableOpacity
        style={[
            styles.typeButton,
            selected && { backgroundColor: theme.orange, borderColor: theme.orange }
        ]}
        onPress={onPress}
    >
        <Text style={[
            styles.typeText,
            { color: selected ? '#fff' : theme.text }
        ]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
    },
    errorText: {
        color: '#ff4d4d',
        fontSize: 12,
        marginTop: 5,
    },
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '500',
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    txtFormsAthletic: {
        fontSize: 15,
        color: '#ff4d4d',
        fontWeight: '600',
        marginTop: 10,
    }

});