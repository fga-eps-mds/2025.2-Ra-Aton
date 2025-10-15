import { View, DimensionValue, ColorValue, Text, TextInput, TextInputProps, StyleSheet} from 'react-native'
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";

type inputCompProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    label?:string;
    bgColor?: ColorValue;
    children?: React.ReactNode
};
const { isDarkMode, toggleDarkMode } = useTheme();
const themeColors = isDarkMode ? Colors.dark : Colors.light;


const inputComp = ({ width = '100%', height = 40, bgColor = themeColors.input, label, children, ...rest}: inputCompProps) => {
  const styles = makeStyles(themeColors);

    return (

      <View style={{ width, height, backgroundColor: bgColor, justifyContent: "flex-start", alignItems: "center", padding: 0, }}>
            <Text>{children}</Text>
            <View>
            <TextInput style={styles.inputBox}>            
                
            </TextInput>
            </View> 
      </View>


        
    )
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
  inputBox:{
    width: "100%",height: 40,borderRadius: 34,backgroundColor: themeColors.input,borderWidth: 1,borderColor: themeColors.orange,alignItems: "flex-start",justifyContent: "center",paddingHorizontal: 34, 
  }
});

export default inputComp