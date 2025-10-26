import { View, DimensionValue, ColorValue } from 'react-native'

type SpacerProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    passThrough?: boolean; // when true, touches pass through the spacer
    bgColor?: ColorValue;
};

const Spacer = ({ width = '85%', height = 40, passThrough = true, bgColor = '' }: SpacerProps) => {
    // put pointerEvents inside style to avoid react-native-web deprecation warning
    return (
        <View style={{ width, height, pointerEvents: passThrough ? 'none' : 'auto', backgroundColor: bgColor }} />
    )
}

export default Spacer