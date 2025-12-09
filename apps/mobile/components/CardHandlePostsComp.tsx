import React from "react";
import { View, Text ,StyleSheet, Pressable} from "react-native";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";

interface CardHandlePostsProps {
    title?: string,

    showInfos?: () => void,
    showTotalAttendance?: () => void,
    showComments?: () => void,
}

export const CardHandlePostComp : React.FC<CardHandlePostsProps> = ({
    title,
    showInfos,
    showTotalAttendance,
    showComments,
}) => {
    return(
        <View style={styles.cardContainer}>
           <View style={styles.headerCard}>
            <AppText style={styles.txtTitle}>
                TITULO DO EVENTO
            </AppText>
            <Pressable>
            <Ionicons name="ellipsis-vertical-sharp" color={Colors.dark.orange} size={20}/>

            </Pressable>
            </View>
           
           <Pressable style={styles.btnCard}>
                
           </Pressable>

        </View>


    )
}


const styles= StyleSheet.create({
    
    cardContainer:{
        width:500,
        height:100,

        backgroundColor:Colors.dark.input,
        borderRadius:15,
        // borderRadius:10,

    },
    txtTitle:{
        fontSize:30,
        color:Colors.dark.orange,
    },

    headerCard:{
        width:'100%',
        height:40,
        paddingHorizontal:15,
        paddingVertical:10,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        

    },

    btnCard:{

    }

})