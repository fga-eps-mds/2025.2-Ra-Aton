import React from "react";
import { ViewProps, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
type BackGroundCompProps = {
  style?: StyleProp<ViewStyle>;
} & ViewProps;

const BackGroundComp: React.FC<BackGroundCompProps> = ({ style, ...props }) => {
  const { isDarkMode } = useTheme();
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.light.background;
  const theme = { background: backgroundColor };
  return (
    <SafeAreaView
      style={[{ backgroundColor: theme.background, flex:1}, style]}
      {...props}
    />
  );
};

export default BackGroundComp;