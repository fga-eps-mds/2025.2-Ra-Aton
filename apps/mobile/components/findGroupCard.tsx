import { View, TouchableOpacity, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import PrimaryButton from "@/components/PrimaryButton";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { useState } from "react";
import ProfileThumbnailComp from "@/components/ProfileThumbnailComp"; // Importe isso

import type { Group } from "@/libs/hooks/getGroups";
import SecondaryButton from "./SecondaryButton";

type Props = {
  group: Group;
  user: { id: string; token: string };
  requestJoinGroup: (userId: string, token: string, groupId: string) => Promise<any>;
  followGroup: (token: string, groupName: string) => Promise<any>;
  unfollowGroup: (token: string, groupName: string) => Promise<any>;
  setGroupMessage: (groupId: string, msg: string) => void;
  setGlobalError: (msg: string | null) => void;
  onReload: () => Promise<void>;
  updateGroup: (g: Group) => void;   
};

export const GroupCard = ({
  group,
  user,
  followGroup,
  requestJoinGroup,
  unfollowGroup,
  onReload,
  setGroupMessage,
  setGlobalError,
  updateGroup,
}: Props) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let updated;

      if (group.isFollowing) {
        updated = await unfollowGroup(user.token, group.name);
      } else {
        updated = await followGroup(user.token, group.name);
      }

      updateGroup({
        ...group,
        isFollowing: !group.isFollowing,
      });

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/group/${group.id}` as any)}
    >
      <ProfileThumbnailComp 
        size={60}
        userName={group.name}
        imageUrl={group.logoUrl}
        profileType="group"
      />

      <AppText style={styles.name} numberOfLines={1}>
        {group.name}
      </AppText>

      <View style={styles.buttons}>
        <PrimaryButton
          textWeight={500} 
          textSize={20} 
          style={styles.button}
          onPress={async () => {
            try {
              const result = await requestJoinGroup(user.id, user.token, group.id);
              await onReload();
              if (result.ok === false) {
                setGroupMessage(group.id, result.message);
                setGlobalError(result.message);
                return;
              }

              setGroupMessage(group.id, "Solicitação enviada com sucesso!");
              setGlobalError(null);
              await onReload();
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Não foi possível enviar a solicitação.";

              setGroupMessage(group.id, msg);
              setGlobalError(msg);
            }
          }}
        >
          Solicitar
        </PrimaryButton>

        {group.isFollowing ? (
          <SecondaryButton
            style={styles.button}
            disabled={loading}
            onPress={handleFollow}
          >
            Seguindo
          </SecondaryButton>
        ) : (
          <SecondaryButton
            style={styles.button}
            disabled={loading}
            onPress={handleFollow}
          >
            Seguir
          </SecondaryButton>
        )}
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      width: "45%",
      height: 220, 
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 5,
      shadowColor: "black",
      shadowOffset: { width: -2, height: 2 },
      shadowOpacity: 0.55,
      shadowRadius: 3.5,
      elevation: 5,
      backgroundColor: theme.input, 
      borderColor: theme.background
    },
    name: {
      fontSize: 22,
      color: theme.text,
      fontWeight: "500",
      marginTop: 10,
      textAlign: "center",
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      marginTop: 10,
    },
    button: {
      width: "45%",
      height: 35,
    },
  });