import React from "react";
import {
  Text,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";

type Button1CompProps = {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  textSize?: number; 
  textWeight?: number;
} & TouchableOpacityProps;

const Button1Comp: React.FC<Button1CompProps> = ({
  style,
  children,
  iconName,
  disabled,
  textSize = 22,
  textWeight = 700,
  ...props
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const enable_disable = disabled ? themeColors.gray : themeColors.orange;
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: enable_disable,
          width: "60%",
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      {iconName ? (
        <Ionicons name={iconName} size={24} color={themeColors.text} />
      ) : (
        <AppText
          style={{
            color: themeColors.text,
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

export default Button1Comp;
