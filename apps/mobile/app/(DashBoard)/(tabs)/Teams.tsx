import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button1Comp from "../../../components/PrimaryButton";
import Button2Comp from "../../../components/SecondaryButton";
import Spacer from "../../../components/SpacerComp";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
import TwoOptionButton from "@/components/TwoOptionButton";
import TwoOptionSwitch from "@/components/TwoOptionButton";
import { useTheme } from "../../../constants/Theme";
import { Colors } from "../../../constants/Colors";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { CreateGroupComp } from "@/components/CreateGroupComp";
import { useGroups } from "@/libs/hooks/getGroups";
import { useUser } from "@/libs/storage/UserContext";

import { requestJoinGroup } from "@/libs/group/requestJoinGroup";
import { JoinedGroupsComp } from "@/components/JoinedGroupsComp";
import { followGroup } from "@/libs/group/followGroup";

const Teams = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();
  const { user } = useUser();

  const {
    groups,
    filtered: filteredFinal,
    loading,
    error,
    selectedType,
    setSelectedType,
    acceptingOnly,
    setAcceptingOnly,
  } = useGroups();

  const [type, setType] = useState<"LEFT" | "RIGHT">("LEFT");

  const [messages, setMessages] = useState<{ [groupId: string]: string }>({});
  const setGroupMessage = (groupId: string, message: string) => {
    setMessages((prev) => ({ ...prev, [groupId]: message }));
  };

  const [globalError, setGlobalError] = useState<string | null>(null);

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
          <AppText
            style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}
          >
            Seus times
          </AppText>
          <ScrollView
            contentContainerStyle={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <CreateGroupComp></CreateGroupComp>
            <JoinedGroupsComp name="Atlética exemplo"></JoinedGroupsComp>
            <JoinedGroupsComp name="Atlética exemplo 2"></JoinedGroupsComp>
            <JoinedGroupsComp name="Atlética exemplo 3"></JoinedGroupsComp>
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

        <Button2Comp
          style={{ width: "60%", height: 40, marginTop: 10 }}
          onPress={() => setAcceptingOnly(!acceptingOnly)}
        >
          {acceptingOnly ? "Aceitando ✔" : "Apenas aceitando"}
        </Button2Comp>
        <Spacer height={"5%"} />

        <SafeAreaView
          style={[
            {
              height: "80%",
              width: "100%",
              // borderWidth: 1,
              // borderColor: theme.orange,
              // borderRadius: 10,
            },
          ]}
        >
          <AppText style={[{ alignSelf: "center" }, styles.txt]}>
            outras equipes
          </AppText>
          {globalError && (
            <AppText
              style={{
                color: "red",
                marginTop: 0,
                marginBottom: 0,
                fontSize: 22,
                textAlign: "center",
              }}
            >
              {globalError}
            </AppText>
          )}

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
            {filteredFinal.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={{
                  width: "45%",
                  height: 210,
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
                onPress={() => router.push(`/profile/${g.id}` as any)}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    backgroundColor: "gray",
                  }}
                ></View>
                <AppText style={styles.txt}>{g.name}</AppText>
                {/* {messages[g.id] && (
                  <AppText style={{ color: theme.orange , marginTop: 0, fontSize: 18, textAlign: "center" }}>
                    {messages[g.id]}
                  </AppText>
                )} */}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    width: "100%",
                    marginTop: 10,
                  }}
                >
                  <Button1Comp
                    style={{ width: "45%", height: 35 }}
                    onPress={async () => {
                      try {
                        const result = await requestJoinGroup(
                          user.id,
                          user.token,
                          g.id,
                        );

                        if (result.ok === false) {
                          setGroupMessage(g.id, result.message);
                          setGlobalError(result.message);

                          return;
                        }

                        setGroupMessage(
                          g.id,
                          "Solicitação enviada com sucesso!",
                        );
                        setGlobalError(null);
                      } catch (err) {
                        const msg =
                          err?.response?.data?.message ||
                          err?.message ||
                          "Não foi possível enviar a solicitação.";

                        setGroupMessage(g.id, msg);
                        setGlobalError(msg);
                      }
                    }}
                  >
                    Solicitar
                  </Button1Comp>
                  <Button2Comp
                    style={{ width: "45%", height: 35 }}
                    onPress={async () => {
                      try {
                        const result = await followGroup(user.token, g.id);

                        if (result.ok === false) {
                          Alert.alert("Aviso", result.message);
                          return;
                        }

                        Alert.alert("Sucesso", "Solicitação enviada!");
                      } catch (err: any) {
                        console.log("Erro inesperado:", err);

                        Alert.alert(
                          "Erro",
                          err?.response?.data?.message ||
                            err?.message ||
                            "Não foi possível enviar a solicitação.",
                        );
                      }
                    }}
                  >
                    seguir
                  </Button2Comp>
                </View>
              </TouchableOpacity>
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
