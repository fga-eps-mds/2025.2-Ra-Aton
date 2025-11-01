/* cadastro page */

import React, { useState } from "react";
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
import Button1Comp from "@/components/PrimaryButton";
import Button2Comp from "@/components/SecondaryButton";
import InputComp from "@/components/InputComp";

import { registerUser } from "@/libs/auth/handleRegister";

import { verifyName, verifyNickname, verifyEmail, verifyPassword, verifyConfirmPassword } from "@/libs/validation/registerValidation";

const Cadastro: React.FC = () => {
  return <CadastroInner />;
};

const CadastroInner: React.FC = () => {
  const router = useRouter();

  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorNickname, setErrorNickname] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [backendErrorEmail, setBackendErrorEmail] = useState("");
  const [backendErrorNickname, setBackendErrorNickname] = useState("");

  React.useEffect(() => {
    if (name) setErrorName(verifyName(name));
    if (email) setErrorEmail(verifyEmail(email));
    if (password) setErrorPassword(verifyPassword(password));
    if (confirmPassword) setErrorConfirmPassword(verifyConfirmPassword(password, confirmPassword));
    if (userName) setErrorNickname(verifyNickname(userName));
  }, [name, email, password, confirmPassword, userName]);

  React.useEffect(() => {
    if (email) setBackendErrorEmail("");
  }, [email]);

  React.useEffect(() => {
    if (userName) setBackendErrorNickname("");
  }, [userName]);

  const isDisabled = !(email && !verifyPassword(password) && name && userName && !verifyConfirmPassword(password, confirmPassword));
  const statusBtnCadastro = async () => {
    const errName = verifyName(name);
    const errEmail = verifyEmail(email);
    const errPassword = verifyPassword(password);
    const errConfirmrPassword = verifyConfirmPassword(password, confirmPassword);
    const errNickname = verifyNickname(userName);
    setErrorName(errName);
    setErrorEmail(errEmail);
    setErrorPassword(errPassword);
    setErrorConfirmPassword(errConfirmrPassword);
    setErrorNickname(errNickname);

    if (
      !errName &&
      !errNickname &&
      !errEmail &&
      !errPassword &&
      !errConfirmrPassword
    ) {
      console.log("Credenciais Validas");
      await handleRegister();
    }
  };

  const handleRegister = async () => {
    try {
      const data = await registerUser({ name, userName, email, password });

      if (data.error) {
        console.log(data.error);
        if (data.error === "Email já registrado") {
          setBackendErrorEmail(data.error);
        } else if (data.error === "Username já registrado") {
          setBackendErrorNickname(data.error);
        }
        return;
      }

      console.log("Cadastro realizado com sucesso!");
      router.push("/(Auth)/login");
    } catch (error) {
      console.error("Erro:", error);
      console.log("Não foi possível conectar ao servidor.");
    }
  };

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
              <InputComp
                label="Nome completo"
                iconName="person-sharp"
                value={name}
                onChangeText={setName}
                status={!!errorName}
                statusText={errorName}
              ></InputComp>

              <InputComp
                label="Nome de usuário"
                iconName="pricetag-outline"
                value={userName}
                onChangeText={setNickname}
                status={!!errorNickname || !!backendErrorNickname}
                statusText={errorNickname || backendErrorNickname}
              ></InputComp>

              <InputComp
                label="E-mail"
                iconName="at"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                status={!!errorEmail || !!backendErrorEmail}
                statusText={errorEmail || backendErrorEmail}
              ></InputComp>

              <InputComp
                label="Senha"
                iconName="key"
                secureTextEntry={true}
                textContentType="password"
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                status={!!errorPassword}
                statusText={errorPassword}
              ></InputComp>

              <InputComp
                label="Confirme sua senha"
                iconName="key"
                secureTextEntry={true}
                textContentType="password"
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                status={!!errorConfirmPassword}
                statusText={errorConfirmPassword}
              ></InputComp>
            </View>

            <Spacer height={40} />
            <View style={styles.redirectInfos}>
              <Button1Comp disabled={isDisabled} onPress={statusBtnCadastro}>
                Criar conta
              </Button1Comp>
              <Spacer height={30} />
              <Text style={styles.txt}>Ja possui uma conta?</Text>
              <Spacer height={10} />
              <Button2Comp onPress={() => router.push("/(Auth)/login")}>
                Login
              </Button2Comp>
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
    bg: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 16,
    },
    container: {
      alignItems: "center",
      flex: 1,
    },
    containerInfos: {
      width: "100%",
    },

    img: {
      marginVertical: 20,
      marginTop: 0,
      maxWidth: "100%",
      alignSelf: "center",
    },
    txt: {
      fontFamily: Fonts.primaryFont.dongleBold,
      color: theme.text,
      fontWeight: "500",
      fontSize: 18,
    },

    inputContainer: {
      flexDirection: "column",
      alignItems: "center",
      // marginTop:-40,
      width: "100%",
    },
    redirectInfos: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      marginTop: 10,
    },
  });
