    /* cadastro page */

    import React, { useState, useEffect } from "react";
    import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform} from "react-native";
    import { Colors } from "../../constants/Colors";
    import { useTheme } from "../../constants/Theme";
    import { useRouter } from "expo-router";
    import { Fonts } from "@/constants/Fonts";
    import { Ionicons } from "@expo/vector-icons";
    
    // Imagens
    import NamedLogo from "../../assets/img/Logo_1_Atom.png";
    
    // Componentes
    import BackGroundComp from "@/components/BackGroundComp";
    import Spacer from "../../components/SpacerComp";
    import Button1Comp from "../../components/Button1Comp";
    import Button2Comp from "../../components/Button2Comp";
    import InputComp from "@/components/InputComp";

    import { registerUser } from "@/libs/auth/handleRegister";
    
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
      // const [hidePassword,setHidePassword] = useState(true);
  //--------------------------------------------------------------------------- separando...
      const verifyName = (name:string) =>{
        setErrorName('');
        
        const maxLenghtName = name.trim().split(" ").length <= 50;
        if(!maxLenghtName) return "O apelido não pode ultrapassar 50 caracteres";
        
        const verifyName = name.trim().split(" ").length >= 2; // vericação se o usuário preencher pelo menos nome e sobrenome
        if(!verifyName) return "Preencha nome e sobrenome";
        else return '';
      }


      const verifyEmail = (email:string) => {
          setErrorEmail('');

          if(email.length > 50) return "O email não pode ultrapassar 50 caracteres"
          
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

        if(userName.length > 50) return "O apelido não pode ultrapassar 50 caracteres"

        if(userName.length < 4) return "Digite um apelido válido"
        else return '';

      } 

      const verifyPassword = (password:string) => {
          setErrorPassword('');
          setErrorConfirmPassword('');

          if(password.length > 50) return "A senha não pode ultrapassar 50 caracteres"

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

          if(confirmPassword.length > 50) return "A senha não pode ultrapassar 50 caracteres"


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
      
      React.useEffect(() => {
        if (email) setBackendErrorEmail('');
      }, [email]);

      React.useEffect(() => {
        if (userName) setBackendErrorNickname('');
      }, [userName]);

      const isDisabled = !email || !password || !confirmPassword || !name || !userName || !(password === confirmPassword)? true : false; // talvez verificar os regex 1°?

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
    const [backendErrorEmail, setBackendErrorEmail] = useState('');
    const [backendErrorNickname, setBackendErrorNickname] = useState('');
    const handleRegister = async() => {
      try {
        const data = await registerUser({ name, userName, email, password });

        if (data.error) {
          console.log(data.error);
          if(data.error === "Email já registrado"){
            setBackendErrorEmail(data.error);
          }
          else if(data.error === "Username já registrado"){
            setBackendErrorNickname(data.error);
          }
          return;
        }

        console.log("Cadastro realizado com sucesso!");
        router.push("/(Auth)/login");
      } catch (error) {
        console.error("Erro:", error);
        console.log("Não foi possível conectar ao servidor.");
      }
    };

      return (
        <BackGroundComp>
             <KeyboardAvoidingView style={[{ flex: 1 }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={{padding: 20,paddingBottom: 80,backgroundColor: theme.background, flexGrow:1}}keyboardShouldPersistTaps="handled">        
            {/* <ThemedView style={styles.container}> */}
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
                <InputComp label="Nome de Usuário" iconName="person-sharp"
                 value={name} onChangeText={setName} status={!!errorName} statusText={errorName}></InputComp>
                
                <InputComp label="Apelido" iconName="pricetag-outline"
                 value={userName} onChangeText={setNickname} status={!!errorNickname || !!backendErrorNickname} statusText={errorNickname || backendErrorNickname}></InputComp>
                
                <InputComp label="E-mail" iconName="at"                               
                keyboardType="email-address" autoComplete="email" autoCapitalize="none" value={email} onChangeText={setEmail} status={!!errorEmail || !!backendErrorEmail} statusText={errorEmail || backendErrorEmail}></InputComp>
                                
                <InputComp label="Senha" iconName="key"                              
                secureTextEntry={true} textContentType="password" value={password} onChangeText={setPassword} status={!!errorPassword} statusText={errorPassword}></InputComp>
                            
                <InputComp label="Confirme sua senha" iconName="key"   
                secureTextEntry={true} textContentType="password" value={confirmPassword} onChangeText={setConfirmPassword} status={!!errorConfirmPassword} statusText={errorConfirmPassword}></InputComp>

              </View>

              <Spacer height={40}/>
              <View style={styles.redirectInfos}>
                <Button1Comp disabled={isDisabled} onPress={statusBtnCadastro}>Criar conta</Button1Comp>
                <Spacer height={30}/>
                <Text style={styles.txt}>Ja possui uma conta?</Text>
                <Spacer height={10}/>
                <Button2Comp onPress={() => router.push('/(Auth)/login')}>Login</Button2Comp>
              </View>

            </View>
        </ScrollView>
          </KeyboardAvoidingView>
         </BackGroundComp>
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
          flex:1,
          // backgroundColor: 'red',
        },
        containerInfos:{
          width:'100%',
        },

        img: {
          marginVertical: 60,
          marginTop: 0,
          height:150,
          alignSelf: 'center',
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
          // marginTop:-40,
          width:'100%',
          
        },
        redirectInfos:{
          flexDirection:'column',
          alignItems:'center',
          width:'100%',
          marginTop:10, 
        }
      });

