import {
    View,
    DimensionValue,
    ColorValue,
    Text,
    TextInput,
    TextInputProps,
    StyleSheet,
} from "react-native";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";

type InputCompProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    label?: string;
    bgColor?: ColorValue;
    children?: React.ReactNode;
};

const InputComp = ({
    width = "100%",
    height = 80,
    bgColor,
    label,
    children,
    ...rest
}: InputCompProps) => {
    const { isDarkMode, toggleDarkMode } = useTheme();
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
                <Text style={styles.txt}>{children}</Text>
            </View>

            <TextInput style={styles.inputBox} />
        </View>
    );
};

const makeStyles = (theme: any) =>
    StyleSheet.create({
        inputBox: {
            width: "85%",
            height: 40,
            borderRadius: 34,
            backgroundColor: theme.input,
            borderWidth: 1,
            borderColor: theme.orange,
            paddingHorizontal: 20,
            color: theme.text,
        },
        inpuxLabel: {
            width: "85%",
            marginLeft: 34,
        },
        txt: { color: theme.text, fontWeight: "500", fontSize: 20 },
    });

export default InputComp;
