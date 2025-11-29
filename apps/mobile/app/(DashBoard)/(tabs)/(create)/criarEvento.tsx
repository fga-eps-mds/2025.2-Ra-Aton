import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Fonts";

// Componentes
import BackGroundComp from "@/components/BackGroundComp";
import Spacer from "@/components/SpacerComp";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import AppText from "@/components/AppText";
import { EventoFormComponent } from "@/components/EventoFormComponent";
import ListGroupsFromAdminUser from "@/components/ListGroupsFromAdminUser";

// Libs
import { eventoForms } from "@/libs/hooks/eventoForms";

const CriarEvento: React.FC = () => {
  return <CriarEventoInner />;
};

const CriarEventoInner: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const {
    formsData,
    isDisabled,
    setFormData,
    handleSubmit,
    comebackPage,
    formError,
  } = eventoForms(selectedGroupId);

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
            <View style={styles.inputContainer}>
              <AppText style={styles.sectionTitle}>Selecione o grupo para o evento</AppText>
              <ListGroupsFromAdminUser 
                onSelect={(id) => setSelectedGroupId(id)} 
                selectedGroupId={selectedGroupId}
              />
              <Spacer height={20} />
              <EventoFormComponent
                formsData={formsData}
                setFormData={setFormData}
                formError={formError}
              />
            </View>

            <Spacer height={40} />
            <View style={styles.redirectInfos}>
              <PrimaryButton disabled={isDisabled} onPress={handleSubmit}>
                Criar Evento
              </PrimaryButton>
              <Spacer height={30} />
              <AppText style={styles.txt}>Deseja cancelar?</AppText>
              <Spacer height={10} />
              <SecondaryButton onPress={comebackPage}>Voltar</SecondaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackGroundComp>
  );
};

export default CriarEvento;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    img: {
      marginVertical: 20,
      marginTop: 0,
      maxWidth: "100%",
      alignSelf: "center",
    },
    txt: {
      fontFamily: Fonts.otherFonts.dongleBold,
      color: theme.text,
      fontWeight: "500",
      fontSize: 18,
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 10,
      fontFamily: Fonts.otherFonts.dongleBold,
    },
  });
