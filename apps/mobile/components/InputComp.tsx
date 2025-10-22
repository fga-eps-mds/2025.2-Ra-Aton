//? Faz todas as importações necessáriasa
import {
  View,
  DimensionValue,
  ColorValue,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
import { Fonts } from "@/constants/Fonts";
//? --------------------------------------------------

// * AQUI É PASSADO TODAS AS PROPRIEDADES QUE NOSSO INPUT (DEVE OU PODE TER) TER. OU SEJA TODAS AS COISAS QUE NÓS SEREMOS CAPAZ DE USAR DENTRO DO INPUT*\
type InputCompProps = TextInputProps & {
  width?: DimensionValue; //*  QUANDO NÓS USAMOS O OPERADO ( ? ) TORNAMOS A PROPRIEDADE OPCIONAL
  height?: DimensionValue;
  label?: string;
  bgColor?: ColorValue;
  children?: React.ReactNode;
  status?: boolean;
  statusText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
};

const InputComp = ({
  //* ALI EM CIMA NÓS DEFINIMOS AS COISAS QUE NÓS TEMOS NO INPUT
  width = "100%", //* AGORA NÓS TEMOS QUE PASSAR PARA NOSSA FUNÇÃO, TUDO QUE QUEREMOS USAR
  height = 67, //! GERALMENTE É SO REPETIR TUDO QUE FOI ESCRITO ACIMA, MAS COM SEUS VALORES DEFINIDOS
  bgColor,
  label,
  children,
  iconName,
  status,
  statusText,
  placeholder,
  secureTextEntry,
  ...rest
}: InputCompProps) => {
  // * VARIAVEIS QUE NÓS USAMOS PARA MANIPULAR DIFEFRENTES PARTES DO INPUT OU DA ESTRUTURA;
  //* ISSO NÃO É ALGO OBRIGATÓRIO, NÓS USAMOS APENAS PARA FAZER ALGUMAS OPERAÇÕES;
  const { isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const inputPaddingVertical = 45 - 20;
  const inputPaddingLeft = iconName ? 40 : 20;
  const backgroundColor = bgColor || themeColors.input; // ! NÃO ESTÁ SENDO UTILIZADA
  const statusBorderColor = status ? Colors.warning : themeColors.orange; //? IF ELSE PARA DEFINIR A COR DA BORDA
  const styles = makeStyles(themeColors, inputPaddingVertical);
  return (
    <View //! AQUI SE INICIA A ESTRUTURA DO NOSSO INPUT,
      style={{
        //*ESTILIZAÇÃO DO LUGAR ONDE GUARDAMOS NOSSO INPUT; TIPO A CAIXA ONDE ELE ESTÁ INSERIDO
        width,
        height,
        backgroundColor: bgColor,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 0,
      }}
    >
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
          secureTextEntry={secureTextEntry}
          style={[
            styles.inputBox,
            { paddingLeft: inputPaddingLeft, borderColor: statusBorderColor },
          ]}
          {...rest}
        />
      </View>
      <Text style={styles.textStatusMessage}>{statusText}</Text>
    </View> //! AQUI NÓS APENAS COLOCAMOS TODAS AS PROPRIEDADES QUE QUEREMOS USAR DENTRO DO INPU
    //         ! TAMBÉM PASSAMOS A ESTILIZAÇÃO DO NOSSO INPUT, POR MEIO DE NOMES ESPECIFICOS COMO:
    //? (styles.inputContainer) isso nada mais é do que o nome da estilização  que cobre o nosso input
  );
};
//* TODA A ESTILIZAÇÃO:
const makeStyles = (theme: any, paddingVertical: number) =>
  StyleSheet.create({
    inputBox: {
      width: "100%",
      height: 45,
      borderRadius: 34,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.orange,

      paddingHorizontal: 20,
      paddingVertical,
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
    },
    inputIcon: {
      position: "absolute",
      left: 15,
      zIndex: 1,
      color: Colors.text.iconColors,
    },
    textStatusMessage: {},
  });

export default InputComp;
