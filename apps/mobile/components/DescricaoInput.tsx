import React from "react";
import { TextInput, View, Text, StyleSheet, DimensionValue } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import AppText from "./AppText";
//tem scroll com 73 caracteres
interface DescricaoInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  height?: number;
  status?: boolean;
  statusText?: string;
  width?: DimensionValue;

}

export const DescricaoInput: React.FC<DescricaoInputProps> = ({
  label = "Descrição",
  value,
  onChangeText,
  placeholder = "Digite aqui...",
  height = 120,
    status,
  statusText,
  width = "100%",
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme, height, width);
  const statusBorderColor = status ? Colors.warning : theme.orange;

  return (
    <View style={styles.container}>
      {label?.trim().length > 0 && <AppText style={styles.label}>{label}</AppText>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        numberOfLines={Math.ceil(height / 40)}
        textAlignVertical="top"
      />
      {statusText ? (
        <AppText
          style={[styles.textStatusMessage, { color: statusBorderColor }]}
        >
          {statusText}
        </AppText>
      ) : null}
    </View>
  );
};

const makeStyles = (theme: any, height: number, width: DimensionValue) =>
  StyleSheet.create({
    container: {
      width: width,
      //   marginVertical: 12,
      //   paddingHorizontal: 0,
    },
    label: {
      fontSize: 25,
      fontWeight: "300",
      color: theme.text,
      fontFamily: Fonts.mainFont.dongleRegular,
      marginLeft: 12,
    },
    input: {
      width: "100%",
      height,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.orange,
      fontSize: 20,
      color: theme.text,
      fontFamily: Fonts.otherFonts.dongleBold,
    },
        textStatusMessage: {
      marginLeft: 17,
      alignSelf: "flex-start",
      fontSize: 13,
      color: Colors.warning,
    },
  });
