import { useEffect, useState } from "react";
import { UserProvider } from "@/libs/storage/UserContext";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "@/libs/storage/getToken";
import { getUserData } from "@/libs/storage/getUserData";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import { useUser } from "@/libs/storage/UserContext";

function IndexInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [tela, setTela] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      switch (user.profileType) {
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
    setIsLoading(false);
  }, [user]);

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

  if (tela) {
    return <Redirect href={`http://localhost:8081/${tela}`} />;
  }
  return null;
}

export default function Index() {
  return (
    <UserProvider>
      <IndexInner />
    </UserProvider>
  );
}
