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
type Button2CompProps = {
  style?: StyleProp<ViewStyle>;
} & TouchableOpacityProps;


const Button2Comp: React.FC<Button2CompProps> = ({ style, children, ...props }) => {
  const { isDarkMode } = useTheme();
  const backgroundColor = isDarkMode ? Colors.dark.gray : Colors.light.gray;
  const theme = { text: isDarkMode ? Colors.dark.text : Colors.light.text, gray: backgroundColor };
  return (
    <TouchableOpacity
        style={[{     
            backgroundColor: theme.gray,
            alignItems: "center",
            justifyContent: 'center',
            width: '40%',
            height: 40,
            borderRadius: 30,
        }, style]}
        {...props}
    >
      <Text style={{ color: theme.text, textAlign: "center", fontSize: 16, fontWeight: '500'}}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button2Comp;
