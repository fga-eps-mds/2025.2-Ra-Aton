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
  Alert, // CA4: Alternativa para exibir erro
} from "react-native";
import React, { useState, useMemo } from "react";
import NamedLogo from "../../assets/img/Logo_1_Atom.png";
import ThemedView from "../../components/BackGroundComp";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { useRouter } from "expo-router";
import Spacer from "../../components/SpacerComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import InputComp from "@/components/InputComp";
import * as SecureStore from "expo-secure-store";
import { handleLogin } from "../libs/handleLogin"; // Função de login importada
//import LoginScreen from "../../app/(Auth)/teste"; // Removido (lógica integrada)

const Home: React.FC = () => {
  return <HomeInner />;
};

const HomeInner: React.FC = () => {
  // Configurações de Tema e Rota (mantidas)
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();
  const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline";

  // --- Início da Lógica de Login (integrada) ---

  // CA1: Estados para e-mail e senha
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // CA5: Estado de Loading
  const [isLoading, setIsLoading] = useState(false);

  // CA4: Estado de Mensagem de erro
  const [error, setError] = useState<string | null>(null);

  // CA2: Validação de formato de e-mail
  const validateEmail = (text: string) => {
    // Regex simples para validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const isEmailValid = useMemo(() => validateEmail(email), [email]);
  const isPasswordValid = useMemo(() => password.length > 0, [password]); // CA1: Obrigatório

  // CA3: Botão desativado
  const isButtonDisabled = useMemo(() => {
    // Desativado se estiver carregando ou se os campos forem inválidos
    return isLoading || !isEmailValid || !isPasswordValid;
  }, [email, password, isLoading, isEmailValid, isPasswordValid]);

  const sendLogin = () =>{
    console.log("Enviando dados do login...")
    handleLogin(email, password);
  }
  // --- Fim da Lógica de Login ---

  // >>> Inicio da logica de recuperar a senha <<<

  // >>> Fim da logica de recuperar a senha <<<

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 80,
        backgroundColor: theme.background,
      }}
      keyboardShouldPersistTaps="handled" // Ajuda a fechar o teclado ao tocar fora
    >
      <ThemedView style={styles.container}>
        {/* Dark/Light mode (PlaceHolder)*/}
        <PrimaryButton
          iconName={iconTheme}
          onPress={toggleDarkMode}
          style={styles.toggleButton} // Estilo extraído
        >
          {/* Removido o <Text> vazio de dentro do botão de tema */}
        </PrimaryButton>
        {/* Dark/Light mode */}
        <Image source={NamedLogo} style={styles.img} />

        <View style={styles.container_input}>
          {/* CA1: Campo de E-mail */}
          <InputComp
            label="E-mail" // Label corrigido
            iconName="person" // Recomendo usar 'mail-outline' ou 'at' se disponível
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Spacer height={45} />

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
          <Spacer height={20} />
          <Text style={styles.forgotPasswordText}>
            Esqueci minha senha
          </Text>
        </TouchableOpacity>

        {/* CA4: Exibição de Erro */}
        {error && <Text style={styles.errorText}>{error}</Text>}

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
      </ThemedView>
    </ScrollView>
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
      marginTop: "10%",
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
  });
