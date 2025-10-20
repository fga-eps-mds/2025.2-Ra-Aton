  /* cadastro page */
  import React, { useState } from "react";
  import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
  import ThemedView from "../../components/ThemedView";
  import Spacer from "../../components/SpacerComp";
  import Button1Comp from "../../components/Button1Comp";
  import Button2Comp from "../../components/Button2Comp";
  import InputComp from "@/components/InputComp";
  import NamedLogo from "../../assets/img/Logo_1_Atom.png";
  import { Colors } from "../../constants/Colors";
  import { useTheme } from "../../constants/Theme";
  import { useRouter } from "expo-router";

  const Cadastro: React.FC = () => {
    return <CadastroInner />;
  };

//! Consts especificas dos inputs - Validação
 

  const CadastroInner: React.FC = () => {
  //  Para usar o DarkMode
    const { isDarkMode, toggleDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;
    // Criando nossos estados para validar
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Estados para validar erros
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [errorConfirmPassword, setErrorConfirmPassword] = useState('');









// (rodrigo) - logica para validar a criação da conta - não vou utilizar json, para enviar respostas ao back, por enquanto... 
    const verifyAccount = () => {
      setErrorEmail('');
      setErrorPassword('');
      setErrorConfirmPassword('');
      let status = true;
     
      //! Verificando o EMAIL
      const verifyEmail = (email:string) => {
        setErrorEmail('');
        const validEmail = (/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/); // (rodrigo) - regex que verifica : formato de email
        
        if(validEmail.test(email) == false){
          return "insira um email válido"; // Fazer uma estilização no input
        }
        else{
          return '';
        }
      }
      
      // ! Verificando a SENHA
      const verifyPassword = (password:string) => {
        setErrorPassword('');
        setErrorConfirmPassword('');
        const validPassword = (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/); // (rodrigo) - regex que verifica : numero e letra
        if(password.length < 8){
            return "Sua senha deve possuir no mínimo 8 caracteres."; // Fazer uma estilização no input
                                                                // * Talvez um check
        }
        if(validPassword.test(password) == false){
          return "Sua senha deve conter letras e números."; // Fazer uma estilização no input
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
      const emailError = verifyEmail(email);
      const passwordError = verifyPassword(password);
      const confirmError = verifyConfirmPassword(password, confirmPassword);

      setErrorEmail(emailError);
      setErrorPassword(passwordError);
      setErrorConfirmPassword(confirmError);

      // console.log(emailError, passwordError, confirmError);
        if (!emailError && !passwordError && !confirmError) {
          router.push('/(DashBoard)/Home');
        }
      // router.push('/(Auth)/login')      
    }














  //  Para usar DarkMode nos styles  
    const styles = makeStyles(theme);

  //  Para usar o Link no Botao
    const router = useRouter();
    const iconTheme = isDarkMode ? "sunny-outline" : "moon-outline";


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
              <Spacer height={45}/>

              <InputComp label="E-mail" iconName="at"                               // ! email
              keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} status={!!errorEmail} statusText={errorEmail}></InputComp>
              
              <Spacer height={45}/>
              
              <InputComp label="Senha" iconName="key"                               // ! senha
              secureTextEntry={true} textContentType="password" value={password} onChangeText={setPassword} status={!!errorPassword} statusText={errorPassword}></InputComp>
              
              <Spacer height={45}/>                  
           
              <InputComp label="Confirme sua senha" iconName="key"                  //! Confrima senha
              secureTextEntry={true} textContentType="password"  value={confirmPassword} onChangeText={setConfirmPassword} status={!!errorConfirmPassword} statusText={errorConfirmPassword}></InputComp>
           
            </View>
            <View style={styles.redirectInfos}>
              <Button1Comp onPress={verifyAccount}>Criar conta</Button1Comp>
              <Spacer height={15}/>
              <Text style={styles.txt}>Ja possui uma conta?</Text>
              <Spacer height={9}/>
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
        marginTop:-20,
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