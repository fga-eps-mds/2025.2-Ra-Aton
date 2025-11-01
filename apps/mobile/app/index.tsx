import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "@/libs/storage/getToken";
import { getUserData } from "@/libs/storage/getUserData";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const userData = await getUserData();
          console.log("Usuário logado:", userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log("Erro ao verificar token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // O " [] " faz a função rodar 1x e não toda renderização

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(DashBoard)/Home" />;
  }

  return <Redirect href="/(Auth)/cadastro" />;
}
