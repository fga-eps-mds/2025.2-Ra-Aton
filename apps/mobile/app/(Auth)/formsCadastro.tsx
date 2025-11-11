import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { Colors } from "@/constants/Colors";
import Logo from "@/assets/img/Logo_1_Atom.png";
import { Fonts } from "@/constants/Fonts";
import Spacer from "@/components/SpacerComp";
import { useTheme } from "@/constants/Theme";
import BackGroundComp from "@/components/BackGroundComp";
import { useFormsCadastro } from "@/libs/hooks/useFormsCadastro";
import AppText from "@/components/AppText";

//function redirecionar() {
//  console.log("Redirecionar chamado");
//  router.push("../(DashBoard)/(tabs)/FeedScreen");
//}

const FormsCadastro: React.FC = () => {
  return <FormsCadastroInner />;
};

const FormsCadastroInner: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const { loading, sendType, comebackPage } = useFormsCadastro();

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
            <AppText style={styles.txt}>
              Para finalizar o seu cadastro, responda este formulário e
              participe ativamente da sua comunidade!
            </AppText>
          </View>
          <View style={styles.containerBtns}>
            <AppText style={styles.txt}>Selecione seu perfil</AppText>
            <Spacer height={30} />
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.orange}
                style={{ marginTop: 60 }}
              />
            ) : (
              <PrimaryButton onPress={() => sendType("ATLETICA")}>
                Atlética
              </PrimaryButton>
            )}
            <Spacer height={40} />
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.orange}
                style={{ marginTop: 60 }}
              />
            ) : (
              <PrimaryButton onPress={() => sendType("JOGADOR")}>
                Jogador
              </PrimaryButton>
            )}
            <Spacer height={40} />
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.orange}
                style={{ marginTop: 60 }}
              />
            ) : (
              <PrimaryButton onPress={() => sendType("TORCEDOR")}>
                Torcedor
              </PrimaryButton>
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
            <SecondaryButton
              onPress={() => router.replace("/(DashBoard)/Home")}
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
    txt: {
      alignSelf: "center",
      textAlign: "center",
      width: "100%",
      color: theme.text,
      fontFamily: Fonts.otherFonts.dongleBold,
      fontWeight: "500",
      fontSize: 30,
      lineHeight: 24,
    },
    container: {
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
    },
    txtInfo: {
      marginTop: 15,
      height: 100,
      width: "100%",
    },
    containerBtns: {
      marginTop: 20,
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    BtnSkip: {
      backgroundColor: "transparent",
    },
  });
export default FormsCadastro;
