import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import { Fonts } from "@/constants/Fonts";

// Componentes
import BackGroundComp from "@/components/BackGroundComp";
import Spacer from "@/components/SpacerComp";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import AppText from "@/components/AppText";
import { PostFormComponent } from "@/components/PostFormComponent";

// Hook de Lógica
import { useEditarPostLogic } from "@/libs/hooks/libs/hooks/useEditarPostLogic";

export default function EditarPost() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const {
    formsData,
    setFormData,
    formError,
    loading,
    isDisabled,
    handleUpdate,
    handleCancel
  } = useEditarPostLogic();

  return (
    <BackGroundComp>
      <KeyboardAvoidingView
        style={[{ flex: 1 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 80,
            backgroundColor: theme.background,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.containerInfos}>
            <AppText style={styles.pageTitle}>Editar Post</AppText>
            <Spacer height={20} />

            {/* Reaproveitando o formulário existente */}
            <View style={styles.inputContainer}>
              <PostFormComponent
                formsData={formsData}
                setFormData={setFormData}
                formError={formError}
              />
            </View>

            <Spacer height={40} />
            
            <View style={styles.redirectInfos}>
              {loading ? (
                  <ActivityIndicator size="large" color={theme.orange} />
              ) : (
                  <PrimaryButton disabled={isDisabled} onPress={handleUpdate}>
                    Salvar Alterações
                  </PrimaryButton>
              )}
              
              <Spacer height={30} />
              
              <SecondaryButton onPress={handleCancel}>
                Cancelar
              </SecondaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackGroundComp>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    pageTitle: {
      fontSize: 24,
      color: theme.orange,
      fontWeight: "bold",
      textAlign: "center",
      fontFamily: Fonts.mainFont.dongleRegular,
    },
    containerInfos: {
      width: "100%",
    },
    inputContainer: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    redirectInfos: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      marginTop: 10,
    },
  });