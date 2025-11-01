import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function getUserData() {  // Pega o userData
  if (Platform.OS === "web") {
    const data = localStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  }
  const data = await SecureStore.getItemAsync("userData");
  return data ? JSON.parse(data) : null;
}
