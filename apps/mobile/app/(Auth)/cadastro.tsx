/* cadastro page */
import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import NamedLogo from "../../assets/img/Logo_1_Atom.png";
import ThemedView from "../../components/ThemedView";
import Button1Comp from "../../components/Button1Comp";
import Button2Comp from "../../components/Button2Comp";
import { useRouter } from "expo-router";
import Spacer from "../../components/SpacerComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";

const Cadastro: React.FC = () => {
  return <CadastroInner />;
};

const CadastroInner: React.FC = () => {
//  Para usar o DarkMode
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
//  Para usar DarkMode nos styles  w
  const styles = makeStyles(theme);

//  Para usar o Link no Botao
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      
      {/* Dark/Light mode (PlaceHolder)*/}
      <Button1Comp onPress={toggleDarkMode} style={{ width: 40, height: 40, padding: 0, margin:0, alignSelf:'flex-end', alignContent:'center', justifyContent:'center', alignItems:'center', marginBottom: 20 }}>
        <Text style={[{ fontWeight: "700", fontSize: 30, alignContent:'center', justifyContent:'center', alignItems:'center' }]}>
          *
        </Text>
        </Button1Comp>
      {/* */}

      <Image source={NamedLogo} style={styles.img} />




      <Text style={styles.img}>Cadastro</Text>

    </ThemedView>
  );
};

export default Cadastro;  

const makeStyles = (theme: any) =>
  StyleSheet.create({
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