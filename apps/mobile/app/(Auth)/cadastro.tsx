/* cadastro page */
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
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
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80, backgroundColor: theme.background}}>
      <ThemedView style={styles.container}>
        
        {/* Dark/Light mode (PlaceHolder)*/}
        <Button1Comp onPress={toggleDarkMode} style={{ width: 40, height: 40, padding: 0, margin:0, alignSelf:'flex-end', alignContent:'center', justifyContent:'center', alignItems:'center', marginBottom: 20 }}>
          <Text style={[{ fontWeight: "700", fontSize: 30, alignContent:'center', justifyContent:'center', alignItems:'center' }]}>
            *
          </Text>
        </Button1Comp>
        {/* */}
      
        <Image source={NamedLogo} style={styles.img}/>
        
        <View style={styles.containerInfos}>
          <View style={styles.inputContainer}>
            <InputComp label="Nome de Usuário" iconName="person-sharp"></InputComp>
            <InputComp label="E-mail" iconName="at"></InputComp>
            <InputComp label="Senha" iconName="key"></InputComp>
            <InputComp label="Confirme sua senha" iconName="key"></InputComp>
          </View>
        </View>
    

      </ThemedView>
    </ScrollView>
  );
};

export default Cadastro;  

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      padding: 16,
      // backgroundColor: 'red',
    },
    containerInfos:{
      marginTop:-45,  
      height:490,
      width:'100%',
      backgroundColor:'red'
    },

    img: {
      marginVertical: 90,
      marginTop: -10,
    },
    txt: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 20,
    },

    inputContainer:{
      flexDirection:'column',
      alignItems:'center',

      height:'70%',
      width:'100%',
      backgroundColor:'green'
      
    }
    

  });