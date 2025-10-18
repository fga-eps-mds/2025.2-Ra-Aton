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
  const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline"; //? Bora usar isso para ficar trocando o icone do darkMode e vice-versa
                                                                          //? Mas tem a opção de criar um componente só para o botão de darkmode
                                                                              //? Seria menos exaustivo, mas voce que escolhe qual é a boa

  return (
      <ThemedView style={styles.bg}>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80, backgroundColor: theme.background}}>
      <ThemedView style={styles.container}>
        
        {/* Dark/Light mode (PlaceHolder)*/}
        <Button1Comp iconName={iconTheme} onPress={toggleDarkMode} style={{ width: 40, height: 40, padding: 0, margin:0, alignSelf:'flex-end', alignContent:'center', justifyContent:'center', alignItems:'center', marginBottom: 20 }}>
          <Text style={[{ fontWeight: "700", fontSize: 30, alignContent:'center', justifyContent:'center', alignItems:'center' }]}>

          </Text>
        </Button1Comp>
        {/* */}

        <Image source={NamedLogo} style={styles.img}/>
        
        <View style={styles.containerInfos}>
          <View style={styles.inputContainer}>
            <InputComp label="Nome de Usuário" iconName="person-sharp"></InputComp>
            <Spacer height={40}/>
            <InputComp label="E-mail" iconName="at"></InputComp>
            <Spacer height={40}/>
            <InputComp label="Senha" iconName="key"></InputComp>
            <Spacer height={40}/>
            <InputComp label="Confirme sua senha" iconName="key"></InputComp>
          </View>
          
          <View style={styles.redirectInfos}>
            <Button1Comp onPress={() => router.push('/(DashBoard)/Home')}>Criar conta</Button1Comp>
            <Spacer height={45  }/>
            <Text style={styles.txt}>Ja possui uma conta?</Text>
            <Spacer height={8}/>
            <Button2Comp onPress={()=> router.push('/(Auth)/login')}>Login</Button2Comp>
          </View>

        </View>
    

      </ThemedView>
    </ScrollView>
    </ThemedView>
  );
};

export default Cadastro;  
const makeStyles = (theme: any) =>
  StyleSheet.create({
    bg: {
      flex:1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      alignItems: "center",
      padding: 16,
      // backgroundColor: 'red',
    },
    containerInfos:{
      height:'100%',
      width:'100%',
      // backgroundColor: 'blue',
    },

    img: {
      marginVertical: 60,
      marginTop: 0,
      height:'20%',
    },
    txt: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 18,
    },

    inputContainer:{
      flexDirection:'column',
      alignItems:'center',

      height:'70%',
      width:'100%',
      
    },
    redirectInfos:{
      flexDirection:'column',
      justifyContent:'flex-start',
      alignItems:'center',

      height:'30%',
      width:'100%',

    }
    

  });