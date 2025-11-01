import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { Colors } from "@/constants/Colors";
// import { Ionicons } from "@expo/vector-icons";
import Logo from "@/assets/img/Logo_1_Atom.png";
import { Fonts } from "@/constants/Fonts";
import Spacer from "@/components/SpacerComp";
import { useTheme } from "@/constants/Theme";
import BackGroundComp from "@/components/BackGroundComp";
import { updateProfileType } from "@/libs/auth/updateProfileType";

// import { useUser } from "@/libs/auth/userContext"; devo adicionar o context depois
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { getUserData } from "@/libs/storage/getUserData";
import { getToken } from "@/libs/storage/getToken";

interface StoredUser {
  userName: string;
  email: string;
  token: string;
  profileType?: string | null;
}
async function updateStoredUser(newData: Partial<StoredUser>) {
  const currentUser = await getUserData();
  if (!currentUser){
    console.log("Erro [getUserData], dados do usuário não encontrados...");
    return;
  } 
  const updatedUser = { ...currentUser, ...newData };
  await setStoredUser(updatedUser);
}
async function setStoredUser(user: StoredUser) {  // altera o userData
  if (Platform.OS === "web") {
    localStorage.setItem("userData", JSON.stringify(user));
  } else {
    await SecureStore.setItemAsync("userData", JSON.stringify(user));
  }
}

const FormsCadastro: React.FC = () => {
  return <FormsCadastroInner />;
};

const FormsCadastroInner: React.FC = () => {
  const router = useRouter();
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline";
  const styles = makeStyles(theme);
  const [loading, setLoading] = useState(false);
  
const SendType = async (profileType: string) => { // pega a string vinda do botão
    try {
      setLoading(true);
      const user = await getUserData();

      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado, faça login novamente.");
        router.replace("/(Auth)/login");
        return;
      }

      // Atualiza no backend
      // console.log("perfil: ", { userName: user.userName })
      const token = await getToken();
      const result = await updateProfileType({ userName: user.userName, profileType, token: token });
      if (result.error) throw new Error(result.error);

      // Atualiza localmente
      const updatedUser = { ...user, profileType };
      await updateStoredUser(updatedUser);

      console.log(`profileType atualizado para: ${profileType}`);

      // Redireciona conforme tipo
      if (profileType === "JOGADOR" || profileType === "TORCEDOR") {
        router.replace("/(DashBoard)/Home");
      } else if (profileType === "ATLETICA") {
        router.replace("/(DashBoard)/Teams");
      } else {
        router.replace("/(DashBoard)/Home");
      }
    } catch (err: any) {
      Alert.alert("Erro ao atualizar", err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const comebackPage = () => {
    router.push("/(Auth)/cadastro");
  };

  return (
    <BackGroundComp>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 80,
          backgroundColor: theme.background,
          flexGrow: 1,
        }}
      >
        <Image source={Logo} style={styles.img} accessibilityLabel="LogoAton" />
        <View style={styles.container}>
          <View style={styles.txtInfo}>
            <Text style={styles.txt}>
              Para finalizar o seu cadastro, responda este formulário e
              participe ativamente da sua comunidade!
            </Text>
          </View>
          <View style={styles.containerBtns}>
            <Text style={styles.txt}>Selecione seu perfil</Text>
            <Spacer height={30} />
            {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.orange}
            style={{ marginTop: 60 }}
          />
        ) : (
            <PrimaryButton onPress={() => SendType("ATLETICA")}>Atlética</PrimaryButton>
        )}
            <Spacer height={40} />
            {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.orange}
            style={{ marginTop: 60 }}
          />
        ) : (
            <PrimaryButton onPress={() => SendType("JOGADOR")}>Jogador</PrimaryButton>
        )}
            <Spacer height={40} />
            {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.orange}
            style={{ marginTop: 60 }}
          />
        ) : (
            <PrimaryButton onPress={() => SendType("TORCEDOR")}>Torcedor</PrimaryButton>
        )}
            <Spacer height={40} />
          </View>
          <Spacer height={20} />
          {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.orange}
            style={{ marginTop: 60 }}
          />
        ) : (
          <SecondaryButton onPress={() => router.replace("/(DashBoard)/Home")}
            style={styles.BtnSkip}
            decoration={{
              textDecorationLine: "underline",
              textDecorationColor: theme.text,
            }}
          >
            Pular esta etapa
          </SecondaryButton>
        )}
        </View>
      </ScrollView>
    </BackGroundComp>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    img: {
      marginVertical: 20,
      marginTop: 0,
      maxWidth: "100%",
      alignSelf: "center",
    },
    container: {
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
    },
    txtInfo: {
      marginTop: 15,
      height: 100,
      width: "100%",         },
    txt: {
      alignSelf: "center",
      textAlign: "center",
      width: "100%",
      color: theme.text,
      fontFamily: Fonts.mainFont.dongleRegular,
      fontWeight: "500",
      fontSize: 35,
      lineHeight: 24,
    },
    containerBtns: {
      marginTop: 20,
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },

    txtSkipRegister: {
      color: Colors.light.gray,
      textDecorationLine: "underline",
    },
    BtnSkip: {
      backgroundColor: "transparent",
    },
  });
export default FormsCadastro;
