import React from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imatches } from "@/libs/interfaces/Imatches";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import VsIconSvg from "@/assets/img/vs-icon.svg"

interface EditCardMatchesProps {
    match?: Imatches,
    onPressJoinMatch?: () => void,
    onPressInfos?: () => void,
    onReloadFeed?: () => void | Promise<void>;
    isUserSubscriped?: boolean,
}

export const EditMatchesCard: React.FC<EditCardMatchesProps> = ({
   match, onPressJoinMatch, onPressInfos, onReloadFeed, isUserSubscriped
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.BoxCardHeader}>
                
                <View style={styles.headerSideItem}>
                    <View style={styles.BoxCardStatus}>
                        <Text style={styles.txtStatus}>{match?.matchStatus || ""}</Text>
                    </View>
                </View>

                <View style={styles.headerCenterItem}>
                    <Text 
                        style={styles.txtTitle} 
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                    >
                        {match?.title ?? ""}
                    </Text>
                </View>

                <View style={[styles.headerSideItem, { alignItems: 'flex-end' }]}>
                    <TouchableOpacity onPress={onPressInfos}>
                    <Ionicons name="pencil" color={Colors.input.iconColor} size={25} />
                    </TouchableOpacity>
                </View>

            </View>
            <View style={styles.MidCardBox}>
                <View style={styles.TeamNames}>
                    <Text style={styles.txtNameTeam}>{match?.teamNameA ?? "Time A"}</Text>
                    <VsIconSvg height={25} width={20}/>
                    <Text style={styles.txtNameTeam}>{match?.teamNameB ?? "Time B"}</Text>
                </View>
            </View>
            <View style={styles.BoxConfirm}>
                <View style={styles.CardBtnConfirm}>
                    <TouchableOpacity style={styles.btnConfirm} onPress={onPressJoinMatch}>
                        <Text style={styles.txtConfirm}>
                        Jogadores
                    </Text></TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 150,
        width: 350,
        backgroundColor:Colors.cardGames.backgroundCard,
        borderRadius: 20,
        overflow: 'hidden', 
    },
    BoxCardHeader: {
        height: 45, 
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: Colors.cardGames.header,
        paddingHorizontal: 10, 
    },
    headerSideItem: {
        minWidth: 40, 
        justifyContent: 'center',
    },
    headerCenterItem: {
        flex: 1, 
        paddingHorizontal: 5, 
        justifyContent: 'center',
    },
    BoxCardStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: Colors.input.iconColor,
        alignSelf: 'flex-start', 
    },
    txtStatus: {
        color: 'white',
        textAlign: 'center',
        fontSize: 12,
        fontFamily: Fonts.mainFont.dongleRegular
    },
    txtTitle: {
        color: 'white',
        textAlign: 'center', 
        fontFamily: Fonts.mainFont.dongleRegular,
        fontSize: 20, 
    },

    MidCardBox:{
        height:85,
        width:'100%',
        alignItems:'center',
        justifyContent:'center',

        backgroundColor:Colors.cardGames.backgroundCard

    },
    TeamNames:{
        height:45,
        width:230,
        alignItems:'center',
        justifyContent:'space-around',
        flexDirection:'row',
    },
    txtNameTeam:{
        color: 'white',
        textAlign: 'center', 
        fontFamily: Fonts.mainFont.dongleRegular,
        fontSize:25,   
    },
    BoxConfirm:{
        height:'100%',
        width:'100%',
        alignItems:'center',
    },
    CardBtnConfirm:{
        height:'100%',
        width:120,
        alignItems:'center',
    },
    btnConfirm:{
        width:'100%',
        alignItems:'center',
        borderTopLeftRadius:13,
        borderTopRightRadius:13,
        backgroundColor:'green',
    },
    txtConfirm:{
        textAlign:'center',        
        fontSize:20,
        fontFamily:Fonts.mainFont.dongleRegular,
        color:'white',
    }

})