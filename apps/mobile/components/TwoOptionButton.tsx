import React from "react";
import { View, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import AppText from "./AppText";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

type Props = {
  optionLeft: string;
  optionRight: string;
  style?: StyleProp<ViewStyle>;
  selected: "LEFT" | "RIGHT";
  onChange: (value: "LEFT" | "RIGHT") => void;
};

export default function TwoOptionSwitch({
  optionLeft,
  style,
  optionRight,
  selected,
  onChange,
}: Props) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View
      style={[{
        flexDirection: "row",
        width: "90%",
        height: 50,
        backgroundColor: theme.input,
        borderRadius: 80,
        overflow: "hidden",
        shadowColor: "black",
                  shadowOffset: {
                    width: -2,
                    height: 2,
                  },
                  shadowOpacity: 0.55,
                  shadowRadius: 3.5,
                  elevation: 5,
      }, style,]}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            selected === "LEFT" ? theme.input : theme.gray,
        }}
        onPress={() => onChange("LEFT")}
      >
        <AppText
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: selected === "LEFT" ? theme.text : theme.input,
          }}
        >
          {optionLeft}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            selected === "RIGHT" ? theme.input : theme.gray,
        }}
        onPress={() => onChange("RIGHT")}
      >
        <AppText
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: selected === "RIGHT" ? theme.text : theme.input,
          }}
        >
          {optionRight}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
