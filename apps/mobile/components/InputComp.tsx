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


    type InputCompProps = TextInputProps & {
        width?: DimensionValue;
        height?: DimensionValue;
        label?: string;
        bgColor?: ColorValue;
        children?: React.ReactNode;
        iconName?: keyof typeof Ionicons.glyphMap;
    };

    const InputComp = ({
        width = "100%",
        height = 67,
        bgColor,
        label,
        children,
        iconName,
        placeholder,
        secureTextEntry,    
        ...rest
    }: InputCompProps) => {
        const { isDarkMode, toggleDarkMode  } = useTheme();
        const themeColors = isDarkMode ? Colors.dark : Colors.light;
        const inputPaddingVertical = (45 - 20) / 2
        const inputPaddingLeft = iconName ? 40 : 20;
        const backgroundColor = bgColor || themeColors.input;

        const styles = makeStyles(themeColors, inputPaddingVertical);



        return (
            <View
                style={{
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
                    {iconName && (<Ionicons name={iconName} size={20} color='orange' style={styles.inputIcon}/>)}
                    <TextInput style={[styles.inputBox, { paddingLeft: inputPaddingLeft }]}  {...rest} />
                </View>
            </View>
        );
    };

    const makeStyles = (theme: any, paddingVertical: number) =>
        StyleSheet.create({
            
                inputBox: {
                width: "100%",
                height: 45,
                borderRadius: 34,
                backgroundColor: theme.input,
                borderWidth: 1,
                borderColor: theme.orange,
      
            paddingHorizontal:20,
            paddingVertical,
            textAlignVertical:'center',
            fontFamily:Fonts.primaryFont.dongleRegular,
            color: theme.text,
            fontSize: 20    ,
            
        },
            inpuxLabel: {
            width: "100%",
            marginLeft: 17,
            },
            txt: { color: theme.text, fontWeight: "300", fontSize: 25,fontFamily: Fonts.primaryFont.dongleRegular },
            inputCompContainer:{
                width: "100%",
                justifyContent: 'center',
            },  
            inputIcon:{
                position: 'absolute', 
                left: 15,            
                zIndex: 1,
                color:Colors.text.iconColors

            },
        });

    export default InputComp;
