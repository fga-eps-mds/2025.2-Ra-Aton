import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import { IPost } from "@/libs/interfaces/Ipost";

interface CardHandlePostsProps {
    title?: string;
    attendancesCount?: number;
    type?: string; 
    onPressCard?: () => void;
    onOpenMenu?: () => void;
    post?: IPost,
}

export const CardHandlePostComp: React.FC<CardHandlePostsProps> = ({
    title,
    // type,
    onPressCard,
    post,
    onOpenMenu,
}) => {
    const isEvent = post?.type == "EVENT";
    return (
        <TouchableOpacity 
            style={styles.cardContainer} 
            onPress={onPressCard}
            activeOpacity={0.7}
        >
            <View style={styles.headerCard}>
                <AppText style={styles.txtTitle} numberOfLines={1}>
                    {title || "Sem título"}
                </AppText>
                
                <TouchableOpacity 
                    onPress={onOpenMenu} 
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                    <Ionicons name="ellipsis-vertical" color={Colors.dark.orange} size={20} />
                </TouchableOpacity>
            </View>

            {isEvent && (
                <View style={styles.footerCard}>
                    <View style={styles.attendanceBox}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.dark.text} />
                        <AppText style={styles.txtCount}>
                            {post?.attendancesCount ?? 0} confirmações "Eu vou!"
                            {/* 0 */}
                        </AppText>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        backgroundColor: Colors.dark.input,
        borderRadius: 15,
        marginBottom: 15,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    txtTitle: {
        fontSize: 20,
        color: Colors.dark.orange,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    footerCard: {
        paddingHorizontal: 15,
        flexDirection: 'row',
    },
    attendanceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 8,
    },
    txtCount: {
        color: Colors.dark.text,
        fontSize: 14,
    }
});