import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const saveToken = async (token: string) => {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem("userToken", token);
    } catch (e) {
      console.warn(
        "LocalStorage indisponível. Não foi possível salvar o token.",
      );
    }
  } else {
    await SecureStore.setItemAsync("userToken", token);
  }
};
