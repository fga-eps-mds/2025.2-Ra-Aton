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
        height = 80,
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

        const styles = makeStyles(themeColors);

        const backgroundColor = bgColor || themeColors.input;

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
                    <TextInput style={styles.inputBox} {...rest} />
                </View>
            </View>
        );
    };

    const makeStyles = (theme: any) =>
        StyleSheet.create({
            inputBox: {
                width: "100%",
                height: 40,
                borderRadius: 34,
                backgroundColor: theme.input,
                borderWidth: 1,
                borderColor: theme.orange,
                paddingHorizontal: 20,
                paddingLeft:45,
                color: theme.text,
            },
            inputCompContainer:{
                width: "85%",
                justifyContent: 'center',
            },  
            inputIcon:{
                position: 'absolute', 
                left: 15,            
                zIndex: 1,
                color:Colors.text.iconColors

            },
            inpuxLabel: {
                width: "85%",
                marginLeft: 34,
            },
            txt: { color: theme.text, fontWeight: "500", fontSize: 15 },
        });

    export default InputComp;
