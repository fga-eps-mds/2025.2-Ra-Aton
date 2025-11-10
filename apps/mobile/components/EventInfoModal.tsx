import React from "react";
import {Modal,View,Pressable, SafeAreaView,Text,StyleSheet } from "react-native"
import InputComp from "./InputComp";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/constants/Fonts";
import Spacer from "./SpacerComp";

interface  EventInfo{
    local:string,
    eventDate:string,
    hour_begins:string,
    hour_finish:string
}

interface ModalInfoEventProps{
    visible:boolean,
    onClose?: ()=>void

}

export const EventInfoModalComp: React.FC<ModalInfoEventProps> = ({visible,onClose}) =>{
    return(
        <Modal visible={visible} transparent animationType="fade" >
            <Pressable onPress={onClose} style={styles.overlayModal} >    
                <SafeAreaView style={styles.safeArea}>
                    <Pressable style={styles.containerSafe}>
                        <View style={styles.boxEventInfos}>
                            <View style={{height:50, width:'100%',justifyContent:'center', alignItems:'center'}}>
                            <Text style={{color:'white', fontFamily:Fonts.mainFont.dongleRegular, fontSize:50}}>INFORMAÇÕES</Text>
                            </View>
    
                            <InputComp></InputComp>
                        </View>

                    </Pressable>


                </SafeAreaView>



            </Pressable>




        </Modal>
    
    )
}

const styles =  StyleSheet.create({
    overlayModal:{
        flex:1, 
        backgroundColor: "rgba(0,0,0,0.5)", 
        alignItems:'center',
        justifyContent: "center"     
    },
    safeArea:{
        width:'100%'
    },
    containerSafe:{
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        height:340,
        backgroundColor: Colors.dark.background,
    },
    boxEventInfos:{
        height:'100%',
        width:300,
        backgroundColor:'green',

        borderRadius:12,
    }
    

    
})