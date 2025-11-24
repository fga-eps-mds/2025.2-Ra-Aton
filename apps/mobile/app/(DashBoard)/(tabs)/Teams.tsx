import { StyleSheet, View, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button1Comp from "../../../components/PrimaryButton";
import Button2Comp from "../../../components/SecondaryButton";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Spacer from "../../../components/SpacerComp";
import { useTheme } from "../../../constants/Theme";
import { Colors } from "../../../constants/Colors";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
import { useGroups } from "@/libs/hooks/getGroups";

const Teams = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();

  const {
    filtered,
    loading,
    selectedType,
    setSelectedType
  } = useGroups();




  return (
    <BackGroundComp style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 0,
          paddingBottom: 0,
          paddingHorizontal: 20,
          backgroundColor: "blue",
          alignItems: "center",
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Scroll principal (azul) */}
        <Spacer height={"5%"} />
        <SafeAreaView
          style={[
            {
              maxHeight: "40%",
              width: "100%",
              backgroundColor: "red",
              flexGrow: 1,
            },
          ]}
        >
          <AppText style={[{ alignSelf: "center" }, styles.txt]}>
            Seus times
          </AppText>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: "green",
              width: "100%",
              height: "100%",
              alignItems: "center",
              padding: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <AppText>Grupos que o usuário ja esta</AppText>
          </ScrollView>
        </SafeAreaView>

        <Spacer height={"5%"} />

        <Button2Comp
          style={{ width: "80%", height: 50 }}
          onPress={() =>
            setSelectedType(selectedType === "AMATEUR" ? "ATHLETIC" : "AMATEUR")
          }
        >
          botão de amadores/atletica
        </Button2Comp>

        <Spacer height={"5%"} />

        <SafeAreaView
          style={[{ maxHeight: "80%", width: "100%", backgroundColor: "red" }]}
        >
          <AppText style={[{ alignSelf: "center" }, styles.txt]}>
            outras equipes
          </AppText>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: "green",
              width: "100%",
              padding: 0,
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* <AppText>
          Outros grupos que o usuário pode entrar
          </AppText> */}
            {filtered.map((g) => (
              <View
                key={g.id}
                style={{
                  width: "45%",
                  height: 150,
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                  borderRadius: 10,
                  paddingVertical:5,
                }}
              >
                <View style={{width: 70, height: 70, borderRadius: "50%", backgroundColor: "gray" }}>

                </View>
                <AppText style={{fontSize:20}}>{g.name}</AppText>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    width: "100%",
                    marginTop: 10,
                  }}
                >
                  <Button1Comp style={{ width: "45%", height: 35 }}>
                    Seguir
                  </Button1Comp>
                  <Button2Comp style={{ width: "45%", height: 35 }}>
                    Perfil
                  </Button2Comp>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>

        <Spacer height={20} />
        {/* <SafeAreaView style={[{height: 200, width: "100%", backgroundColor: 'red'}]}>
        <AppText style={styles.txt}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex in labore asperiores vero quisquam dignissimos, ducimus ipsa quia itaque. At fuga modi consectetur cupiditate tempore architecto hic porro recusandae? Eveniet. Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis laborum minima possimus ex? Veritatis ducimus similique beatae at excepturi nesciunt illum numquam? Vel qui recusandae dolore voluptatibus minima minus dolor?</AppText>
      </SafeAreaView> */}
      </ScrollView>
    </BackGroundComp>
  );
};

export default Teams;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      // padding: 16,
    },
    txt: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 24,
    },

    inputBox: {
      width: "100%",
      height: 40,
      borderRadius: 34,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.orange,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: 34,
    },
  });
