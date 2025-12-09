import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import AppText from "./AppText";

type InputDateCompProps = {
  label?: string;
  value: string | null;
  onPress: () => void;
  placeholder?: string;
    status?: boolean;
  statusText?: string;

};

export default function InputDateComp({
  label,
  value,
  onPress,
  placeholder = "Selecionar data",
    status,
  statusText,
}: InputDateCompProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const statusBorderColor = status ? Colors.warning : theme.orange;

  return (
    <View>
      {label && (
        <View style={styles.labelWrapper}>
          <AppText style={styles.label}>{label}</AppText>
        </View>
      )}

      <Pressable onPress={onPress} style={[styles.container, { borderColor: statusBorderColor }]}>
        <Ionicons
          name="calendar"
          size={20}
          color={Colors.input.iconColor}
          style={styles.icon}
        />

        <Text style={[styles.text, { color: theme.text }]}>
          {value || placeholder}
        </Text>
      </Pressable>
      {label && statusText ? (
        <AppText
          style={[styles.textStatusMessage, { color: statusBorderColor }]}
        >
          {statusText}
        </AppText>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      height: 45,
      borderRadius: 34,
      borderWidth: 1,
      backgroundColor: theme.input,
      paddingLeft: 40, 
      paddingRight: 20,
      justifyContent: "center",
    },

    icon: {
      position: "absolute",
      left: 15,
      zIndex: 1,
      color: Colors.input.iconColor,
    },

    text: {
      fontFamily: Fonts.mainFont.dongleRegular,
      fontSize: 20,
    },

    labelWrapper: {
      marginLeft: 17,
      marginBottom: 2,
    },

    label: {
      fontFamily: Fonts.mainFont.dongleRegular,
      fontSize: 25,
      color: theme.text,
      fontWeight: "300",
    },
        textStatusMessage: {
      marginLeft: 17,
      alignSelf: "flex-start",
      fontSize: 13,
      color: Colors.warning,
    },
  });
