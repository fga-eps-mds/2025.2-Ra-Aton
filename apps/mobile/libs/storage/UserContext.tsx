import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { router } from "expo-router";

export type User = {
  name: string;
  userName: string;
  email: string;
  token: string;
  profileType?: string | null;
};

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      let data;
      if (Platform.OS === "web") {
        data = localStorage.getItem("userData");
      } else {
        data = await SecureStore.getItemAsync("userData");
      }
      if (data) setUserState(JSON.parse(data));
    };
    loadUser();
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);
    const userData = user ? JSON.stringify(user) : null;
    if (Platform.OS === "web") {
      if (userData) localStorage.setItem("userData", userData);
      else localStorage.removeItem("userData");
    } else {
      if (userData) SecureStore.setItemAsync("userData", userData);
      else SecureStore.deleteItemAsync("userData");
    }
  };

  const logout = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("userData");
    console.log("Apagando os dados do [localStorage]")
  } else {
    await SecureStore.deleteItemAsync("userData");
        console.log("Apagando os dados do [secureStorage]")
  }
  setUserState(null);
  router.replace("/(Auth)/login");
};
  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};