import {
  View,
  DimensionValue,
  ColorValue,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

type InputCompProps = TextInputProps & {
  width?: DimensionValue;
  height?: DimensionValue;
  label?: string;
  bgColor?: ColorValue;
  status?: boolean;
  placeholder?: string;
  statusText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
};

const InputComp = ({
  width = "100%",
  // height = 67,
  bgColor,
  label,
  iconName,
  status,
  statusText,
  placeholder,
  secureTextEntry,
  ...rest
}: InputCompProps) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const inputPaddingLeft = iconName ? 40 : 20;
  const inputPaddingRight = secureTextEntry ? 40 : 20;
  const backgroundColor = bgColor || themeColors.input;
  const statusBorderColor = status ? Colors.warning : themeColors.orange;

  const [showPassword, setShowPassword] = useState(false);

  const styles = makeStyles(themeColors);

  return (
    <View style={{ width, alignItems: "center" }}>
      <View style={styles.inpuxLabel}>
        <Text style={styles.txt}>{label}</Text>
      </View>

      <View style={styles.inputCompContainer}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color="orange"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.inputBox,
            {
              paddingLeft: inputPaddingLeft,
              borderColor: statusBorderColor,
              paddingRight: inputPaddingRight,
            },
          ]}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholder={placeholder}
          placeholderTextColor={themeColors.text + "99"} // semi-transparente
          {...rest}
        />
        {/* Ícone do lado direito */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: [{ translateY: -10 }],
            }}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              style={styles.passwordIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.textStatusMessage, { color: statusBorderColor }]}>
        {statusText || " "}{" "}
        {/* Se trocar por "" o tamanho ja fica esperando a mensagem no lugar de aparece condicionalmente*/}
      </Text>
    </View>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    inputBox: {
      // width: "100%",
      flex: 1,
      minHeight: 45,
      borderRadius: 34,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.orange,

      paddingHorizontal: 20,
      textAlignVertical: "center",
      fontFamily: Fonts.primaryFont.dongleRegular,
      color: theme.text,
      fontSize: 20,
    },
    inpuxLabel: {
      width: "100%",
      marginLeft: 17,
    },

    txt: {
      color: theme.text,
      fontWeight: "300",
      fontSize: 25,
      fontFamily: Fonts.primaryFont.dongleRegular,
    },

    inputCompContainer: {
      width: "100%",
      justifyContent: "center",
      position: "relative",
    },
    inputIcon: {
      position: "absolute",
      left: 15,
      zIndex: 1,
      color: Colors.text.iconColors,
    },
    passwordIcon: {
      color: Colors.text.iconColors,
    },
    textStatusMessage: {
      marginLeft: 17,
      alignSelf: "flex-start",
      fontSize: 13,
      color: Colors.warning,
      // marginBottom:40,
    },
  });

export default InputComp;
