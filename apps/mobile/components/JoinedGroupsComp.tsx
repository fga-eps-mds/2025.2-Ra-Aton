import { View } from "react-native";
import AppText from "./AppText";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface JoinedGroupsCompProps {
  name: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

export const JoinedGroupsComp = ({
  name,
  onPrimaryPress,
  onSecondaryPress,
}: JoinedGroupsCompProps) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

    return(
        <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 130,
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
                {/* imagem */}
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: "gray",
                }}
              ></View>
              <View
                style={{ flexDirection: "column", flex: 1, marginLeft: 15 }}
              >
                <AppText style={{ fontSize: 24, color: theme.text, fontWeight: "500"}}>
                  {name}
                </AppText>
                {/* <AppText style={[styles.txt, { fontSize: 14, opacity: 0.7 }]}>
                      @exemplo
                    </AppText> */}
              </View>
              <View
                style={{
                  width: "25%",
                  height: "100%",
                  justifyContent: "space-around",
                }}
              >
                <PrimaryButton style={{ width: "100%", height: 35 }}>
                  ???
                </PrimaryButton>
                <SecondaryButton style={{ width: "100%", height: 35 }}>
                  Perfil
                </SecondaryButton>
              </View>
            </View>
    )
}