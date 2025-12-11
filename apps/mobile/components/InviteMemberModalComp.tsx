//Um modal com duas abas ou opções: "Por E-mail" e "Buscar Amigos".
import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/constants/Theme';
import PrimaryButton from './PrimaryButton';
import { sendInvite } from '@/libs/groupMembership/sendInvite';

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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Convidar Membros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.gray} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'EMAIL' && { borderBottomColor: theme.orange }]}
              onPress={() => setActiveTab('EMAIL')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'EMAIL' ? theme.orange : theme.gray }]}>
                Por E-mail
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'FRIENDS' && { borderBottomColor: theme.orange }]}
              onPress={() => setActiveTab('FRIENDS')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'FRIENDS' ? theme.orange : theme.gray }]}>
                Meus Amigos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View style={styles.content}>
            {activeTab === 'EMAIL' ? (
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
              <View style={styles.friendsContainer}>
                <Text style={{ color: theme.gray, textAlign: 'center', marginTop: 20 }}>
                  (Busca de amigos será implementada em breve...)
                </Text>
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
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  friendsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});