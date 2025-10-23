import React from "react";
import {
  Text,
  StyleProp,
  ViewStyle,
  useColorScheme,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

type Button1CompProps  = {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap
} & TouchableOpacityProps;

const Button1Comp: React.FC<Button1CompProps> = ({ style, children, iconName,disabled ,...props }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const enable_disable = disabled ? themeColors.gray : themeColors.orange;
  return (
    <TouchableOpacity
        style={[{     
            backgroundColor: enable_disable,
            width: '60%',
            height: 60,
            borderRadius: 30,
            alignItems: "center", 
            justifyContent: 'center' }, style] }
        disabled={disabled}
        {...props}
    >
      {iconName ? ( <Ionicons name={iconName} size={24} color={themeColors.text} /> )
            :
            <Text style={{ color: themeColors.text, textAlign: "center", fontWeight: '700', fontSize: 18 }}>{children}</Text>}
    
    </TouchableOpacity>
  );
};

export default Button1Comp;
