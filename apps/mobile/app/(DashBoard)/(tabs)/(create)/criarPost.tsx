import React from "react";
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
import { PostFormComponent } from "@/components/PostFormComponent";

// Libs
import { postForms } from "@/libs/hooks/postForms";

const CriarPost: React.FC = () => {
  return <CriarPostInner />;
};

const CriarPostInner: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const {
    formsData,
    isDisabled,
    setFormData,
    handleSubmit,
    comebackPage,
    formError,
  } = postForms();

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
              <PostFormComponent
                formsData={formsData}
                setFormData={setFormData}
                formError={formError}
              />
            </View>

            <Spacer height={40} />
            <View style={styles.redirectInfos}>
              <PrimaryButton disabled={isDisabled} onPress={handleSubmit}>
                Criar Post
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

export default CriarPost;

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
  });
