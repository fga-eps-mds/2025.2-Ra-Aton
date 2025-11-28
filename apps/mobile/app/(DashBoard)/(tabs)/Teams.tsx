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
import { unfollowGroup } from "@/libs/group/unfollowGroup";

import { GroupCard } from "@/components/findGroupCard";

const Teams = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();
  const { user } = useUser();

  const {
    groups,
    myGroups,
    otherGroups,
    filtered: filteredFinal,
    loading,
    error,
    selectedType,
    setSelectedType,
    acceptingOnly,
    setAcceptingOnly,
    reload,
    updateGroup,
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
        <Spacer height={"5%"} />
        <SafeAreaView
          style={[
            {
              height: "30%",
              width: "100%",
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
            {myGroups.length === 0 ? (
              <AppText style={[{ textAlign: "center" }, styles.txt]}>
                Você ainda não faz parte de nenhum time.
              </AppText>
            ) : (
              myGroups.map(g => (
                <JoinedGroupsComp key={g.id} name={g.name} />
              ))
            )}

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
            {filteredFinal.map((g) => (
          <GroupCard
  key={g.id}
  group={g}
  user={user}
  onReload={reload}
  followGroup={followGroup}
  unfollowGroup={unfollowGroup}
  updateGroup={updateGroup}
  requestJoinGroup={requestJoinGroup}
  setGroupMessage={setGroupMessage}
  setGlobalError={setGlobalError}
/>


            ))}
          </ScrollView>
        </SafeAreaView>

        <Spacer height={20} />

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
