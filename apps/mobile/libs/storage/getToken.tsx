import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const USER_TOKEN_KEY = "userToken";

export async function getToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem(USER_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(USER_TOKEN_KEY);
}
