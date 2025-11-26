import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { api_route } from "../auth/api";

export type User = {
  id: string;
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
  loading: boolean;
  deleteAccount: () => void;
  confirmDelete: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      let data;
      if (Platform.OS === "web") {
        data = localStorage.getItem("userData");
      } else {
        data = await SecureStore.getItemAsync("userData");
      }
      if (data) setUserState(JSON.parse(data));
      setLoading(false);
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
    setLoading(false);
  };

  const logout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("userData");
      console.log("Apagando os dados do [localStorage]");
    } else {
      await SecureStore.deleteItemAsync("userData");
      console.log("Apagando os dados do [secureStorage]");
    }
    setUserState(null);
    setLoading(false);
    router.replace("/(Auth)/login");
  };

  const deleteAccount = async () => {
    if (!user || !user.name) {
      Alert.alert("Erro", "Usuário não encontrado")
    }
    try {
      setLoading(true);
      const res = await api_route.delete(`/users/${user.userName}`)
      if (res.status == 204) {
        Alert.alert(
          "Conta excluída",
          "Sua conta foi excluída com sucesso",
          [{ text: "OK", onPress: () => logout() }]
        )
      } else {
        throw new Error("Resposta inesperada do servidor");
      }
    } catch (err: any) {
      console.warn("[deleteAccount] erro:", err?.response ?? err?.message ?? err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Não foi possível excluir a conta. Tente novamente mais tarde.";
      Alert.alert("Erro ao excluir conta", msg);
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: deleteAccount },
      ],
    );
  };
  return (
    <UserContext.Provider value={{ user, setUser, logout, loading, deleteAccount, confirmDelete }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
