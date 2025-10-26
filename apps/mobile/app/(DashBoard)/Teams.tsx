import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import Button1Comp from "../../components/PrimaryButton";
import Button2Comp from "../../components/SecondaryButton";
import { useRouter } from "expo-router";
import Spacer from "../../components/SpacerComp";
import { useTheme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import BackGroundComp from "@/components/BackGroundComp";
const Teams = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();

  return (
    <BackGroundComp style={styles.container}>
      <Button1Comp
        onPress={toggleDarkMode}
        style={{
          width: 40,
          height: 40,
          padding: 0,
          margin: 0,
          alignSelf: "flex-end",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={[
            {
              fontWeight: "700",
              fontSize: 30,
              alignContent: "center",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          *
        </Text>
      </Button1Comp>

      <Text style={[styles.txt, { textAlign: "center" }]}>Teams</Text>
    </BackGroundComp>
  );
};

export default Teams;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },
    txt: {
      color: theme.text,
      fontWeight: "500",
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
