import { View } from "react-native";
import AppText from "./AppText";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface CreateGroupCompProps {
      onPrimaryPress?: () => void;

}

export const CreateGroupComp = ({
  onPrimaryPress
}: CreateGroupCompProps) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

    return(
        <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 110,
                backgroundColor: theme.input,
                borderWidth: 1,
                borderColor: theme.background,
                marginBottom: 20,
                borderRadius: 10,
                padding: 15,
                shadowColor: "black",
                shadowOffset: {
                  width: -2,
                  height: 2,
                },
                shadowOpacity: 0.55,
                shadowRadius: 3.5,
                elevation: 5,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "gray",
                }}
              ></View>
              <View
                style={{ flexDirection: "column", flex: 1, marginLeft: 15 }}
              >
                <AppText style={{ fontSize: 24, color: theme.text, fontWeight: "500"}}>
                  Novo Grupo
                </AppText>

              </View>
              <View
                style={{
                  width: "25%",
                  height: "100%",
                  justifyContent: "space-around",
                }}
              >
                <SecondaryButton style={{ width: "100%", height: 35 }} onPress={onPrimaryPress}>
                  Criar +
                </SecondaryButton>
              </View>
            </View>
    )
}