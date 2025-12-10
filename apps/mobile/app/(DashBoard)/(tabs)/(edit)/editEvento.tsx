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

import BackGroundComp from "@/components/BackGroundComp";
import Spacer from "@/components/SpacerComp";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import AppText from "@/components/AppText";
import { CustomAlertModalComp } from "@/components/CustomAlertModalComp";
import { EventoFormComponent } from "@/components/EventoFormComponent";
import { useEditarEventoLogic } from "@/libs/hooks/libs/EditHooks/useEditarEventLogic";

export default function EditarEventoScreen() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const {
    formsData,
    setFormData,
    formError,
    loading,
    isDisabled,
    alertConfig,
    closeAlert,
    handleUpdate,
    handleCancel
  } = useEditarEventoLogic();

  return (
    <BackGroundComp>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 80,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.containerInfos}>
            <AppText style={styles.pageTitle}>Editar Evento</AppText>
            <Spacer height={20} />

            <View style={styles.inputContainer}>
              <EventoFormComponent
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
                    Salvar Evento
                  </PrimaryButton>
              )}
              
              <Spacer height={20} />
              
              <SecondaryButton onPress={handleCancel}>
                Cancelar
              </SecondaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlertModalComp
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </BackGroundComp>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    pageTitle: {
      fontSize: 32,
      color: theme.orange,
      textAlign: "center",
      fontFamily: Fonts.mainFont.dongleRegular,
      marginBottom: 10
    },
    containerInfos: {
      width: "100%",
    },
    inputContainer: {
      width: "100%",
    },
    redirectInfos: {
      width: "100%",
      alignItems: "center",
      marginTop: 10,
    },
  });