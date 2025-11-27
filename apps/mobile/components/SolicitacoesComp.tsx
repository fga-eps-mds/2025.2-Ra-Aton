import { View } from "react-native";
import AppText from "./AppText";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface SolicitacoesCompProps {
    name: string;
    status?: string;
    autor?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
}

export const SolicitacoesComp = ({
    name,
    status,
    autor,
    onPrimaryPress,
    onSecondaryPress,
}: SolicitacoesCompProps) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;
    let type1 : string = "";
    let type2 : string = "";
    if(autor === "GROUP") {
        type1 = "Aceitar"
        type2 = "Rejeitar"
    }
    else if(status === "PENDING") {
        type1 = "Cancelar"
    }
    else if(status === "APPROVED") {
        type1 = "Aceito"
    }
    else if(status === "REJECTED") {
        type1 = "Rejeitado"
    }

    return (
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
            {/* imagem */}
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
                <AppText style={{ fontSize: 24, color: theme.text, fontWeight: "500" }}>
                    {name}
                </AppText>
            </View>
            <View
                style={{
                    width: "25%",
                    height: "100%",
                    justifyContent: "space-around",
                }}
            >
                {type1 == "Cancelar" || type1 == "Aceitar" ? (
                <PrimaryButton style={{ width: "100%", height: 35 }}>
                    {type1}
                </PrimaryButton>
                ) : (
                <SecondaryButton style={{ width: "100%", height: 35 }}>
                    {type1}
                </SecondaryButton>
                )}
                {type2 !== "" && (
                    <PrimaryButton style={{ width: "100%", height: 35 }}>
                        {type2}
                    </PrimaryButton>
                )}
            </View>
        </View>
    )
}

