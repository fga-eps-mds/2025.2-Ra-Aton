import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const USER_TOKEN_KEY = "userToken";

export async function saveToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(USER_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
  }
}
