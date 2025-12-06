import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button1Comp from "../../../components/PrimaryButton";
import Button2Comp from "../../../components/SecondaryButton";
import Spacer from "../../../components/SpacerComp";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
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
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();
  const { user } = useUser();

  const {
    groups,
    myGroups,
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

  const [messages, setMessages] = useState<{ [groupId: string]: string }>({});
  const setGroupMessage = (groupId: string, message: string) => {
    setMessages((prev) => ({ ...prev, [groupId]: message }));
  };

  const [globalError, setGlobalError] = useState<string | null>(null);

  return (
    <BackGroundComp style={styles.container}>
      <FlatList
        data={filteredFinal}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: 20,
        }}
        
        ListHeaderComponent={
          <View>
            <Spacer height={"2%"} />

            <AppText
              style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}
            >
              Seus times
            </AppText>

            <CreateGroupComp
            onPrimaryPress={() => router.replace("/criarGrupo")} />

<FlatList
  data={myGroups}
  keyExtractor={(g) => g.id}
  scrollEnabled={false}               
  contentContainerStyle={{ gap: 10 }} 
  ListEmptyComponent={
    <AppText
      style={[
        { textAlign: "center", alignSelf: "center", width: "100%" },
        styles.txt,
      ]}
    >
      Você ainda não faz parte de nenhum time.
    </AppText>
  }
  renderItem={({ item }) => (
    <JoinedGroupsComp name={item.name} />
  )}
/>


            <Spacer height={"2%"} />

            <TwoOptionSwitch
              optionLeft="Amadores"
              optionRight="Atléticas"
              selected={selectedType === "AMATEUR" ? "LEFT" : "RIGHT"}
              onChange={(side) =>
                setSelectedType(side === "LEFT" ? "AMATEUR" : "ATHLETIC")
              }
              style={[{ alignSelf: "center" }]}
            />

            <Button2Comp
              style={{ width: "60%", height: 40, marginTop: 10, alignSelf: 'center' }}
              onPress={() => setAcceptingOnly(!acceptingOnly)}
            >
              {acceptingOnly ? "Aceitando ✔" : "Apenas aceitando"}
            </Button2Comp>

            <AppText
              style={[{ alignSelf: "center", marginTop: 20 }, styles.txt]}
            >
              Outras equipes
            </AppText>

            <Spacer height={60}></Spacer>

            {globalError && (
              <AppText
                style={{
                  color: "red",
                  marginTop: 0,
                  marginBottom: 10,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {globalError}
              </AppText>
            )}
          </View>
        }

        renderItem={({ item }) => (
          <GroupCard
            group={item}
            user={user}
            onReload={reload}
            followGroup={followGroup}
            unfollowGroup={unfollowGroup}
            updateGroup={updateGroup}
            requestJoinGroup={requestJoinGroup}
            setGroupMessage={setGroupMessage}
            setGlobalError={setGlobalError}
          />
        )}
      />
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
