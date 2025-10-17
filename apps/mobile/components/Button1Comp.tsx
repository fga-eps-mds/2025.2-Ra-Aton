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


type Button1CompProps = {
  style?: StyleProp<ViewStyle>;
  iconName?: keyof typeof Ionicons.glyphMap
} & TouchableOpacityProps;

const Button1Comp: React.FC<Button1CompProps> = ({ style, children, iconName, ...props }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
        style={[{     
            backgroundColor: themeColors.orange,
            width: '60%',
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: 'center' }, style]}
        {...props}
    >
      {iconName ? ( <Ionicons name={iconName} size={24} color={themeColors.text} /> )
            :
            <Text style={{ color: themeColors.text, textAlign: "center", fontWeight: 500, fontSize: 16 }}>{children}</Text>}
    
    </TouchableOpacity>
  );
};

export default Button1Comp;
