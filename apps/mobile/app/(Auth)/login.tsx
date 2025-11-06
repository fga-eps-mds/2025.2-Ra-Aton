/* home page */
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator, // CA5: Adicionado
  // TextInput, // Removido (usando InputComp)
  // Button, // Removido (usando Button1Comp)
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView, // CA4: Alternativa para exibir erro
} from "react-native";
import React, { useState, useMemo } from "react";
import NamedLogo from "../../assets/img/Logo_1_Atom.png";
import BackGroundComp from "../../components/BackGroundComp";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import Spacer from "../../components/SpacerComp";
import InputComp from "@/components/InputComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";

import { handleLogin } from "../../libs/login/handleLogin"; // Função de login importada
import { verifyEmail } from "@/libs/validation/userDataValidation"
import { useUser } from "@/libs/storage/UserContext";

const Home: React.FC = () => {
  return <HomeInner />;
};

const HomeInner: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();
  const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useUser();

  const isEmailValid = useMemo(() => !verifyEmail(email), [email]);

  const isPasswordValid = useMemo(() => password.length > 0, [password]);

  const isButtonDisabled = useMemo(() => {
    // Desativado se estiver carregando ou se os campos forem inválidos
    return isLoading || !isEmailValid || !isPasswordValid;
  }, [email, password, isLoading, isEmailValid, isPasswordValid]);

  const sendLogin = async () => {
    console.log("Enviando dados do login...");
    try {
      setIsLoading(true);
      setError(null);
      const data = await handleLogin(email, password);
      console.log("Resposta do servirdor. Data => ", data);

      if (data && data.token && data.user) {
        // Salva no contexto
        setUser({
          name: data.user.name,
          userName: data.user.userName,
          email: data.user.email,
          token: data.token,
          profileType: data.user.profileType ?? null,
        });
        // --- INÍCIO DA NOVA LÓGICA DE REDIRECIONAMENTO ---
        if (data.user.profileType === null || typeof data.user.profileType === "undefined") {
          // !! IMPORTANTE !!
          // Altere a rota abaixo para a rota correta do seu formulário de "novo usuário"
          router.replace("/formsCadastro");
        } else {
          // CASO 2: Usuário logado E perfil completo
          // Redireciona para a Home do Dashboard (como antes)
          router.replace("/Home");
        }
        // --- FIM DA NOVA LÓGICA ---
      } else {
        throw new Error(
          "Resposta inválida do servidor / Token não encontrado / Erro ao efetuar login"
        );
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.log("Erro no envio do formulário: ", error.message);
      Alert.alert("Erro de conexão", error.message);
      setError(error.message || "Erro desconhecido ao tentar login.");
      return;
    }
  };
  // --- Fim da Lógica de Login ---
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
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* CA8: Link "Esqueci minha senha" */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}

          /* TODO: Adicionar navegação para fluxo de recuperação */
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* CA4: Exibição de Erro */}
          {error && <Text style={styles.errorText}>{error}</Text>}
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
                onPress={sendLogin}
                style={{ top: 60 }}
                disabled={isButtonDisabled}
                testID="botaoLogin"
              >
                <Text style={[styles.txt, { fontWeight: "700", fontSize: 24 }]}>
                  Login
                </Text>
              </PrimaryButton>
            )}

            <Spacer height={80} />
            <Text style={styles.txt}>ou</Text>
            <Spacer height={20} />

            <SecondaryButton onPress={() => router.push("/cadastro")}>
              <Text style={[styles.txt, { fontWeight: "600", fontSize: 16 }]}>
                Cadastre-se
              </Text>
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
    container_input: {
      flexDirection: "column",
      alignItems: "center",
      marginTop: -20,
      height: "auto",
      width: "100%",
    },
    container: {
      flex: 1,
      alignItems: "center",
      padding: 16,
    },
    img: {
      marginVertical: 90,
      marginTop: 0,
      maxWidth: "100%",
      alignSelf: "center",
    },
    txt: {
      color: theme.text,
      fontWeight: "500",
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
    }
  });
