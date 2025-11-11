import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import PrimaryButton from "@/components/PrimaryButton";
import { Colors } from "@/constants/Colors";
import Spacer from "@/components/SpacerComp";
import { Fonts } from "@/constants/Fonts";
import { useTheme } from "@/constants/Theme";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";

export default function NovoPost() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();

  return (
    <BackGroundComp>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 80,
          backgroundColor: theme.background,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.containerBtns}>
          <AppText style={styles.txt}>Criar?...</AppText>
          <Spacer height={30} />

          <PrimaryButton onPress={() => router.push("/criarEvento")}>Criar Evento</PrimaryButton>
          <Spacer height={40} />

          <PrimaryButton onPress={() => router.push("/criarPartida")}>Criar Partida</PrimaryButton>

          <Spacer height={40} />

          <PrimaryButton onPress={() => router.push("/criarPost")}>Criar Post</PrimaryButton>

          <Spacer height={40} />
        </View>
        <Spacer height={20} />
      </ScrollView>
    </BackGroundComp>
  );
}
const makeStyles = (theme: any) =>
  StyleSheet.create({
    containerBtns: {
      flex: 1,
      marginTop: 20,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: 'center',
      // backgroundColor: 'red',
      width: "100%",
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
  });
