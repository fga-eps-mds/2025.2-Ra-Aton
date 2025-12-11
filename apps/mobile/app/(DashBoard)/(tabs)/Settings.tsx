import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert, TextInput } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/libs/storage/UserContext";
import PrimaryButton from "@/components/PrimaryButton";
import Spacer from "@/components/SpacerComp";
import { Fonts } from "@/constants/Fonts";
import { api_route } from "@/libs/auth/api";
import InputComp from "@/components/InputComp";
import { DescricaoInput } from "@/components/DescricaoInput";

import { useSettings } from "@/libs/hooks/useSettings";

export default function SettingsScreen() {
  const {
    selectedTab,
    setSelectedTab,
    isLoading,
    isEnabled,
    toggleSwitch,
    logout,
    confirmDelete,
    rating,
    setRating,
    message,
    setmessage,
    enviarAvaliacao,
  } = useSettings();

  const { isDarkMode } = useTheme();

  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      alignItems: "center",
      backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
    },
    text: {
      color: isDarkMode ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.mainFont.dongleRegular,
      fontSize: 30,
    },
    tabRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-around",
      marginBottom: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: isDarkMode ? Colors.dark.input : Colors.light.input,
    },
    tabButton: {
      paddingVertical: 6,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    tabButtonText: {
      fontSize: 28,
      fontFamily: Fonts.mainFont.dongleRegular,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      maxWidth: 300,
      paddingVertical: 10,
    },
    feedbackInput: {
      width: "85%",
      borderWidth: 1,
      borderColor: Colors.dark.orange,
      borderRadius: 12,
      padding: 10,
      color: isDarkMode ? "#fff" : "#000",
      fontFamily: Fonts.mainFont.dongleRegular,
      fontSize: 22,
    },
    stars: {
      flexDirection: "row",
      marginVertical: 10,
    },
  });

  return (
    <View style={themeStyles.container}>

      <View style={themeStyles.tabRow}>
        <Text
          style={[
            themeStyles.tabButtonText,
            { color: selectedTab === "perfil" ? themeStyles.text.color : Colors.dark.gray },
          ]}
          onPress={() => setSelectedTab("perfil")}
        >
          Perfil
        </Text>

        <Text
          style={[
            themeStyles.tabButtonText,
            { color: selectedTab === "feedback" ? themeStyles.text.color : Colors.dark.gray },
          ]}
          onPress={() => setSelectedTab("feedback")}
        >
          Feedback
        </Text>
      </View>
          <Spacer height={20} />

      {/* ==========================
               ABA: PERFIL
         ========================== */}
      {selectedTab === "perfil" && (
        <>
          <View style={themeStyles.row}>
            <Text style={themeStyles.text}>Receber Notificações</Text>

            {isLoading ? (
              <ActivityIndicator testID="loading-indicator" color={Colors.dark.orange} />
            ) : (
              <Switch
                testID="switch-notifications"
                trackColor={{ false: "#767577", true: Colors.dark.orange }}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            )}
          </View>

          <Spacer height={40} />
          <PrimaryButton testID="btn-logout" onPress={logout}>Sair</PrimaryButton>
          <Spacer height={20} />

          <PrimaryButton testID="btn-delete" onPress={confirmDelete} style={{ backgroundColor: "red" }}>
            Excluir conta
          </PrimaryButton>
        </>
      )}

      {/* ==========================
               ABA: FEEDBACK
         ========================== */}
      {selectedTab === "feedback" && (
        <View style={{ width: "100%", alignItems: "center" }}>
          <Text style={[themeStyles.text, { fontSize: 36 }]}>Avalie o App!</Text>

          <View style={themeStyles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Text
                key={s}
                onPress={() => setRating(s)}
                style={{
                  fontSize: 42,
                  color: s <= rating ? Colors.dark.orange : "#777",
                }}
              >
                ★
              </Text>
            ))}
          </View>
            <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 20}}>
              
              <DescricaoInput width={'70%'} 
              label=""
              placeholder="Digite sua avaliação"
              value={message}
              onChangeText={setmessage}
              />
              
              <PrimaryButton style = {{width: '25%'}} onPress={enviarAvaliacao}>
                Enviar
              </PrimaryButton>
            </View>
          {/* <Text style={[themeStyles.text, { fontSize: 26 }]}>
            Encontrou um erro ou quer sugerir algo?
          </Text> */}


          {/* <Spacer height={20} /> */}

          {/* <PrimaryButton onPress={() => Alert.alert("Enviado!", "Obrigado pela sugestão!")}>
            Enviar Sugestão */}
          {/* </PrimaryButton> */}
        </View>
      )}
    </View>
  );
}
