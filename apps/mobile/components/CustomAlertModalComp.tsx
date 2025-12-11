import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import AppText from "./AppText";

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'danger'; 
}

export const CustomAlertModalComp: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = 'default'
}) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.input }]}>
                    <AppText style={[styles.title, { color: theme.orange }]}>
                        {title}
                    </AppText>
                    
                    <AppText style={[styles.message, { color: theme.text }]}>
                        {message}
                    </AppText>

                    <View style={styles.buttonRow}>
                        {onConfirm ? (
                            <>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton, { borderColor: theme.text }]} 
                                    onPress={onClose}
                                >
                                    <Text style={[styles.btnText, { color: theme.text }]}>{cancelText}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[
                                        styles.button, 
                                        type === 'danger' ? styles.dangerButton : { backgroundColor: theme.orange }
                                    ]} 
                                    onPress={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.btnText, { color: '#FFF' }]}>{confirmText}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.button, { backgroundColor: theme.orange, width: '100%' }]} 
                                onPress={onClose}
                            >
                                <Text style={[styles.btnText, { color: '#FFF' }]}>OK</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 25,
        opacity: 0.9
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 15
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    dangerButton: {
        backgroundColor: '#ff4d4d',
    },
    btnText: {
        fontWeight: '600',
        fontSize: 16
    }
});