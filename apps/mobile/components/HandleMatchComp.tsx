import React from "react";
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imatches } from "@/libs/interfaces/Imatches"; 
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import VsIconSvg from "@/assets/img/vs-icon.svg"


interface HandleMatchCompProps {
    isVisible: boolean,
    onClose: () => void,
    match?: Imatches[],  
    isChangeTeam?: boolean,
    IsNotify?: boolean,
    onPressMoreInfos?: () => void
}

export const HandleMatchComp: React.FC<HandleMatchCompProps> = ({
    isVisible, match, isChangeTeam, IsNotify, onPressMoreInfos, onClose
}) => {
    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                
                <View style={styles.BoxCardHandleMatch}>
                    
                    <View style={styles.headerCard}>
                        <View style={styles.boxSideItem}>
                            <Pressable onPress={onClose} hitSlop={10}> 
                                <Ionicons name="arrow-back" size={30} color={'white'}/>
                            </Pressable>
                        </View>

                        <View style={styles.boxTitleMatch}>
                            <Text 
                                style={styles.txtHeader} 
                                numberOfLines={2} 
                                adjustsFontSizeToFit 
                            >
                            Partida casual de [FUTEBOL DE SABÃO COM NOME GIGANTE]
                            </Text>
                        </View>

                        <View style={[styles.boxSideItem, { alignItems: 'flex-end' }]}>
                            <TouchableOpacity onPress={onPressMoreInfos}>
                            <Ionicons name="ellipsis-vertical" size={20} color={'white'}/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.contentContainer}>
                         
                         <View style={styles.BoxInfosTeams}>
                            <View style={styles.BoxTitleTeams}> 
                                <Text style={styles.txtTeamsNames}>Time A</Text>
                                <VsIconSvg height={30} width={30}/>
                                <Text style={styles.txtTeamsNames}>Time B</Text>
                            </View>
                            
                            <View style={styles.boxCardPlayers}>
                                <View style={styles.CardFirsTeam}>
                                    <View style={styles.infoFirst}></View>
                                </View>
                                
                                <View style={styles.SwitchTeamBox}>
                                    <TouchableOpacity style={styles.btnSwitch}> 
                                        <Ionicons name="swap-horizontal" size={24} /> 
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.CardFirsTeam}>
                                    <View style={styles.infoFirst}></View>
                                </View>
                            </View>
                         </View>

                         {/* <View style={styles.boxNotifications}>
                            <TouchableOpacity> 
                                <Ionicons name="checkbox-outline" size={15} color={Colors.input.iconColor}/> 
                            </TouchableOpacity>
                            <Text style={styles.txtNotify}>Deseja receber notificações sobre esse evento?</Text>
                         </View> */}
                    </View>

                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: 'center',
        alignItems: 'center'
    },
    BoxCardHandleMatch: {
        height: 380, 
        width: '90%',
        maxWidth: 500, 
        borderRadius: 15,
        backgroundColor: Colors.handleCardGames.backgroundModal,
        overflow: 'hidden', 
    },
    headerCard: {
        height: 60,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center', 
        paddingHorizontal: 15,
        backgroundColor: Colors.handleCardGames.backgroundModal
    },
    boxSideItem: {
        width: 40, 
        justifyContent: 'center',
    },
    boxTitleMatch: {
        flex: 1, 
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    txtHeader: {
        color: 'white',
        fontFamily: Fonts.mainFont.dongleRegular,
        textAlign: 'center',
        fontSize: 30,
        lineHeight: 30, 
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 10
    },
    BoxInfosTeams: {
        width: '100%',
        marginTop: 10,
        alignItems: 'center',
        paddingHorizontal: 10,
        flex: 1,
    },
    BoxTitleTeams:{
        height: 50,
        width: '95%', 
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: Colors.dark.input,
        borderRadius: 20
    },
    txtTeamsNames:{
        fontFamily: Fonts.mainFont.dongleRegular,
        fontSize: 40, 
        color: 'white',
        marginTop: 5
    },
    boxCardPlayers:{
        flex: 1, 
        width: '100%', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', 
        marginTop: 15,
    },
    CardFirsTeam:{
        height: '100%',
        width: '42%', 
        padding: 3,
        borderRadius: 15,
        backgroundColor: Colors.input.iconColor
    },
    infoFirst:{
        borderRadius: 12,
        height: '100%',
        width: '100%',
        backgroundColor: Colors.dark.input
    },
    SwitchTeamBox:{
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnSwitch:{
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.input.iconColor,
        borderRadius: 10,
    },
    boxNotifications:{
        height: 40,
        marginBottom:-10,
        marginLeft:-45,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row', 
        gap: 8,
        paddingHorizontal: 20
    },
    txtNotify:{
        fontFamily: Fonts.mainFont.dongleRegular,
        fontSize: 15, 
        color: Colors.dark.text,
        textAlign: 'center',
        marginTop: 5 
    }
})