import React, { useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useTheme } from "@/constants/Theme";


export default function InputDateWebComp({
  label,
  value,
  onChange,
  status = false,
  statusText = "",
}) {
  const inputRef = useRef(null);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(themeColors);
  
function formatarData(datetime) {
  if (!datetime) return "";

  const semZ = datetime.replace("Z", "");
  let dataObj = new Date(semZ);

  // Subtrair 3 horas APENAS NA EXIBIÇÃO
  dataObj.setHours(dataObj.getHours() - 3);

  const pad = (n) => String(n).padStart(2, "0");

  const dia = pad(dataObj.getDate());
  const mes = pad(dataObj.getMonth() + 1);
  const ano = dataObj.getFullYear();
  const horas = pad(dataObj.getHours());
  const minutos = pad(dataObj.getMinutes());

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}





  return (
    <View>
      {label && (
        <View style={styles.labelContainer}>
          <AppText style={styles.label}>{label}</AppText>
        </View>
      )}

      {/* Click em toda a área ativa → abre o picker */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => inputRef.current?.showPicker()}
        style={styles.wrapper}
      >
        <Ionicons
          name="calendar"
          size={20}
          color={Colors.input.iconColor}
          style={styles.icon}
        />

        {/* Input HTML invisível (Web) */}
        <input
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "auto",
          }}
        />

        <AppText style={styles.valueText}>
  {value ? formatarData(value) : "Selecione a data"}
        </AppText>
      </TouchableOpacity>

      {status && statusText && (
        <AppText style={styles.statusText}>{statusText}</AppText>
      )}
    </View>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: {
      height: 49,
      borderRadius: 34,
      borderWidth: 1,
      borderColor: theme.orange,
      backgroundColor: theme.input,
      justifyContent: "center",
      paddingLeft: 40,
      position: "relative",
    },
    icon: {
      position: "absolute",
      left: 15,
    //   top: 0,
    },
    labelContainer: {
      marginLeft: 17,
    },
    label: {
      color: theme.text,
      fontSize: 25,
      fontFamily: Fonts.mainFont.dongleRegular,
    },
    valueText: {
      color: theme.text,
      fontSize: 20,
      fontFamily: Fonts.mainFont.dongleRegular,
    },
    statusText: {
      marginLeft: 17,
      fontSize: 14,
      color: "red",
    },
  });
