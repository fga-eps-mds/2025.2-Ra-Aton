import React from "react";
import { View, Text, StyleSheet,Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventInfoModalComp } from "./EventInfoModal";
import { Imatches } from "@/libs/interfaces/Imatches";
import InputComp from "./InputComp";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";


interface CardMatchesProps {
    Imatches?: Imatches[],
    onPressJoinMatch?: () => void,
    onPressInfos?: () => void,
    onReloadFeed?: () => void | Promise<void>;


}

export const MatchesCard : React.FC<CardMatchesProps> = ({
    Imatches, onPressJoinMatch, onPressInfos, onReloadFeed
})  => {

    return(
        <View style={styles.container}>

            <View style={styles.BoxCardHeader}>
                <View style={{width:100, alignItems:'center'}}>
                    <View style={styles.BoxCardStatus}>
                        <Text style={styles.txt}>FINALIZADA</Text>
                    </View>
                </View>
                <View style={{width:150,height:40, marginLeft:10}}>
                        <Text style={styles.txt}>MODALIDADE COM ALGUM NOME MUITO GRANDE</Text>
                </View>
                <View style={{width:30,height:30,marginLeft:35,alignItems:'center', justifyContent:'center'}}>
                    <Ionicons name="information-circle" color={Colors.input.iconColor} size={25}/>
                </View>

                {/* <View style={styles.BoxInfos}>
                    <Text>Icone</Text>
                </View> */}
            </View>

        </View>


    )

}

const styles = StyleSheet.create({
    txt:{
        color:'white',
        textAlign:'center',
        fontFamily:Fonts.mainFont.dongleRegular
    },
    container:{
        height:150,
        width:350,
        backgroundColor:'blue',
        borderRadius:20
    },
    BoxCardHeader:{
        height:40,
        width:'100%',
        flexDirection:'row',
        alignItems:'center',

        borderTopStartRadius:15,
        borderTopEndRadius:15,
        backgroundColor:Colors.dark.gray,

        paddingHorizontal:5,
    },
    BoxCardStatus:{
        justifyContent:'center',
        alignItems:'center',
        height:25,
        width:80,
        borderRadius:20,
        backgroundColor:Colors.input.iconColor,
    },
    TextHeader:{
    }

})