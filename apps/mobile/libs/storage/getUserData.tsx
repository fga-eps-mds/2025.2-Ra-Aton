import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const USER_DATA_KEY = "userData";

export async function getUserData() {
  if (Platform.OS === "web") {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }
  const data = await SecureStore.getItemAsync(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}
