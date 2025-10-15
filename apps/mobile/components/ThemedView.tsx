import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
type ThemedViewProps = {
  style?: StyleProp<ViewStyle>;
} & ViewProps;

const ThemedView: React.FC<ThemedViewProps> = ({ style, ...props }) => {
  const { isDarkMode } = useTheme();
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.light.background;
  const theme = { background: backgroundColor };
  return (
    <View
      style={[{ backgroundColor: theme.background}, style]}
      {...props}
    />
  );
};

export default ThemedView;