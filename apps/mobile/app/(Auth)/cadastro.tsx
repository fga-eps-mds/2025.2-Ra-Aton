    /* cadastro page */
    import React, { useState, useEffect } from "react";
    import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity} from "react-native";
    import ThemedView from "../../components/ThemedView";
    import Spacer from "../../components/SpacerComp";
    import Button1Comp from "../../components/Button1Comp";
    import Button2Comp from "../../components/Button2Comp";
    import InputComp from "@/components/InputComp";
    import NamedLogo from "../../assets/img/Logo_1_Atom.png";
    import { Colors } from "../../constants/Colors";
    import { useTheme } from "../../constants/Theme";
    import { useRouter } from "expo-router";
    import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";

import { registerUser } from "@/libs/handleRegister";
    
    const Cadastro: React.FC = () => {
      return <CadastroInner />;
    };
    
    
    const CadastroInner: React.FC = () => {
      const router = useRouter();
      
      //  Para usar o DarkMode
      const { isDarkMode, toggleDarkMode } = useTheme();
      const theme = isDarkMode ? Colors.dark : Colors.light;
      const styles = makeStyles(theme);
      const [name, setName] = useState(''); 
      const [email, setEmail] = useState('');
      const [userName, setNickname] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [errorName, setErrorName] = useState('');
      const [errorEmail, setErrorEmail] = useState('');
      const [errorNickname, setErrorNickname] = useState('');
      const [errorPassword, setErrorPassword] = useState('');
      const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
      const [hidePassword,setHidePassword] = useState(true);
  //--------------------------------------------------------------------------- separando...
      const verifyName = (name:string) =>{
        setErrorName('');
        const verifyName = name.trim().split(" ").length >= 2; // vericação se o usuário preencher pelo menos nome e sobrenome
        if(!verifyName) return "Preencha nome e sobrenome";
        else return '';
      }


      const verifyEmail = (email:string) => {
          setErrorEmail('');
          const validEmail = (/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/); 
          
          if(validEmail.test(email) == false){
            return "Insira um email válido"; 
          }
          else{
            return '';
          }
        }

      const verifyNickname = (userName:string) => {
        setErrorNickname('');
        if(userName.length < 3) return "Digite um apelido válido"
        else return '';

      } 

      const verifyPassword = (password:string) => {
          setErrorPassword('');
          setErrorConfirmPassword('');
          const validPassword = (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/); // (rodrigo) - regex que verifica : numero e letra
          if(password.length < 8){
              return "Sua senha deve possuir no mínimo 8 caracteres"; // Fazer uma estilização no input
                                                                  // * Talvez um check
          }
          if(validPassword.test(password) == false){
            return "Sua senha deve conter letras e números"; // Fazer uma estilização no input
          }
          else{
            return '';
          }
        }

        const verifyConfirmPassword = (password:string, confirmPassword:string) => {
          if(password != confirmPassword){
            return "As senhas não coincidem";
          }
          else{ 
            return '';
          }
        }
    
      React.useEffect(() => {
        if(name) setErrorName(verifyName(name));
        if(email) setErrorEmail(verifyEmail(email));
        if(password) setErrorPassword(verifyPassword(password));
        if(confirmPassword) setErrorConfirmPassword(verifyConfirmPassword(password,confirmPassword));
        if(userName) setErrorNickname(verifyNickname(userName));
      },[name,email,password,confirmPassword,userName]);

      const isDisabled = !email || !password || !confirmPassword;

      const statusBtnCadastro = () => {
        const errName = verifyName(name);
        const errEmail = verifyEmail(email);
        const errPassword = verifyPassword(password);
        const errConfirmrPassword = verifyConfirmPassword(password,confirmPassword);
        const errNickname = verifyNickname(userName);
        setErrorName(errName);
        setErrorEmail(errEmail);
        setErrorPassword(errPassword);
        setErrorConfirmPassword(errConfirmrPassword);
        setErrorNickname(errNickname);

      //  Para usar DarkMode nos styles  

      //  Para usar o Link no Botao
      const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline"; 
    
      if(!errName && !errNickname && !errEmail && !errPassword && !errConfirmrPassword){      
          // router.push("/(Auth)/formsCadastro")
          console.log("Credenciais Validas");
          handleRegister()
      }
    }
    // Função para mandar os dados do registro para o BackEnd
    const handleRegister = async () => {
      //const profileType = "NONE";
      try {
        await registerUser({ name, userName, email, password });
        console.log("Cadastro realizado");
        router.push("/(Auth)/login");
      }catch (error : any) {
        console.log(error.message);
      }

    };

      return (
        <ThemedView style={styles.bg}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>        
            <ThemedView style={styles.container}>
            {/* Dark/Light mode (PlaceHolder)*/}
             {/*<Button1Comp iconName={iconTheme} onPress={toggleDarkMode} style={{ width: 40, height: 40, padding: 0, margin:0, alignSelf:'flex-end', alignContent:'center', justifyContent:'center', alignItems:'center', marginBottom: 20 }}>
              <Text style={[{ fontWeight: "700", fontSize: 30, alignContent:'center', justifyContent:'center', alignItems:'center' }]}>

              </Text>
            </Button1Comp>
            */} 
            {/* */}

            <Image source={NamedLogo} style={styles.img}/>
            
            <View style={styles.containerInfos}>
              <View style={styles.inputContainer}>
                <InputComp label="Nome de Usuário" iconName="person-sharp" value={name} onChangeText={setName} status={!!errorName} statusText={errorName}></InputComp>
                <Spacer height={40}/>
                
                <InputComp label="Apelido" iconName="pricetag-outline" value={userName} onChangeText={setNickname} status={!!errorNickname} statusText={errorNickname}></InputComp>
                
                <Spacer height={40}/>

                <InputComp label="E-mail" iconName="at"                               // ? email
                keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} status={!!errorEmail} statusText={errorEmail}></InputComp>
                
                <Spacer height={50}/>
                
                <InputComp label="Senha" iconName="key"                               // ? senha
                secureTextEntry={true} textContentType="password" value={password} onChangeText={setPassword} status={!!errorPassword} statusText={errorPassword}>
                  <TouchableOpacity> <Ionicons name="eye" color={'black'} size={20}/> </TouchableOpacity>
                </InputComp>
                
                <Spacer height={60}/>                  
            
                <InputComp label="Confirme sua senha" iconName="key"   //? Confrima senha
                secureTextEntry={true} textContentType="password" value={confirmPassword} onChangeText={setConfirmPassword} status={!!errorConfirmPassword} statusText={errorConfirmPassword}></InputComp>
                <Spacer height={50}/>
              </View>
              <View style={styles.redirectInfos}>
                {/* <Spacer height={20}/>  */}
                <Button1Comp disabled={isDisabled} onPress={statusBtnCadastro}>Criar conta</Button1Comp>
                <Spacer height={30}/>
                <Text style={styles.txt}>Ja possui uma conta?</Text>
                <Spacer height={10}/>
                <Button2Comp onPress={() => router.push('/(Auth)/login')}>Login</Button2Comp>
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
        scrollContainer:{
          flexGrow:1,
          justifyContent:'center',
          padding:16 
        },
        container: {
          alignItems: "center",
          width:'100%'
          // backgroundColor: 'red',
        },
        containerInfos:{
          width:'100%',
        },

        img: {
          marginVertical: 60,
          marginTop: 0,
          height:150,
        },
        txt: {
          fontFamily:Fonts.primaryFont.dongleBold,
          color: theme.text,
          fontWeight: "500",
          fontSize: 18,
        },

        inputContainer:{
          flexDirection:'column',
          alignItems:'center',
          marginTop:-40,
          width:'100%',
          
        },
        redirectInfos:{
          flexDirection:'column',
          alignItems:'center',
          width:'100%',
          marginTop:10, 
        }
      });
