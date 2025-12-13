// app/(DashBoard)/(tabs)/(editProfile)/editarGrupo.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import BackGroundComp from "@/components/BackGroundComp";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { updateGroupImages } from "@/libs/group/handleGroupProfile";
import { useUser } from "@/libs/storage/UserContext";

export default function EditarGrupoScreen() {
  const { groupId, groupName, logoUrl, bannerUrl, bio } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
    logoUrl?: string;
    bannerUrl?: string;
    bio?: string;
  }>();
  
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { user } = useUser();

  const [selectedLogo, setSelectedLogo] = useState<string | null>(logoUrl || null);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(bannerUrl || null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [groupBio, setGroupBio] = useState<string>(bio || "");
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async (type: "logo" | "banner") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de permissão para acessar suas fotos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (type === "logo") {
        setSelectedLogo(uri);
        setLogoUri(uri);
      } else {
        setSelectedBanner(uri);
        setBannerUri(uri);
      }
    }
  };

  const handleSave = async () => {
    if (!logoUri && !bannerUri && groupBio === (bio || "")) {
      Alert.alert("Atenção", "Faça alguma alteração antes de salvar");
      return;
    }

    setIsLoading(true);
    try {
      const bioToSend = groupBio !== (bio || "") ? groupBio : null;
      await updateGroupImages(groupId, logoUri, bannerUri, bioToSend, user?.token);
      
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", error.message || "Erro ao atualizar perfil do grupo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackGroundComp>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>
              Editar Perfil do Grupo
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Nome do Grupo */}
            <Text style={[styles.groupName, { color: theme.text }]}>
              {groupName}
            </Text>

            {/* Bio do Grupo */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Biografia
              </Text>
              <TextInput
                style={[
                  styles.bioInput,
                  {
                    color: theme.text,
                    borderColor: theme.gray,
                    backgroundColor: isDarkMode ? theme.gray + "20" : "#f5f5f5",
                  },
                ]}
                placeholder="Escreva uma bio para o grupo..."
                placeholderTextColor={theme.text + "80"}
                value={groupBio}
                onChangeText={setGroupBio}
                multiline
                maxLength={200}
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.text + "80" }]}>
                {groupBio.length}/200
              </Text>
            </View>

            {/* Banner */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Banner do Grupo
              </Text>
              <TouchableOpacity
                style={[styles.bannerContainer, { borderColor: theme.gray }]}
                onPress={() => pickImage("banner")}
              >
                {selectedBanner ? (
                  <Image source={{ uri: selectedBanner }} style={styles.bannerImage} />
                ) : (
                  <View style={[styles.bannerPlaceholder, { backgroundColor: theme.gray }]}>
                    <Ionicons name="image-outline" size={40} color={theme.text} />
                    <Text style={[styles.placeholderText, { color: theme.text }]}>
                      Toque para adicionar banner
                    </Text>
                  </View>
                )}
                <View style={[styles.editBadge, { backgroundColor: theme.orange }]}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Logo */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Logo do Grupo
              </Text>
              <TouchableOpacity
                style={[styles.logoContainer, { borderColor: theme.gray }]}
                onPress={() => pickImage("logo")}
              >
                {selectedLogo ? (
                  <Image source={{ uri: selectedLogo }} style={styles.logoImage} />
                ) : (
                  <View style={[styles.logoPlaceholder, { backgroundColor: theme.gray }]}>
                    <Ionicons name="image-outline" size={40} color={theme.text} />
                  </View>
                )}
                <View style={[styles.editBadge, { backgroundColor: theme.orange }]}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.orange },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" testID="activity-indicator" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  bannerContainer: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    overflow: "hidden",
    alignSelf: "center",
    position: "relative",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
  },
  editBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
