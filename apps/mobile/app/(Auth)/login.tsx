/* home page */
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import React from "react";
import NamedLogo from "../../assets/img/Logo_1_Atom.png";
import ThemedView from "../../components/ThemedView";
import Button1Comp from "../../components/Button1Comp";
import Button2Comp from "../../components/Button2Comp";
import { useRouter } from "expo-router";
import Spacer from "../../components/SpacerComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import InputComp from "@/components/InputComp";

const Home: React.FC = () => {
  return <HomeInner />;
};

const HomeInner: React.FC = () => {
  //  Para usar o DarkMode
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  //  Para usar DarkMode nos styles
  const styles = makeStyles(theme);

  //  Para usar o Link no Botao
  const router = useRouter();
  const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline";

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 80,
        backgroundColor: theme.background,
      }}
    >
      <ThemedView style={styles.container}>
        {/* Dark/Light mode (PlaceHolder)*/}
        <Button1Comp
          iconName={iconTheme}
          onPress={toggleDarkMode}
          style={{
            width: 40,
            height: 40,
            padding: 0,
            margin: 0,
            alignSelf: "flex-end",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={[
              {
                fontWeight: "700",
                fontSize: 30,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          ></Text>
        </Button1Comp>
        {/* Dark/Light mode */}
        <Image source={NamedLogo} style={styles.img} />

        <View style={styles.container_input}>
          <InputComp label="Nome de usuario" iconName="person"></InputComp>
          <Spacer height={45} />
          <InputComp
            label="Senha"
            iconName="key"
            secureTextEntry={true}
          ></InputComp>
        </View>

        <Button1Comp onPress={() => router.push("/Home")} style={{ top: 60 }}>
          <Text style={[styles.txt, { fontWeight: "700", fontSize: 24 }]}>
            Login
          </Text>
        </Button1Comp>

        <Spacer height={80} />

        <Text style={styles.txt}>ou</Text>

        <Spacer height={20} />

        <Button2Comp onPress={() => router.push("/cadastro")}>
          <Text style={[styles.txt, { fontWeight: "600", fontSize: 16 }]}>
            Cadastre-se
          </Text>
        </Button2Comp>
        {/* <TextInput style={{backgroundColor: 'red'}}></TextInput> */}
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
