import { StyleSheet, Text, View, Image, TextInput, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { router, Router, useRouter } from "expo-router";
import Button1Comp from "@/components/Button1Comp";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/img/Logo_1_Atom.png";
import { Fonts } from "@/constants/Fonts";
import Spacer from "@/components/SpacerComp";

const FormsCadastro: React.FC = () => {     
    return <FormsCadastroInner/>
};

const FormsCadastroInner : React.FC = () => {
        const router = useRouter();

        const comebackPage = () => {
            router.push("/(Auth)/cadastro");
        }

    return (

        <ScrollView style={styles.scrollContainer}>
             <View style={styles.container}>

                <View style={styles.backPageDiv}>
                    <TouchableOpacity onPress={comebackPage}>
                        <Ionicons name="arrow-back" color={Colors.light.gray} size={50}/>
                    </TouchableOpacity>

                </View>
                
                <View style={styles.imageDiv}>
                    <Image source={Logo}/>
                </View>
                
                <View style={styles.containerInfos}>
                    <View style={styles.txtDiv}>
                        <View style={{height:200, width:300, alignItems:'center',justifyContent:'flex-start'}}>
                         <Text style={styles.txt}>Para finalizar o seu cadastro,  responda este formulário e participe ativamente da sua comunidade!</Text>
                            <Spacer height={30}/>
                            <Text style={{fontSize:30, fontFamily:Fonts.primaryFont.dongleRegular}}>Selecione seu perfil:</Text>
                        </View>
                    </View>
                </View>

             
             </View>



        </ScrollView>

    )

}

const styles = StyleSheet.create({
    scrollContainer:{
        flex:1,
        width:'100%'
    },

    container:{
        width:'100%'
    },
    backPageDiv:{
        height:100,
        width:"100%",
        justifyContent:'flex-end',
        marginLeft:10
    },
    imageDiv:{
        height:200,
        width:'100%',
        justifyContent:'center',
        alignItems:'center'
    },
    containerInfos:{
        height:573,
        width:'100%',
    },
    txtDiv:{
        height:200,
        width:'100%',
        marginTop:-10,
        alignItems:'center',
        justifyContent:'center',
    },
    txt:{
        fontSize:35,
        fontFamily: Fonts.primaryFont.dongleRegular,
        textAlign:'center'
    }

})
export default FormsCadastro;