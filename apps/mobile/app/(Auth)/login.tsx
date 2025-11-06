/* home page */
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React from "react";
import NamedLogo from "../../assets/img/Logo_1_Atom.png";
import BackGroundComp from "../../components/BackGroundComp";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import Spacer from "../../components/SpacerComp";
import InputComp from "@/components/InputComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Fonts";
import { useLoginForm } from "@/libs/hooks/useLoginForm";
import AppText from "@/components/AppText";

const Home: React.FC = () => {
  return <HomeInner />;
};

const HomeInner: React.FC = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();

  const {
    formData,
    setFormData,
    isLoading,
    error,
    isButtonDisabled,
    handleSubmit,
  } = useLoginForm();

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
          keyboardShouldPersistTaps="handled" // Ajuda a fechar o teclado ao tocar fora
        >
          <Image source={NamedLogo} style={styles.img} />
          <View style={styles.container_input}>
            {/* CA1: Campo de E-mail */}
            <InputComp
              label="E-mail"
              iconName="person"
              value={formData.email}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              placeholder="usuario@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* CA1: Campo de Senha */}
            <InputComp
              placeholder="Digite a senha"
              label="Senha"
              iconName="key"
              secureTextEntry={true}
              value={formData.password}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, password: text }))
              }
              autoCapitalize="none"
            />
          </View>

          {/* CA8: Link "Esqueci minha senha" */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}

            /* TODO: Adicionar navegação para fluxo de recuperação */
          >
            <AppText style={styles.forgotPasswordText}>Esqueci minha senha</AppText>
          </TouchableOpacity>

          {/* CA4: Exibição de Erro */}
          {error && <AppText style={styles.errorText}>{error}</AppText>}
          <View style={styles.centeredView}>
            {/* CA5: Indicador de Loading */}
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={theme.orange}
                style={{ marginTop: 60 }}
              />
            ) : (
              /* CA3: Botão Entrar com estado 'disabled' */
              <PrimaryButton
                onPress={handleSubmit}
                style={{ top: 60 }}
                disabled={isButtonDisabled}
                testID="botaoLogin"
              >
                Login
              </PrimaryButton>
            )}

            <Spacer height={80} />
            <AppText style={styles.txt}>ou</AppText>
            <Spacer height={20} />

            <SecondaryButton onPress={() => router.push("/cadastro")}>
              Cadastre-se
            </SecondaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackGroundComp>
  );
};

export default Home;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    img: {
      marginVertical: 90,
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
    container_input: {
      flexDirection: "column",
      alignItems: "center",
      marginTop: -20,
      height: "auto",
      width: "100%",
    },
    // Estilos do botão de tema (extraídos)
    toggleButton: {
      width: 40,
      height: 40,
      padding: 0,
      margin: 0,
      alignSelf: "flex-end",
      alignContent: "center",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    // CA4: Estilo da Mensagem de Erro
    errorText: {
      color: "red", // TODO: Usar cor de erro do Design System
      marginTop: 10,
      marginBottom: -40, // Compensa o 'top: 60' do botão
      textAlign: "center",
      fontSize: 14,
      fontWeight: "500",
    },
    // CA8: Estilos do "Esqueci minha senha"
    forgotPasswordButton: {
      alignSelf: "flex-end",
      marginTop: 10,
      marginRight: 10, // Ajuste conforme seu InputComp
    },
    forgotPasswordText: {
      color: theme.orange, // TODO: Usar cor de link do Design System
      fontSize: 14,
      fontWeight: "500",
    },

    // (Estilos inputDiv, inputLabel, inputBox não parecem estar sendo usados, mantidos)
    inputDiv: {
      backgroundColor: "blue",
      width: "85%",
      justifyContent: "flex-start",
      alignItems: "center",
      padding: 0,
    },
    inputLabel: {
      width: "100%",
      marginLeft: 34,
    },
    inputBox: {
      width: "100%",
      height: 40,
      borderRadius: 34,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.orange,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: 34,
    },
    centeredView: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
  });
