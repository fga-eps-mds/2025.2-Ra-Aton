import React from "react";
import { Text, TextProps, StyleProp, TextStyle } from "react-native";
import { Fonts } from "@/constants/Fonts";

interface AppTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

// fonte padrão usada na app.
const AppText: React.FC<AppTextProps> = ({ children, style, ...props }) => {
  const defaultFont =
    (Fonts && Fonts.otherFonts && Fonts.otherFonts.dongleBold) || undefined;

  return (
    <Text {...props} style={[{ fontFamily: defaultFont }, style]}>
      {children}
    </Text>
  );
};

export default AppText;
