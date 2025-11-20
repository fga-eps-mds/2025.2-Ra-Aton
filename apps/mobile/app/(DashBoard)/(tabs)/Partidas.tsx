import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useState } from "react";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import SearchInputComp from "@/components/SearchInputComp";
import InputComp from "@/components/InputComp";
import BackGroundComp from "@/components/BackGroundComp";
import { MatchesCard } from "@/components/MatchesCardComp";

export default function Partidas() {
  const { isDarkMode } = useTheme();
  const themeStyles = StyleSheet.create({
    container: {
      // flexDirection:'column',
      alignItems:'center',
      justifyContent: "center",
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
  });

  return (
    <BackGroundComp>
      <View style={styles.container}>
      

    <MatchesCard></MatchesCard>

      </View>



    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  container:{
    height:'100%',
    width:'100%',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',

  }
})