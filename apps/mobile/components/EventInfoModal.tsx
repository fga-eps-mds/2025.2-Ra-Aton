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
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} >
            <Pressable onPress={onClose} style={styles.overlayModal}>    
                <SafeAreaView style={styles.safeArea}>

                    <Pressable style={styles.containerSafe} onPress={()=>{}}>
                        <View style={styles.boxEventInfos}>
                            <View style={{height:50, width:'100%',justifyContent:'center', alignItems:'center'}}>
                            <Text style={{color:'white', fontFamily:Fonts.mainFont.dongleRegular, fontSize:50}}>INFORMAÇÕES</Text>
                            </View>
                            <View style={styles.boxInput}>
                                <InputComp
                                    value="Av.Não sei oque"
                                    justView
                                    iconName="location"
                                ></InputComp>
                                
                                <InputComp 
                                    value="20/03/2010"
                                    justView
                                    iconName="calendar"
                                ></InputComp>
                                
                                <InputComp 
                                value="20:00"
                                justView
                                iconName="time"
                                ></InputComp>
                            </View>
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
         backgroundColor: "rgba(15, 15, 15, 0.55)", 
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
        height:250,
    },
    boxEventInfos:{
        height:'100%',
        width:300,
        backgroundColor:Colors.dark.input,
        borderRadius:12,
    },
    boxInput:{
        height:150,
        paddingHorizontal:20,
        
        marginTop:25,
        alignItems:'center',
        justifyContent:'center',

        gap:18,
    }

    

    
})