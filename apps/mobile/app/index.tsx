// Importa polyfills PRIMEIRO
import '../polyfills';

import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import { useUser } from "@/libs/storage/UserContext";

function IndexInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [tela, setTela] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.warn(user.profileType);
        switch (user.profileType) {
          case "JOGADOR":
            setTela("/(DashBoard)/(tabs)/Partidas");
            break;
          case "TORCEDOR":
            setTela("/(DashBoard)/(tabs)/Home");
            break;
          case "ATLETICA":
            setTela("/(DashBoard)/(tabs)/Teams");
            break;
          default:
            setTela("/(DashBoard)/(tabs)/Home");
        }
      } else {
        setTela("login");
      }
      setIsLoading(false);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!isLoading && tela) {
      console.log("Navegando para:", tela);
      router.replace(tela as any);
    }
  }, [isLoading, tela]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.orange} />
      </View>
    );
  }

  return null;
}

export default function Index() {
  return <IndexInner />;
}
