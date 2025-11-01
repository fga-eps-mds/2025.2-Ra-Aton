import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "@/libs/storage/getToken";
import { getUserData } from "@/libs/storage/getUserData";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
const [tela, setTela] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const userData = await getUserData();
        
          switch (userData.profileType) {
            case "JOGADOR":
            case "TORCEDOR":
            case "ATLETICA":
              setTela("Teams");
              break;
            default:
              setTela("Home");
          }
        } else {
          setTela("login");
        }
      } catch (error) {
        console.log("Erro ao verificar token:", error);
        setTela("cadastro");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);   // [] é pra rodar só 1x

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

  // Só faz o redirecionamento quando o estado estiver definido
  if (tela) {
    return <Redirect href={`http://localhost:8081/${tela}`} />;
  }

  return null;
}
