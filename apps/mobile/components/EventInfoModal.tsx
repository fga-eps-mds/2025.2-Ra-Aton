import React from "react";
import {Modal,View,Pressable, SafeAreaView,Text,StyleSheet } from "react-native"
import InputComp from "./InputComp";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { IPost } from "@/libs/interfaces/Ipost";
import { Fonts } from "@/constants/Fonts";
import Spacer from "./SpacerComp";

interface  EventInfo{
    local:string,
    eventDate:string,
    hour_begins:string,
    hour_finish:string
}
interface ModalInfoEventProps{
    post: IPost | null,
    visible:boolean,
    onClose?: ()=>void
}

// {isEvent ? (
//         <>
//           <SpacerComp height={10} />
//           <Text style={[styles.eventInfo, { color: theme.text }]}>
//             {post.location ? `Local: ${post.location}` : ""}
//             {post.eventDate ? `  •  Início: ${new Date(post.eventDate).toLocaleString()}` : ""}
//             {post.eventFinishDate ? `  •  Fim: ${new Date(post.eventFinishDate).toLocaleString()}` : ""}
//           </Text>
//         </>
//       ) : null}
export const EventInfoModalComp: React.FC<ModalInfoEventProps> = ({post,visible,onClose}) =>{
    if(!visible || !post) return null;
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
                                    value={post?.location ?? ""}
                                    justView
                                    iconName="location"     
                                ></InputComp>
                                    <InputComp 
                                    value={post?.eventDate}
                                    formatter={(v) => (v ? new Date(v as any).toLocaleString("pt-BR", {dateStyle:"short"}): "")}
                                    justView
                                    iconName="calendar"
                                ></InputComp>
                                
                                <InputComp 
                                value={post?.eventFinishDate}
                                formatter={(v) => v ? new Date(v as any).toLocaleString("pt-BR", {hour:"2-digit", minute:"2-digit"}) : ""}
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