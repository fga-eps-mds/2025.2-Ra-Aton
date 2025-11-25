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
import TwoOptionButton from "@/components/TwoOptionButton";
import TwoOptionSwitch from "@/components/TwoOptionButton";

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
  
  const [type, setType] = useState<"LEFT" | "RIGHT">("LEFT");




  return (
    <BackGroundComp style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 0,
          paddingBottom: 0,
          paddingHorizontal: 20,
          backgroundColor: theme.background,
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
              height: "30%",
              width: "100%",
              // backgroundColor: "red",
              // flexGrow: 1,
              // backgroundColor: theme.input,
              // borderWidth: 1,
              // borderColor: theme.orange,
              // borderRadius: 10,
            },
          ]}
        >
          <AppText style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}>
            Seus times
          </AppText>
          <ScrollView
            contentContainerStyle={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              padding: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            
            <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  height: 130,
                  backgroundColor: theme.input,
                  borderWidth: 1,
                  borderColor: theme.background,
                  marginBottom: 20,
                  borderRadius: 10,
                  padding: 15,
                  shadowColor: "black",
                  shadowOffset: {
                    width: -2,
                    height: 2,
                  },
                  shadowOpacity: 0.55,
                  shadowRadius: 3.5,
                  elevation: 5,
                }}
              >
                <View style={{width: 70, height: 70, borderRadius: 35, backgroundColor: "gray" }}>

                </View>
                <View style={{ flexDirection: "column", flex: 1, marginLeft: 15 }}>
                    <AppText style={[styles.txt, { fontSize: 24 }]}>
                      Atlética exemplo
                    </AppText>
                    {/* <AppText style={[styles.txt, { fontSize: 14, opacity: 0.7 }]}>
                      @exemplo
                    </AppText> */}
                  </View>                
                  <View
                  style={{
                  width: "25%",
                  height: "100%",
                  justifyContent: "space-around",
                  }}
                >
                  <Button1Comp style={{ width: "100%", height: 35 }}>
                    Seguir
                  </Button1Comp>
                  <Button2Comp style={{ width: "100%", height: 35 }}>
                    Perfil
                  </Button2Comp>
                </View>
              </View>
               <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  height: 130,
                  backgroundColor: theme.input,
                  borderWidth: 1,
                  borderColor: theme.background,
                  marginBottom: 20,
                  borderRadius: 10,
                  padding: 15,
                  shadowColor: "black",
                  shadowOffset: {
                    width: -2,
                    height: 2,
                  },
                  shadowOpacity: 0.55,
                  shadowRadius: 3.5,
                  elevation: 5,
                }}
              >
                <View style={{width: 70, height: 70, borderRadius: 35, backgroundColor: "gray" }}>

                </View>
                <View style={{ flexDirection: "column", flex: 1, marginLeft: 15 }}>
                    <AppText style={[styles.txt, { fontSize: 24 }]}>
                      Atlética exemplo
                    </AppText>
                    {/* <AppText style={[styles.txt, { fontSize: 14, opacity: 0.7 }]}>
                      @exemplo
                    </AppText> */}
                  </View>                
                  <View
                  style={{
                  width: "25%",
                  height: "100%",
                  justifyContent: "space-around",
                  }}
                >
                  <Button1Comp style={{ width: "100%", height: 35 }}>
                    Seguir
                  </Button1Comp>
                  <Button2Comp style={{ width: "100%", height: 35 }}>
                    Perfil
                  </Button2Comp>
                </View>
              </View>
          </ScrollView>
        </SafeAreaView>

        <Spacer height={"5%"} />

        <TwoOptionSwitch
          optionLeft="Amadores"
          optionRight="Atléticas"
          selected={selectedType === "AMATEUR" ? "LEFT" : "RIGHT"}
          onChange={(side) =>
            setSelectedType(side === "LEFT" ? "AMATEUR" : "ATHLETIC")
          }
        />

        <Spacer height={"5%"} />

        <SafeAreaView
          style={[{ height: "80%", width: "100%",
              // borderWidth: 1,
              // borderColor: theme.orange,
              // borderRadius: 10, 
            }]}
        >
          <AppText style={[{ alignSelf: "center" }, styles.txt]}>
            outras equipes
          </AppText>
          <ScrollView
            contentContainerStyle={{
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
                  height: 170,
                  backgroundColor: theme.input,
                  borderWidth: 1,
                  borderColor: theme.background,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                  borderRadius: 10,
                  paddingVertical: 10,
                  shadowColor: "black",
                  shadowOffset: {
                    width: -2,
                    height: 2,
                  },
                  shadowOpacity: 0.55,
                  shadowRadius: 3.5,
                  elevation: 5,
                }}
              >
                <View style={{width: 70, height: 70, borderRadius: "50%", backgroundColor: "gray" }}>

                </View>
                <AppText style={styles.txt}>{g.name}</AppText>
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
