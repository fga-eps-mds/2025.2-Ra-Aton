import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const USER_DATA_KEY = "userData";

export async function saveUserData(userData: Record<string, unknown>) {
  const json = JSON.stringify(userData);
  if (Platform.OS === "web") {
    localStorage.setItem(USER_DATA_KEY, json);
  } else {
    await SecureStore.setItemAsync(USER_DATA_KEY, json);
  }
}
