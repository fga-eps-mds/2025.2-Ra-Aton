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
import ThemedView from "../../components/ThemedView";
import Button1Comp from "../../components/Button1Comp";
import Button2Comp from "../../components/Button2Comp";
import { useRouter } from "expo-router";
import Spacer from "../../components/SpacerComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import InputComp from "@/components/InputComp";
import * as SecureStore from "expo-secure-store";
import handleLogin from "../libs/handleLogin"; // Função de login importada
// import LoginScreen from "../../app/(Auth)/teste"; // Removido (lógica integrada)

const showAlert = () => {
  Alert.alert(
    "Título do Alerta",
    "Esta é a mensagem que será exibida no alerta.",
    [
      {
        text: "Cancelar",
        onPress: () => console.log("Botão Cancelar Pressionado"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => console.log("Botão OK Pressionado"),
      },
    ],
    { cancelable: false },
  );
};

// Hook para simular uma chamada de API (mantido)
const useAuth = () => {
  const login = (
    email: string,
    password: string,
  ): Promise<{ token: string }> => {
    console.log("[useAuth.login] called with", { email, password });
    return new Promise<{ token: string }>((resolve, reject) => {
      setTimeout(() => {
        if (email === "aton@exemplo.com" && password === "123456") {
          const token = "mock-jwt-token-12345";
          resolve({ token });
        } else {
          console.warn("[useAuth.login] rejecting - credenciais inválidas", {
            email,
            password,
          });
          // CA4: Erro simulado
          reject(new Error("Credenciais Inválidas"));
        }
      }, 1500); // Simula 1.5s de delay
    });
  };
  return { login };
};

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
  const { login } = useAuth();

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

  const handleLogin = async () => {
    // Prevenção extra, embora o botão deva estar desabilitado
    if (isButtonDisabled) return;

    console.log("[handleLogin] start");
    setIsLoading(true); // CA5: Ativa o loader
    setError(null); // Limpa erros anteriores

    try {
      // Usamos .trim() para limpar espaços em branco
      // usar a função importada (handleLogin.ts)
      const response = await handleLogin(email.trim(), password);
      console.log("handleLogin] login response", response);
      // renderizar response.message se houver

      // CA7: Armazenamento seguro do token
      try {
        await SecureStore.setItemAsync("userToken", response.token);
        console.log("handleLogin] Token saved to SecureStore");
      } catch (storageErr) {
        console.warn("Falha ao salvar token no SecureStore:", storageErr);
        setError("Erro ao salvar sessão. Tente novamente.");
        // Se o armazenamento falhar, não continuamos o login
        throw new Error("Falha ao salvar token");
      }

      // CA6: Redirecionamento
      // CA9: A sessão persistente será tratada pelo layout raiz
      //      que verificará o token salvo antes de renderizar esta tela.
      router.replace("/(DashBoard)/Home"); // Usamos 'replace' para não deixar o usuário voltar para o Login
      console.log("Login bem-sucedido. Token:", response.token);
    } catch (err: any) {
      console.error("handleLogin] auth error", err);

      // CA4: Exibe mensagem de erro clara
      if (err.message === "Credenciais Inválidas") {
        setError("E-mail ou senha inválidos");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }

      // Alternativa (se preferir um pop-up):
      // Alert.alert("Erro de Login", "E-mail ou senha inválidos");
    } finally {
      setIsLoading(false); // CA5: Desativa o loader
      console.log("[handleLogin] done");
    }
  };

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
        <Button1Comp
          iconName={iconTheme}
          onPress={toggleDarkMode}
          style={styles.toggleButton} // Estilo extraído
        >
          {/* Removido o <Text> vazio de dentro do botão de tema */}
        </Button1Comp>
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
          <Text style={styles.forgotPasswordText} onPress={showAlert}>
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
          <Button1Comp
            onPress={handleLogin}
            style={{ top: 60 }}
            disabled={isButtonDisabled}
            testID="botaoLogin"
          >
            <Text style={[styles.txt, { fontWeight: "700", fontSize: 24 }]}>
              Login
            </Text>
          </Button1Comp>
        )}

        <Spacer height={80} />
        <Text style={styles.txt}>ou</Text>
        <Spacer height={20} />

        <Button2Comp onPress={() => router.push("/cadastro")}>
          <Text style={[styles.txt, { fontWeight: "600", fontSize: 16 }]}>
            Cadastre-se
          </Text>
        </Button2Comp>
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
