import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useState } from "react";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import SearchInputComp from "@/components/SearchInputComp";
import InputComp from "@/components/InputComp";
import BackGroundComp from "@/components/BackGroundComp";
import { MatchesCard } from "@/components/MatchesCardComp";
import { HandleMatchComp } from "@/components/HandleMatchComp";
import { useModal } from "@/libs/hooks/useModal";
import { EventInfoModalComp } from "@/components/EventInfoModal";
import { EventDetailsModal } from "@/components/EventDetailsModal";
import { MatchDetailsModal } from "@/components/MatchDetailsModal";

export default function Partidas() {
  const { isDarkMode } = useTheme();
  const themeStyles = StyleSheet.create({
    container: {
      // flexDirection:'column',
      alignItems: 'center',
      justifyContent: "center",
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
  });

  const {
    visible, closeModal, openModal
  } = useModal();
 
const mockMatchData = {
    id: '1',
    title: 'Futebol de Quinta',
    date: new Date().toISOString(), 
    location: 'Quadra do Centro',
} as any;

  return (
    <BackGroundComp>
      <View style={styles.container}>

        <MatchesCard onPressInfos={openModal}></MatchesCard>
      <MatchDetailsModal visible={visible} onClose={closeModal} match={mockMatchData}></MatchDetailsModal>


      </View>


    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',  
    flexDirection: "column",
    alignItems:"center",
    justifyContent:"center",
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
    columnGap: 10,
    // justifyContent:'cent er',

  }
})