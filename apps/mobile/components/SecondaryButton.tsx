import React from "react";
import {
  Text,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  TextStyle,
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import AppText from "./AppText";
import Ionicons from "@expo/vector-icons/build/Ionicons";
type Button2CompProps = {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  textSize?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
  textWeight?: number;

} & TouchableOpacityProps;

const Button2Comp: React.FC<Button2CompProps> = ({
  style,
  children,
  iconName,
  disabled,
  textSize = 20,
  textWeight = 500,
  ...props

}) => {
  const { isDarkMode } = useTheme();
  const backgroundColor = isDarkMode ? Colors.dark.gray : Colors.light.gray;
  const theme = {
    text: isDarkMode ? Colors.dark.text : Colors.light.text,
    gray: backgroundColor,
  };
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme.gray,
          alignItems: "center",
          justifyContent: "center",
          width: "40%",
          height: 40,
          borderRadius: 30,
        },
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      {iconName ? (
        <Ionicons name={iconName} size={24} color={theme.text} />
      ) : (
        <AppText
          style={{
            color: theme.text,
            textAlign: "center",
            fontWeight: String(textWeight) as any,
            fontSize: textSize,
          }}
        >
          {children}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

export default Button2Comp;
