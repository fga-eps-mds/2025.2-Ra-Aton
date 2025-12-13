import React from "react";
import { Text, TextProps, StyleProp, TextStyle } from "react-native";
import { Fonts } from "@/constants/Fonts";

interface AppTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const AppText: React.FC<AppTextProps> = ({ children, style, ...props }) => {
  const defaultFont = Fonts?.otherFonts?.dongleBold;

  return (
    <Text
      {...props}
      style={[{ fontFamily: defaultFont }, style]}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};

export default AppText;
