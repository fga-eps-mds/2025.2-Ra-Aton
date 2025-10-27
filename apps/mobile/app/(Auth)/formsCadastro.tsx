import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Logo from "@/assets/img/Logo_1_Atom.png";
import { Fonts } from "@/constants/Fonts";
import Spacer from "@/components/SpacerComp";
import { useTheme } from "@/constants/Theme";
import BackGroundComp from "@/components/BackGroundComp";
import { DarkTheme } from "@react-navigation/native";

const FormsCadastro: React.FC = () => {
  return <FormsCadastroInner />;
};

const FormsCadastroInner: React.FC = () => {
  const router = useRouter();
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline";
  const styles = makeStyles(theme);
  const underLineColor = isDarkMode ? '#F9F8F8' : '#121212'; 
  const comebackPage = () => {
    router.push("/(Auth)/cadastro");
  };

  return (
    <BackGroundComp>
      <ScrollView contentContainerStyle={{padding: 20,paddingBottom: 80,backgroundColor: theme.background,flexGrow: 1,}}>
        <PrimaryButton iconName={iconTheme} onPress={toggleDarkMode} style={{ width: 40, height: 40, padding: 0, margin:0, alignSelf:'flex-end', alignContent:'center', justifyContent:'center', alignItems:'center', marginBottom: 20 }}>
              <Text style={[{ fontWeight: "700", fontSize: 30, alignContent:'center', justifyContent:'center', alignItems:'center' }]}>

              </Text>
            </PrimaryButton> 
        <Image source={Logo} style={styles.img}/>
        <View style={styles.container}>
          <View style={styles.txtInfo}>
            <Text style={styles.txt}>Para finalizar o seu cadastro,  responda este formulário e participe ativamente da sua comunidade!</Text>  
          </View>
          <View style={styles.containerBtns}>
            <Text style={styles.txt}>Selecione seu perfil</Text>
            <Spacer height={30}/>
            <PrimaryButton>Atlética</PrimaryButton>
            <Spacer height={40}/>
            <PrimaryButton>Jogador</PrimaryButton>
            <Spacer height={40}/>
            <PrimaryButton>Torcedor</PrimaryButton>
            <Spacer height={40}/>
          </View>
          <Spacer height={20}/>
          <SecondaryButton style={styles.BtnSkip} decoration={{textDecorationLine:'underline', textDecorationColor: theme.text}}>Pular esta etapa</SecondaryButton>
        </View>
      </ScrollView>
    </BackGroundComp>
  );  
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
  img:{
      marginVertical: 20,
      marginTop: 0,
      maxWidth: "100%",
      alignSelf: "center",
  },
  container:{
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
      // backgroundColor: 'blue',
  },
  txtInfo:{
      marginTop:15,
      height:100,
      width:'100%',
      // backgroundColor:'green'
  },
  txt:{
    alignSelf: 'center',
    textAlign:'center',
    width: '100%',
    color: theme.text,
    fontFamily: Fonts.primaryFont.dongleRegular ,
    fontWeight: "500",
    fontSize: 35,
    lineHeight: 24,
  },
  containerBtns:{
    marginTop:20,
    // backgroundColor:'red',
    flexDirection: "column",
    alignItems: "center",
    width:'100%',
  },

  txtSkipRegister:{
    color:Colors.light.gray,
    textDecorationLine:'underline' ,  
  },
  BtnSkip:{
     backgroundColor:'transparent',
    // textDecorationLine:'underline',
    // textDecorationColor: theme.txt,   
  }  
});
export default FormsCadastro;
