import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function getToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem("userToken");
  } else {
    return await SecureStore.getItemAsync("userToken");
  }
}