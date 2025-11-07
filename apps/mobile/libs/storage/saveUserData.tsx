import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const saveUserData = async (user: object) => {
  const userData = JSON.stringify(user);
  if (Platform.OS === "web") {
    try {
      localStorage.setItem("userData", userData);
    } catch (e) {
      console.warn(
        "LocalStorage indisponível. Não foi possível salvar os dados do usuário.",
      );
    }
  } else {
    await SecureStore.setItemAsync("userData", userData);
  }
};