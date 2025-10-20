import { StyleSheet, Text, View, Image, TextInput, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { router, Router, useRouter } from "expo-router";
import Button1Comp from "@/components/Button1Comp";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/img/Logo_1_Atom.png";

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
                        <Ionicons name="arrow-back" color={Colors.light.gray} size={35}/>
                    </TouchableOpacity>

                </View>
                
                <View style={styles.imageDiv}>
                    <Image source={Logo}/>
                </View>
                
                <View style={styles.containerInfos}>
                    <View style={styles.txtDiv}></View>
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
    },
    imageDiv:{
        height:200,
        width:'100%',
        backgroundColor:'green',
        justifyContent:'center',
        alignItems:'center'
    },
    containerInfos:{
        height:573,
        width:'100%',
        backgroundColor:'blue'
    },
    txtDiv:{

    }

})
export default FormsCadastro;