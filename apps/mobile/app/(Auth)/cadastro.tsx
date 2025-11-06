/* cadastro page */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Fonts";

// Imagens
import NamedLogo from "@/assets/img/Logo_1_Atom.png";

// Componentes
import BackGroundComp from "@/components/BackGroundComp";
import Spacer from "@/components/SpacerComp";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { RegisterForm } from "@/components/RegisterForm";
import { useRegisterForm } from "@/libs/hooks/useRegisterForm";

const Cadastro: React.FC = () => {
  return <CadastroInner />;
};

const CadastroInner: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  
  const {
    formData,
    errors,
    isDisabled,
    setFormData,
    handleSubmit
  } = useRegisterForm();

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

          <Image source={NamedLogo} style={styles.img} />

          <View style={styles.containerInfos}>
            <View style={styles.inputContainer}>
              <RegisterForm
                formData={formData}
                errors={errors}
                setFormData={setFormData}
              />
            </View>

            <Spacer height={40} />
            <View style={styles.redirectInfos}>
              <PrimaryButton disabled={isDisabled} onPress={handleSubmit}>
                Criar conta
              </PrimaryButton>
              <Spacer height={30} />
              <Text style={styles.txt}>Ja possui uma conta?</Text>
              <Spacer height={10} />
              <SecondaryButton onPress={() => router.push("/(Auth)/login")}>
                Login
              </SecondaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackGroundComp>
  );
};

export default Cadastro;

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
